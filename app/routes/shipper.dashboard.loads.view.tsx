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
import { useState, memo, useEffect, useMemo, useCallback } from "react";
import {
  ChevronUpIcon,
  TrashIcon,
  PencilIcon,
  ArrowRightIcon,
  CameraIcon,
  ChevronUpDownIcon
} from "@heroicons/react/20/solid";
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
      "govt_shipper",
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
  const { loads, theme } = useOutletContext<OutletContext>();
  const actionData = useActionData() as ActionData;
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const navigation = useNavigation();

  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [localLoads, setLocalLoads] = useState(loads);

  // Modify sortConfig to handle a single sort field
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });

  useEffect(() => {
    let filteredLoads = loads;
    if (status && status !== "all") {
      filteredLoads = filteredLoads.filter(
        (load: any) => load.loadStatus.toLowerCase() === status.toLowerCase()
      );
    }
    setLocalLoads(filteredLoads);
  }, [loads, status]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(event.target.value);
    setSearchParams({ status: event.target.value });
  };

  const handleClearFilters = () => {
    setStatus("all");
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

  const currency = "ETB";

  // Updated themeClasses with new styles
  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    card:
      theme === "dark"
        ? "bg-gray-700"
        : "bg-white shadow-md border border-gray-200 rounded-lg",
    button: {
      primary:
        theme === "dark"
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-blue-500 hover:bg-blue-600",
      secondary:
        theme === "dark"
          ? "bg-gray-600 hover:bg-gray-700"
          : "bg-gray-300 hover:bg-gray-400",
      danger:
        theme === "dark"
          ? "bg-red-600 hover:bg-red-700"
          : "bg-red-500 hover:bg-red-600",
    },
    text: {
      primary: theme === "dark" ? "text-white" : "text-gray-900",
      secondary: theme === "dark" ? "text-gray-300" : "text-gray-600",
    },
    heading: theme === "dark" ? "text-red-400" : "text-red-600",
    disclosureButton:
      "flex flex-col sm:flex-row justify-between items-center p-2 sm:p-4", // Responsive flex
    disclosureButtonText: "text-base sm:text-lg font-bold", // Responsive font sizes
    input:
      theme === "dark"
        ? "bg-transparent text-white border-green-500 hover:border-blue-500 focus:border-blue-500"
        : "bg-transparent text-gray-900 border-green-500 hover:border-blue-500 focus:border-blue-500",
    cameraIcon: "text-green-500",
    hintText: "text-green-500",
  };

  const handleSort = useCallback((key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  }, []);

  // Modify sortedAndFilteredLoads to handle single sort field and filtering
  const sortedAndFilteredLoads = useMemo(() => {
    let filteredLoads = localLoads;
    
    if (sortConfig.key) {
      filteredLoads.sort((a: any, b: any) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredLoads;
  }, [localLoads, sortConfig]);

  // Modify the getSortIcon function
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ChevronUpDownIcon className="w-4 h-4 inline-block ml-1" />;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  return (
    <div className={`container mx-auto px-4 py-2 ${themeClasses.container}`}>
      <h1 className={`text-3xl font-bold mb-8 text-center ${themeClasses.heading}`}>
        Manage Your Loads
      </h1>

      {!hasAccess && (
        <NavLink to="/shipper/dashboard/account/profile" className={`block w-full max-w-md mx-auto border px-6 py-3 rounded-lg text-center font-medium
            ${
              theme === "light"
                ? "border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                : "border-green-200 text-white hover:bg-green-700 hover:text-white"
            } hover:animate-pulse hover:transition hover:duration-300`}>
          Complete your profile to manage loads
        </NavLink>
      )}

      {hasAccess && (
        <>
          <div className="mb-4 flex flex-wrap items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center w-full md:w-auto">
              <CameraIcon className={`w-5 h-5 mr-2 ${themeClasses.cameraIcon}`} />
              <select
                value={status}
                onChange={handleFilterChange}
                className={`${themeClasses.input} px-4 py-2 rounded w-full md:w-auto border-2`}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="accepted">Accepted</option>
                <option value="enroute">Enroute</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button 
              onClick={() => handleSort("origin")} 
              className={`${themeClasses.input} px-4 py-2 rounded flex items-center justify-between w-full sm:w-auto border-2 transition-colors duration-200`}
            >
              <span className="mr-2">Origin</span> 
              <span>{getSortIcon("origin")}</span>
            </button>
            <button 
              onClick={() => handleSort("destination")} 
              className={`${themeClasses.input} px-4 py-2 rounded flex items-center justify-between w-full sm:w-auto border-2 transition-colors duration-200`}
            >
              <span className="mr-2">Destination</span> 
              <span>{getSortIcon("destination")}</span>
            </button>
            <button 
              onClick={() => handleSort("offerAmount")} 
              className={`${themeClasses.input} px-4 py-2 rounded flex items-center justify-between w-full sm:w-auto border-2 transition-colors duration-200`}
            >
              <span className="mr-2">Amount</span> 
              <span>{getSortIcon("offerAmount")}</span>
            </button>
            <button 
              onClick={() => handleSort("pickupDate")} 
              className={`${themeClasses.input} px-4 py-2 rounded flex items-center justify-between w-full sm:w-auto border-2 transition-colors duration-200`}
            >
              <span className="mr-2">Date</span> 
              <span>{getSortIcon("pickupDate")}</span>
            </button>
            <button
              onClick={handleClearFilters}
              className={`${themeClasses.button.secondary} px-4 py-2 rounded`}
            >
              Clear Filters
            </button>
          </div>
          <div className={`mb-4 ${themeClasses.hintText}`}>
            Showing {sortedAndFilteredLoads.length} of {loads.length} loads
          </div>
          <div className="space-y-6">
            {sortedAndFilteredLoads.map((load: any) => (
              <Disclosure key={load.loadId}>
                {({ open }) => (
                  <div
                    className={`${themeClasses.card} rounded-lg overflow-hidden shadow-lg`}
                  >
                    <Disclosure.Button
                      className={`w-full ${themeClasses.disclosureButton} ${themeClasses.text.primary}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-center w-full">
                        <div className="flex flex-wrap items-center space-x-3">
                          <h2
                            className={`font-bold ${themeClasses.disclosureButtonText}`}
                          >
                            {load.origin}
                          </h2>
                          <ArrowRightIcon
                            className={`w-6 h-6 ${themeClasses.heading}`}
                          />
                          <h2
                            className={`font-bold ${themeClasses.disclosureButtonText}`}
                          >
                            {load.destination}
                          </h2>
                        </div>
                        <LoadInfoDisplay
                          load={load}
                          currency={currency}
                          theme={theme}
                          className="mt-2 sm:mt-0" // Margin adjustment for small screens
                        />
                        <div className="flex items-center space-x-6 mt-2 sm:mt-0">
                          <LoadStatusBadge status={load.loadStatus} />
                          <ChevronUpIcon
                            className={`${
                              open ? "transform rotate-180" : ""
                            } w-5 h-5 ${themeClasses.heading}`}
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
                      <Disclosure.Panel
                        className={`px-6 pt-2 pb-4 ${themeClasses.text.secondary}`}
                      >
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
                            theme={theme}
                          />
                          <ActionButton
                            type="delete"
                            loadId={load.loadId}
                            theme={theme}
                          />
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
        <DeleteConfirmationModal loadId={actionData?.loadId} theme={theme} />
      )}
    </div>
  );
}

// Update DetailItem component to handle responsive font sizes and wrapping
const DetailItem = memo(
  ({ label, value }: { label: string; value: string }) => {
    const { theme } = useOutletContext<OutletContext>();
    const labelClass = theme === "dark" ? "text-gray-300" : "text-gray-600";
    const valueClass = theme === "dark" ? "text-white" : "text-gray-900";

    return (
      <div className="flex flex-col sm:flex-row">
        <span className={`font-medium ${labelClass} sm:w-1/3`}>{label}: </span>
        <span className={`sm:w-2/3 ${valueClass} text-sm sm:text-base`}>
          {value}
        </span>
      </div>
    );
  }
);

// Update ActionButton component to handle responsive sizes and wrapping
const ActionButton = memo(({ type, loadId, load, onEdit, theme }: any) => {
  const config = {
    edit: {
      icon: PencilIcon,
      color:
        theme === "dark"
          ? "text-blue-400 hover:text-blue-300"
          : "text-blue-600 hover:text-blue-500",
      action: "edit",
    },
    delete: {
      icon: TrashIcon,
      color:
        theme === "dark"
          ? "text-red-400 hover:text-red-300"
          : "text-red-600 hover:text-red-500",
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
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </Form>
  );
});

// Update DeleteConfirmationModal to handle theme
const DeleteConfirmationModal = memo(
  ({ loadId, theme }: { loadId: any; theme: string }) => {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div
          className={`${
            theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-900"
          } rounded-lg p-8 max-w-md w-full`}
        >
          <h3
            className={`text-lg font-medium ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            } mb-4`}
          >
            Delete Load
          </h3>
          <p className="text-sm mb-6">
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
                className={`${
                  theme === "dark"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-500 hover:bg-red-600"
                } px-4 py-2 text-white rounded transition-colors duration-200`}
              >
                Delete
              </button>
            </Form>
            <Form method="post">
              <button
                type="submit"
                name="_action"
                value="cancel"
                className={`${
                  theme === "dark"
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-gray-600 hover:bg-gray-700"
                } px-4 py-2 text-white rounded transition-colors duration-200`}
              >
                Cancel
              </button>
            </Form>
          </div>
        </div>
      </div>
    );
  }
);