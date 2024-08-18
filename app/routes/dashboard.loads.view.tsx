import {
  redirect,
  type LoaderFunction,
  json,
  type ActionFunction,
  type MetaFunction,
} from "@remix-run/node";
import { NavLink, useActionData, useLoaderData, Form } from "@remix-run/react";
import { DeleteLoad, GetLoads, UpdateLoad } from "~/api/services/load.service";
import { Disclosure, Transition } from "@headlessui/react";
import {
  commitSession,
  getSession,
} from "../api/services/session";
import {
  ChevronUpIcon,
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
  PencilIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  MinusCircleIcon,
  EllipsisHorizontalCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/20/solid";
import UpdateLoadView from "~/components/updateload";
import { authenticator } from "~/api/services/auth.server";
import { type ShipperUser } from "../api/models/shipperUser";
import { ErrorBoundary } from "~/root";
import { LoadInfoDisplay } from "~/helpers/loadViewHelpers";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Afroinnovate | Loadboard | View Loads",
      description: "Dashboard for viewing the loads",
    },
  ];
};

const mapRoles: { [key: number]: string } = {
  0: "independentShipper",
  1: "corporateShipper",
  2: "govtShipper",
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user: any = session.get(authenticator.sessionKey);

    if (!user) {
      return redirect("/login/");
    }

    const shipperProfile: ShipperUser = session.get("shipper");
    if (!shipperProfile) {
      return redirect("/logout/");
    }

    const response: any = await GetLoads(user.token);
    if (response && typeof response === "string") {
      throw new Error(response);
    }

    const shipperRole =
      mapRoles[shipperProfile.user.businessProfile.shipperRole];
    const hasAccess = [
      "independentShipper",
      "corporateShipper",
      "govtShipper",
    ].includes(shipperRole);

    return json({ profile: shipperProfile, loads: response, hasAccess });
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
        Number(formData.get("loadId")) !== 0
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
      return redirect("/dashboard/");
    } else if (action === "delete" && loadId) {
      console.log("Deleting Load with ID: ", loadId);
      return json({ status: "confirmation", loadId: loadId });
    } else if (action === "delete_confirmed") {
      await DeleteLoad(user.token, loadId);
      return redirect("/dashboard/loads/view/");
    } else if (action === "cancel") {
      return redirect("/dashboard/loads/view/");
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

export default function ViewLoads() {
  const { profile, loads, hasAccess } = useLoaderData();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
 const [isSuccess, setIsSuccess] = useState(false);
  const actionData = useActionData();
  
  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedLoad(null);
  };

  const handleEditClick = (load: any) => {
    setSelectedLoad(load);
    setIsUpdateModalOpen(true);
  };

  const currency = "ETB";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-green-700">
        Manage Your Loads
      </h1>

      {!hasAccess && (
        <NavLink
          to="/shipper/profile"
          className="block w-full max-w-md mx-auto bg-orange-500 text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-orange-600 transition duration-300"
        >
          Complete your profile to manage loads
        </NavLink>
      )}

      {hasAccess && (
        <div className="space-y-6">
          {loads.map((load: any) => (
            <Disclosure key={load.loadId}>
              {({ open }) => (
                <div className="shadow-lg bg-gray-200 rounded-lg overflow-hidden">
                  <Disclosure.Button className="w-full px-6 py-4 text-left focus:outline-none focus-visible:ring focus-visible:ring-green-500 focus-visible:ring-opacity-50">
                    <div className="flex justify-between items-center">
                      <div className="pl-2 flex items-center space-x-3">
                        <h2 className="text-lg font-bold">{load.origin}</h2>
                        <ArrowRightIcon className="w-6 h-6 text-red-400" />
                        <h2 className="text-lg font-bold">
                          {load.destination}
                        </h2>
                      </div>
                      <LoadInfoDisplay
                        load={load}
                        currency={currency}
                        background="bg-gray-200"
                        shadow=""
                        offerColor="gray-600"
                      />
                      <div className="flex items-center space-x-4">
                        <LoadStatusBadge status={load.loadStatus} />
                        <ChevronUpIcon
                          className={`${
                            open ? "transform rotate-180" : ""
                          } w-5 h-5 text-green-500`}
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
                    <Disclosure.Panel className="px-6 pt-2 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <DetailItem
                          label="Pickup Date"
                          value={new Date(load.pickupDate).toLocaleDateString()}
                        />
                        <DetailItem
                          label="Delivery Date"
                          value={new Date(
                            load.deliveryDate
                          ).toLocaleDateString()}
                        />
                        <DetailItem label="Commodity" value={load.commodity} />
                        <DetailItem
                          label="Weight"
                          value={`${load.weight} kg`}
                        />
                        <DetailItem
                          label="Offer Amount"
                          value={`${currency} ${load.offerAmount}`}
                        />
                        <DetailItem label="Details" value={load.loadDetails} />
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
      )}

      {isUpdateModalOpen && selectedLoad && (
        <UpdateLoadView
          {...selectedLoad}
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

function LoadStatusBadge({ status }: { status: string }) {
  const statusConfig: {
    [key: string]: { icon: React.ElementType; color: string };
  } = {
    open: { icon: LockOpenIcon, color: "text-green-500" },
    closed: { icon: LockClosedIcon, color: "text-blue-500" },
    accepted: { icon: DocumentCheckIcon, color: "text-gray-500" },
    delivered: { icon: CheckCircleIcon, color: "text-green-600" },
    rejected: { icon: MinusCircleIcon, color: "text-red-500" },
    enroute: { icon: EllipsisHorizontalCircleIcon, color: "text-orange-400" },
  };

  const { icon: Icon, color } = statusConfig[status] || {};

  return (
    <div className={`flex items-center ${color}`}>
      {Icon && <Icon className="w-5 h-5 mr-1" />}
      <span className="capitalize">{status}</span>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-medium text-gray-600">{label}: </span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}

function ActionButton({
  type,
  loadId,
  load,
  onEdit,
}: {
  type: "edit" | "delete";
  loadId: number;
  load?: any;
  onEdit?: any
}) {
  const config = {
    edit: {
      icon: PencilIcon,
      color: "text-blue-600 hover:text-blue-700",
      action: "edit",
    },
    delete: {
      icon: TrashIcon,
      color: "text-red-600 hover:text-red-700",
      action: "delete",
    },
  };

  const { icon: Icon, color, action } = config[type];

  return (
    <Form method="post">
      <input type="hidden" name="loadId" value={loadId} />
      {load &&
        Object.entries(load).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value as string} />
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
}

function DeleteConfirmationModal({ loadId }: { loadId: number }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 className="text-lg font-medium text-red-600 mb-4">Delete Load</h3>
        <p className="text-sm text-gray-500 mb-6">
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
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}


// export default function ViewLoads() {
//   const loaderData: any = useLoaderData();
//   const actionData: any = useActionData();

//   let error = "";

//   if (loaderData && loaderData.errno) {
//     if (loaderData.errno === "ENOTFOUND") {
//       error =
//         "Oopse!, you seem to have connectivity issue, please connect to a reliable internet.";
//     } else {
//       error = "Oops!, Something Went wrong, please try again.";
//     }
//   } else if (
//     actionData !== undefined &&
//     actionData !== null &&
//     actionData !== "" &&
//     Object.entries(actionData).length > 0
//   ) {
//     console.log("actionData: ", actionData);
//     if (actionData.status.includes("Failed")) {
//       error = "Ooops!, your load hasn't been updated, please try again.";
//     } else if (actionData.status.includes("Failed")) {
//       error = "Ooops!, your load hasn't been updated, please try again.";
//     }
//   }

//   var loads: object = {};
//   let user: any = {};
//   let key: number = 0;
//   let profile: ShipperUser = {} as ShipperUser;
//   if (loaderData && error === "") {
//     loads = loaderData.loads;
//     profile = loaderData.profile;
//     key = profile.user.businessProfile.shipperRole;
//   } else {
//     error = "Ooops!, Something Went wrong, please try again.";
//   }

//   console.log("Action: ", actionData);

//   let confirm = "";
//   let editMode = "";
//   confirm =
//     actionData && actionData.status === "confirmation" ? actionData.status : ""; //deleteconfirmation
//   editMode =
//     actionData && actionData.status === "editMode" ? actionData.status : ""; //editmode confirmation
//   let updatingLoad: any = {};
//   if (editMode === "editMode") {
//     updatingLoad = actionData.load;
//   }
//   let loadIdToBeDeleted = 0;
//   if (confirm === "confirmation") {
//     loadIdToBeDeleted = actionData.loadId;
//   }

//   const shipperRole = mapRoles[key];

//   const [shipperAccess, shipperHasAccess] = checkUserRole(
//     [profile?.user.userType],
//     shipperRole
//   );

//   const currency = "ETB";

//   return (
//     <div className="container mx-auto px-4 py-4">
//       <div className="flex justify-center items-center shadow-md border-spacing-3 mb-3">
//         <h1 className="text-2xl font-san font-serif mb-4 p-3 text-center text-green-700 shadow-md shadow-gray-600">
//           Manage your Loads
//         </h1>
//       </div>
//       {error && <p className="text-center text-red-500">{error}</p>}
//       {shipperAccess && !shipperHasAccess && (
//         <NavLink
//           to="/shipper/profile"
//           className="flex justify-center bg-orange-500 text-white px-8 py-4 m-1 cursor-pointer transform transition hover:animate-pulse hover:-translate-x-10"
//         >
//           <button className="text-lg">
//             Please Complete your profile to pick up a load
//           </button>
//         </NavLink>
//       )}
//       {shipperHasAccess && (
//         <div className="space-y-4 pt-2">
//           {loads &&
//             Object.values(loads).map((load) => (
//               <Disclosure
//                 as="div"
//                 key={load.loadId}
//                 className="bg-white shadow rounded-lg"
//               >
//                 {({ open }) => (
//                   <>
//                     {editMode === "editMode" && (
//                       <UpdateLoadView
//                         commodity={updatingLoad.commodity}
//                         deliveryDate={updatingLoad.deliveryDate}
//                         destination={updatingLoad.destination}
//                         loadDetails={updatingLoad.loadDetails}
//                         loadStatus={updatingLoad.loadStatus}
//                         offerAmount={updatingLoad.offerAmount}
//                         origin={updatingLoad.origin}
//                         pickupDate={updatingLoad.pickupDate}
//                         weight={updatingLoad.weight}
//                         userId={user.userId}
//                         loadId={updatingLoad.loadId}
//                       />
//                     )}
//                     {confirm === "confirmation" && (
//                       <div className="fixed inset-0 z-50 overflow-y-auto">
//                         <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//                           <div className="fixed inset-0 transition-opacity">
//                             <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
//                           </div>

//                           <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
//                             <span className="absolute inset-0 bg-gray-500 opacity-75"></span>
//                           </span>
//                           <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//                             <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                               <div className="sm:flex sm:items-start">
//                                 <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
//                                   <h3 className="text-lg leading-6 font-medium text-red-600">
//                                     Delete Load
//                                   </h3>
//                                   <div className="mt-2">
//                                     <p className="text-sm text-gray-500">
//                                       Are you sure you want to delete this load?
//                                       This action cannot be undone.
//                                     </p>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="bg-gray-50 px-4 py-3 sm:px-6 md:flex sm:flex-row-reverse">
//                               <form method="post" className="bg-gray-100">
//                                 <input
//                                   type="hidden"
//                                   name="loadId"
//                                   value={loadIdToBeDeleted}
//                                 />
//                                 <button
//                                   type="submit"
//                                   name="_action"
//                                   value="delete_confirmed"
//                                   className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium hover:bg-red-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
//                                 >
//                                   <TrashIcon
//                                     className="w-6 h-6 text-red-500 hover:text-white"
//                                     aria-hidden="true"
//                                   />
//                                 </button>
//                               </form>
//                               <form method="post" className="bg-gray-100">
//                                 <button
//                                   type="submit"
//                                   name="_action"
//                                   value="cancel"
//                                   className="w-full inline-flex justify-left rounded-md border border-transparent shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
//                                 >
//                                   <XCircleIcon
//                                     className="w-6 h-6 text-orange-400 hover:text-white"
//                                     aria-hidden="true"
//                                   />
//                                 </button>
//                               </form>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                     <Disclosure.Button className="flex justify-between items-center w-full p-4 text-left text-sm font-bold text-green-800 hover:bg-green-50">
//                       <span>{`${load.origin} -> ${load.destination}`}</span>
//                       <span>{`${load.loadDetails}`}</span>
//                       <div className="flex items-center space-x-2">
//                         {load.loadStatus === "open" && (
//                           <div className="flex items-center">
//                             <LockOpenIcon className="w-5 h-5 text-green-500" />
//                             <span className="text-green-500">Open</span>
//                           </div>
//                         )}
//                         {load.loadStatus === "closed" && (
//                           <div className="flex items-center">
//                             <LockClosedIcon className="w-5 h-5 text-blue-500" />
//                             <span className="text-blue-500">Closed</span>
//                           </div>
//                         )}
//                         {load.loadStatus === "accepted" && (
//                           <div className="flex items-center">
//                             <DocumentCheckIcon className="w-5 h-5 text-gray-500" />
//                             <span className="text-gray-500">Accepted</span>
//                           </div>
//                         )}
//                         {load.loadStatus === "delivered" && (
//                           <div className="flex items-center">
//                             <CheckCircleIcon className="w-5 h-5 text-green-600" />
//                             <span className="text-green-600">Delivered</span>
//                           </div>
//                         )}
//                         {load.loadStatus === "rejected" && (
//                           <div className="flex items-center">
//                             <MinusCircleIcon className="w-5 h-5 text-red-500" />
//                             <span className="text-red-500">Rejected</span>
//                           </div>
//                         )}
//                         {load.loadStatus === "enroute" && (
//                           <div className="flex items-center">
//                             <EllipsisHorizontalCircleIcon className="w-5 h-5 text-orange-400" />
//                             <span className="text-orange-400">Enroute</span>
//                           </div>
//                         )}
//                         <ChevronUpIcon
//                           className={`${
//                             open ? "transform rotate-180" : ""
//                           } w-5 h-5 text-orange-500 font-extrabold`}
//                         />
//                       </div>
//                     </Disclosure.Button>
//                     <Disclosure.Panel className="p-2 pl-4 text-gray-500">
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <p>
//                           Pickup Date:{" "}
//                           {new Date(load.pickupDate).toLocaleDateString()}
//                         </p>
//                         <p>
//                           Estimated Delivery Date:{" "}
//                           {new Date(load.deliveryDate).toLocaleDateString()}
//                         </p>
//                         <p>Commodity: {load.commodity}</p>
//                         <p>Weight: {load.weight} kg</p>
//                         <p>
//                           Offer Amount: {currency} {load.offerAmount}
//                         </p>
//                         <p>Details: {load.loadDetails}</p>
//                       </div>
//                       <div className="flex justify-end space-x-2 mt-4">
//                         <form method="post">
//                           <input
//                             type="hidden"
//                             name="loadId"
//                             value={load.loadId}
//                           />
//                           <input
//                             type="hidden"
//                             name="origin"
//                             value={load.origin}
//                           />
//                           <input
//                             type="hidden"
//                             name="destination"
//                             value={load.destination}
//                           />
//                           <input
//                             type="hidden"
//                             name="pickupDate"
//                             value={load.pickupDate}
//                           />
//                           <input
//                             type="hidden"
//                             name="deliveryDate"
//                             value={load.deliveryDate}
//                           />
//                           <input
//                             type="hidden"
//                             name="commodity"
//                             value={load.commodity}
//                           />
//                           <input
//                             type="hidden"
//                             name="weight"
//                             value={load.weight}
//                           />
//                           <input
//                             type="hidden"
//                             name="offerAmount"
//                             value={load.offerAmount}
//                           />
//                           <input
//                             type="hidden"
//                             name="loadDetails"
//                             value={load.loadDetails}
//                           />
//                           <input
//                             type="hidden"
//                             name="loadStatus"
//                             value={load.loadStatus}
//                           />
//                           <button
//                             type="submit"
//                             name="_action"
//                             value="edit"
//                             className={`px-4 py-2 mr-2 text-blue-700 rounded ${
//                               shipperHasAccess
//                                 ? "bg-gray-100 hover:bg-orange-400"
//                                 : "bg-gray-400 cursor-not-allowed"
//                             }`}
//                             disabled={!shipperHasAccess}
//                           >
//                             <PencilIcon
//                               className="w-6 h-6 text-blue-700"
//                               aria-hidden="true"
//                             />
//                           </button>
//                         </form>
//                         <form method="post" className="bg-gray-100">
//                           <input
//                             type="hidden"
//                             name="loadId"
//                             value={load.loadId}
//                           />
//                           <button
//                             type="submit"
//                             name="_action"
//                             value="delete"
//                             className={`px-4 py-2 mr-2 text-red-700 rounded ${
//                               shipperHasAccess
//                                 ? " hover:bg-orange-400"
//                                 : "bg-gray-400 cursor-not-allowed"
//                             }`}
//                             disabled={!shipperHasAccess}
//                           >
//                             <TrashIcon
//                               className="w-6 h-6 text-red-700"
//                               aria-hidden="true"
//                             />
//                           </button>
//                         </form>
//                       </div>
//                     </Disclosure.Panel>
//                   </>
//                 )}
//               </Disclosure>
//             ))}
//         </div>
//       )}
//     </div>
//   );
// }

<ErrorBoundary />;
