import {
  redirect,
  json,
  type ActionFunction,
  type MetaFunction,
} from "@remix-run/node";
import {
  NavLink,
  useActionData,
  useLoaderData,
  Form,
  useNavigation,
  useSubmit,
  useSearchParams,
  useOutletContext,
} from "@remix-run/react";
import { DeleteLoad, UpdateLoad } from "~/api/services/load.service";
import { Disclosure, Transition } from "@headlessui/react";
import { commitSession, getSession } from "../api/services/session";
import UpdateLoadView from "~/components/updateload";
import { authenticator } from "~/api/services/auth.server";
import { LoadInfoDisplay } from "~/components/loadViewHelpers";
import { useState, memo, useEffect } from "react";
import { parseISO, isAfter } from "date-fns";
import {
  ChevronUpIcon,
  TrashIcon,
  PencilIcon,
  ArrowRightIcon,
} from "@heroicons/react/20/solid";
import FilterComponent from "~/components/filterComponent";
import { LoadStatusBadge } from "~/components/statusBadge";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Afroinnovate | Loadboard | View Loads",
      description: "Dashboard for viewing the loads",
    },
  ];
};

export const loader = async ({ request }: any) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);

    if (!user) {
      return redirect("/logout/");
    }

    const shipperProfile = session.get("shipper");

    if (!shipperProfile) {
      return redirect("/logout/");
    }

    const shipperRole = shipperProfile.user.businessProfile.shipperRole;


    const hasAccess = [
     "independent_shipper",
     "corporate_shipper",
     "govt_shipper"
    ].includes(shipperRole);

    return json({
      profile: shipperProfile,
      hasAccess,
    });
  } catch (error: any) {
    if (JSON.parse(error).data.status === 401) {
      return redirect("/logout/");
    }
    throw error;
  }
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);

  if (!user) {
    return redirect("/login/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  const formData = await request.formData();
  const loadId = Number(formData.get("loadId"));
  const action = formData.get("_action");

  try {
    if (action === "edit") {
      console.log("Editing Load Mode");
      const load = {
        commodity: formData.get("commodity"),
        deliveryDate: formData.get("deliveryDate"),
        destination: formData.get("destination"),
        loadDetails: formData.get("loadDetails"),
        loadStatus: formData.get("loadStatus"),
        offerAmount: formData.get("offerAmount"),
        origin: formData.get("origin"),
        pickupDate: formData.get("pickupDate"),
        weight: formData.get("weight"),
        userId: user.user.id,
        loadId: loadId,
      };
      return json({ status: "editMode", load: load });
    } else if (action === "save_changes") {
      console.log("Saving Changes");
      const formattedPickupDate = new Date(
        (formData.get("pickupDate") as string) + "T12:00:00.000Z"
      ).toISOString();
      const formattedDeliveryDate = new Date(
        (formData.get("deliveryDate") as string) + "T12:00:00.000Z"
      ).toISOString();
      const formattedDate = new Date().toISOString();
      const Id =
        Number(formData.get("loadId")) !== 0 &&
        Number(formData.get("loadId")) !== undefined
          ? Number(formData.get("loadId"))
          : 99999;
      const requestBody: any = {
        commodity: formData.get("commodity") as string,
        deliveryDate: formattedDeliveryDate,
        destination: formData.get("destination") as string,
        loadDetails: formData.get("loadDetails") as string,
        loadStatus: formData.get("loadStatus") as string,
        offerAmount: Number(formData.get("offerAmount")),
        origin: formData.get("origin") as string,
        pickupDate: formattedPickupDate,
        weight: Number(formData.get("weight")),
        userId: user.user.id,
        modifiedBy: user.user.id,
        modified: formattedDate,
      };

      await UpdateLoad(user.token, Id, requestBody);
      return redirect("/shipper/dashboard/");
    } else if (action === "delete" && loadId) {
      console.log("Deleting Load with ID: ", loadId);
      return json({ status: "confirmation", loadId: loadId });
    } else if (action === "delete_confirmed") {
      await DeleteLoad(user.token, loadId);
      return redirect("/shipper/dashboard/loads/view/");
    } else if (action === "cancel") {
      return redirect("/shipper/dashboard/loads/view/");
    } else if (action === "clear") {
      console.log("Clearing Filters");
      return redirect("/shipper/dashboard/loads/view/");
    } else {
      throw JSON.stringify({
        data: {
          message: "Invalid Action",
          status: 400,
        },
      });
    }
  } catch (error: any) {
    console.log("Load View Error: ", error);
    if (JSON.parse(error).data.status === 401) {
      return redirect("/logout/");
    }
    return json({ status: `Failed to delete load, ${error.message}` });
  }
};

// Add this interface near the top of your file
interface ActionData {
  status?: string;
  loadId?: number;
}

interface OutletContext {
  loads: any;
  bids: any;
  theme: "light" | "dark";
  timeZone: string;
}

export default function ViewLoads() {
  const { hasAccess } = useLoaderData<typeof loader>();
  const { loads, theme, timeZone } = useOutletContext<OutletContext>();
  const actionData = useActionData() as ActionData;
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const navigation = useNavigation();

  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [minAmount, setMinAmount] = useState(
    searchParams.get("minAmount") || ""
  );
  const [origin, setOrigin] = useState(searchParams.get("origin") || "");
  const [destination, setDestination] = useState(
    searchParams.get("destination") || ""
  );
  const [localLoads, setLocalLoads] = useState(loads);

  useEffect(() => {
    let filteredLoads = loads;
    if (status && status !== "all") {
      filteredLoads = filteredLoads.filter(
        (load: any) => load.loadStatus.toLowerCase() === status.toLowerCase()
      );
    }
    if (minAmount) {
      filteredLoads = filteredLoads.filter(
        (load: any) => load.offerAmount >= parseFloat(minAmount)
      );
    }
    if (origin) {
      filteredLoads = filteredLoads.filter((load: any) =>
        load.origin.toLowerCase().includes(origin.toLowerCase())
      );
    }
    if (destination) {
      filteredLoads = filteredLoads.filter((load: any) =>
        load.destination.toLowerCase().includes(destination.toLowerCase())
      );
    }

    setLocalLoads(filteredLoads);
  }, [loads, status, minAmount, origin, destination]);

  const handleFilterChange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchParams({ status, minAmount, origin, destination });
  };

  const handleClearFilters = () => {
    setStatus("all");
    setMinAmount("");
    setOrigin("");
    setDestination("");
    setSearchParams({});
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedLoad(null);
  };

  const handleEditClick = (load: any) => {
    setSelectedLoad(load);
    setIsUpdateModalOpen(true);
  };

  let info = "";
  console.log("loads: ", loads);
  if (Object.keys(loads).length === 0) {
    info = "No loads posted, please check back later";
  }

  const currency = "ETB";

  return (
    <div className="container mx-auto px-4 py-2">
      <h1 className="text-3xl font-bold mb-8 text-center text-red-400">
        Manage Your Loads
      </h1>

      {!hasAccess && (
        <NavLink
          to="/shipper/dashboard/account/profile"
          className={`block w-full max-w-md mx-auto border px-6 py-3 rounded-lg text-center font-medium
            ${
              theme === "light"
                ? "border-green-800 text-green-900 hover:bg-green-600 hover:text-white hover:animate-pulse hover:transition hover:duration-300 "
                : "border-green-200 text-white hover:bg-green-700 hover:text-white hover:animate-pulse hover:transition hover:duration-300"
            }`}
        >
          Complete your profile to manage loads
        </NavLink>
      )}

      {hasAccess && (
        <>
          <Form method="get" onSubmit={handleFilterChange}>
            <FilterComponent
              filterConfig={{ status, minAmount, origin, destination }}
              filteredLoadsCount={localLoads.length}
              totalLoadsCount={loads.length}
              isSubmitting={navigation.state === "submitting"}
              onClear={handleClearFilters}
              onStatusChange={(e) => setStatus(e.target.value)}
              onMinAmountChange={(e) => setMinAmount(e.target.value)}
              onOriginChange={(e) => setOrigin(e.target.value)}
              onDestinationChange={(e) => setDestination(e.target.value)}
            />
          </Form>
          <div className="space-y-6">
            {localLoads.map((load: any) => (
              <Disclosure key={load.loadId}>
                {({ open }) => (
                  <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                    <Disclosure.Button className="w-full px-6 py-4 text-left focus:outline-none focus-visible:ring focus-visible:ring-red-400 focus-visible:ring-opacity-50">
                      <div className="flex justify-between items-center">
                        <div className="pl-2 flex items-center space-x-3">
                          <h2 className="text-lg font-bold text-white">
                            {load.origin}
                          </h2>
                          <ArrowRightIcon className="w-6 h-6 text-red-400" />
                          <h2 className="text-lg font-bold text-white">
                            {load.destination}
                          </h2>
                        </div>
                        <LoadInfoDisplay
                          load={load}
                          currency={currency}
                          background="bg-gray-700"
                          shadow="shadow-md"
                          offerColor="text-red-400"
                        />
                        <div className="flex items-center space-x-6">
                          <LoadStatusBadge status={load.loadStatus} />
                          <ChevronUpIcon
                            className={`${
                              open ? "transform rotate-180" : ""
                            } w-5 h-5 text-red-400`}
                          />
                        </div>
                      </div>
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-6 pt-2 pb-4 bg-gray-700 text-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <DetailItem
                            label="Pickup Date"
                            value={new Date(
                              load.pickupDate
                            ).toLocaleDateString()}
                          />
                          <DetailItem
                            label="Delivery Date"
                            value={new Date(
                              load.deliveryDate
                            ).toLocaleDateString()}
                          />
                          <DetailItem
                            label="Commodity"
                            value={load.commodity}
                          />
                          <DetailItem
                            label="Weight"
                            value={`${load.weight} kg`}
                          />
                          <DetailItem
                            label="Offer Amount"
                            value={`${currency} ${load.offerAmount}`}
                          />
                          <DetailItem
                            label="Details"
                            value={load.loadDetails}
                          />
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                          <ActionButton
                            type="edit"
                            loadId={load.loadId}
                            load={load}
                            onEdit={() => handleEditClick(load)}
                          />
                          <ActionButton type="delete" loadId={load.loadId} />
                        </div>
                      </Disclosure.Panel>
                    </Transition>
                  </div>
                )}
              </Disclosure>
            ))}
          </div>
        </>
      )}

      {isUpdateModalOpen && selectedLoad && (
        <UpdateLoadView
          {...(selectedLoad as Object)}
          onClose={handleCloseUpdateModal}
          isSuccess={isSuccess}
        />
      )}

      {actionData?.status === "confirmation" && (
        <DeleteConfirmationModal loadId={actionData?.loadId} />
      )}
    </div>
  );
}

const DetailItem = memo(({ label, value }: {label: string, value: string}) => {
  return (
    <div>
      <span className="font-medium text-gray-300">{label}: </span>
      <span className="text-white">{value}</span>
    </div>
  );
});

const ActionButton = memo(({ type, loadId, load, onEdit }: any) => {
  const config = {
    edit: {
      icon: PencilIcon,
      color: "text-blue-400 hover:text-blue-300",
      action: "edit",
    },
    delete: {
      icon: TrashIcon,
      color: "text-red-400 hover:text-red-300",
      action: "delete",
    },
  };

  const { icon: Icon, color, action } = config[type];

  return (
    <Form method="post">
      <input type="hidden" name="loadId" value={loadId} />
      {load &&
        Object.entries(load).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      <button
        type="submit"
        name="_action"
        value={action}
        onClick={type === "edit" ? onEdit : undefined}
        className={`p-2 rounded-full ${color} transition-colors duration-200`}
      >
        <Icon className="w-5 h-5" />
      </button>
    </Form>
  );
});

const DeleteConfirmationModal = memo(({ loadId }: {loadId: any}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <h3 className="text-lg font-medium text-red-400 mb-4">Delete Load</h3>
        <p className="text-sm text-gray-300 mb-6">
          Are you sure you want to delete this load? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-4">
          <Form method="post">
            <input type="hidden" name="loadId" value={loadId} />
            <button
              type="submit"
              name="_action"
              value="delete_confirmed"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
            >
              Delete
            </button>
          </Form>
          <Form method="post">
            <button
              type="submit"
              name="_action"
              value="cancel"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
});