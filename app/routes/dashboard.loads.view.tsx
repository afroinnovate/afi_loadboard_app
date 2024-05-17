// routes/dashboard/loads/view.tsx
import { redirect, type LoaderFunction, json, type ActionFunction } from "@remix-run/node";
import { NavLink, useActionData, useLoaderData, useRouteError } from "@remix-run/react";
import type { LoadResponse } from "~/api/models/loadResponse";
import { DeleteLoad, GetLoads, UpdateLoad } from "~/api/services/load.service";
import { Disclosure } from "@headlessui/react";
import { getSession } from "../api/services/session";
import {
  ChevronUpIcon,
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
  PencilIcon,
  XCircleIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  MinusCircleIcon,
  EllipsisHorizontalCircleIcon
} from "@heroicons/react/20/solid";
import type { LoadRequest } from "~/api/models/loadRequest";
import UpdateLoadView from "~/components/updateload";
import { checkUserRole } from "~/components/checkroles";
import ErrorDisplay from '~/components/ErrorDisplay';
import { dummyData } from "~/api/dummy/dummy-data";

// const userData: LoginResponse = {
//   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YzEzNGVmMC1lZmY4LTQ2NmUtOTU1ZS1lMTk1NzAwZDg2OTYiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IldhciIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiN2MxMzRlZjAtZWZmOC00NjZlLTk1NWUtZTE5NTcwMGQ4Njk2IiwianRpIjoiYmJmNmZhOTEtOTljYy00NzAxLWJkZWUtNWRkMWY3MWJhZTdmIiwibmJmIjoxNzE1ODYwMTMwLCJleHAiOjE3MTU4NjM3MzUsImlhdCI6MTcxNTg2MDEzNSwiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.m24wLWyItr-658y3ewUgh1rex8hOjvbxM_MCDeodp9s",
//   tokenType: "Bearer",
//   refreshToken: "eyJhbGci",
//   expiresIn: 3600,
//   user: {
//     id: "7c134ef0-eff8-466e-955e-e195700d812321",
//     userName: "tangogatdet76@gmail.com",
//     email: "tangogatdet76@gmail.com",
//     firstName: "Pal",
//     lastName: "Kuoth",
//     roles: ["shipper"],
//     phoneNumber: "+15806471212",
//   },
// };

export const loader: LoaderFunction = async ({ request }) => {
  try {
   
    // Find the parent route match containing the user and token
    const session = await getSession(request.headers.get("Cookie"));
    const user: any = session.get("user");

    // const user: any = userData;
    
    if(!user) {
      throw new Error("401 Unauthorized");
    }

    // const response: LoadResponse = dummyData;
    const response: LoadResponse = await GetLoads(user.token);
  
    if (response && typeof response === "string") {
      throw new Error(response);
    }
    if (typeof response === "string") {
      // Assuming your GetLoads function returns an error message as string on failure
      throw new Error(response);
    }

    return json([response, user]);
  } catch (error: any) {
    console.error("Error: ", error);
    if (JSON.parse(error).data.status === 401) {
      return redirect("/login/");
    }

    // if it's not 401, throw the error
    throw error;
  }
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  // const user: any = userData;

  if (!user) {
    throw new Response("401 Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const loadId = Number(formData.get("loadId"));
  const action = formData.get("_action");
  console.log("ID: ",loadId, "Action: ", action)

  try {
    if (action === "edit" && loadId) {
        console.log("Editing Load Mode")
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
        console.log("Load: ", load)
        return json({"status": "editMode", "load": load});
    }else if ( action === "save_changes"){
      console.log("Saving Changes")
      console.log("LoadDetails: ", formData.get("loadDetails"));
      
      const formattedPickupDate = new Date(formData.get("pickupDate") as string + 'T12:00:00.000Z').toISOString();
      const formattedDeliveryDate = new Date(formData.get("deliveryDate") as string + 'T12:00:00.000Z').toISOString();
      const formattedDate = new Date().toISOString();

      console.log("loadId: ", formData.get("loadId"));
      const Id = Number(formData.get("loadId")) !== 0 ? Number(formData.get("loadId")) : 99999;
      const requestBody: LoadRequest = {
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
        modified: formattedDate
      }

      const response = await UpdateLoad(user.token, Id, requestBody);
      if (response) {
        console.log("Response: ", response)
      }
      return redirect("/dashboard/loads/view/");
    }else if ( action === "delete" && loadId ) {
      console.log("Deleting Load with ID: ", loadId)
      return json({"status": "confirmation", "loadId": loadId});
    }else if ( action === "delete_confirmed" ){
      await DeleteLoad(user.token, loadId);
      return redirect("/dashboard/loads/view/");
    }else if( action === "cancel" ){
      return redirect("/dashboard/loads/view/");
    }else {
      throw new Error({"status":"Invalid action"});
    }
  } catch (error: any) {
    if (error.message.includes(401)){
      return redirect("/login/")
    }
    return json({"status": `Failed to delete load, ${error.message}`});
  }
};

export default function ViewLoads() {
  const loaderData: any = useLoaderData(); 
  const actionData: any = useActionData();
 
  let error = ''
 
  console.log("ActionData: ", actionData)
  if (loaderData && loaderData.errno) {
    if (loaderData.errno === "ENOTFOUND") {
      error =
        "Oopse!, you seem to have connectivity issue, please connect to a reliable internet.";
    }else {
      error = "Oops!, Something Went wrong, please try again.";
    }
  }else if (actionData !== undefined && actionData !== null && actionData !== "" && Object.entries(actionData).length > 0) {
    console.log("actionData: ", actionData)
    if (actionData.status.includes("Failed")) {
      error = "Ooops!, your load hasn't been updated, please try again.";
    }else if (actionData.status.includes("Failed")) {
        error = "Ooops!, your load hasn't been updated, please try again.";
    }
  }

  var loads: object = {};
  let user: any = {};
  if (loaderData.length == 2 && error === "") {
    loads = loaderData[0];
    user = loaderData[1];
  }else{
    error = "Ooops!, Something Went wrong, please try again.";
  }
  
  var roles: string[] = [""];

 
  if(Object.keys(user).length > 0 && error === "") {
    user = user.user;
    roles = user.roles.map((role: string) => role.toLowerCase());
  }else{  
    error = "Ooops!, Something Went wrong, please try again.";
  }

  let confirm = ''
  let editMode = ''
  confirm =  actionData && actionData.status === 'confirmation' ? actionData.status : ''; //deleteconfirmation
  editMode = actionData && actionData.status === 'editMode' ? actionData.status : ''; //editmode confirmation
  let updatingLoad: any = {}
  if (editMode === 'editMode') {
    updatingLoad = actionData.load;
  }
  let loadIdToBeDeleted = 0;
  if (confirm === 'confirmation') {
    loadIdToBeDeleted = actionData.loadId;
  }
  const [shipperAccess, shipperHasAccess, adminAccess, carrierAccess, carrierHasAccess] = checkUserRole(user?.roles);
  
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-center items-center shadow-md border-spacing-3 mb-3">
        <h1 className="text-2xl font-san font-serif mb-4 p-3 text-center text-green-700 shadow-md shadow-gray-600">
          Manage your Loads
        </h1>
      </div>
      {error && <p className="text-center text-red-500">{error}</p>}
      {shipperAccess && (
        <NavLink to="/shipper/profile" className="flex justify-center bg-orange-500 text-white px-8 py-4 m-1 cursor-pointer transform transition hover:animate-pulse hover:-translate-x-10">
          <button className="text-lg">
            Please Complete your profile to pick up a load
          </button>
        </NavLink>
      )}
    {shipperHasAccess && (
      <div className="space-y-4 pt-2">
        {loads &&
          Object.values(loads).map((load) => (
            <Disclosure
              as="div"
              key={load.id}
              className="bg-white shadow rounded-lg"
            >
              {({ open }) => (
                <>
                  { editMode === 'editMode' && (
                   <UpdateLoadView 
                      commodity={updatingLoad.commodity} 
                      deliveryDate={updatingLoad.deliveryDate} 
                      destination={updatingLoad.destination} 
                      loadDetails={updatingLoad.loadDetails} 
                      loadStatus={updatingLoad.loadStatus} 
                      offerAmount={updatingLoad.offerAmount} 
                      origin={updatingLoad.origin} 
                      pickupDate={updatingLoad.pickupDate} 
                      weight={updatingLoad.weight} 
                      userId={user.userId}
                      loadId={updatingLoad.loadId} 
                    />
                  )}
                  {confirm === 'confirmation' && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity">
                          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                          <span className="absolute inset-0 bg-gray-500 opacity-75"></span>
                        </span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                          <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                              <h3 className="text-lg leading-6 font-medium text-red-600">
                                Delete Load
                              </h3>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                  Are you sure you want to delete this load? This action cannot be undone.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 md:flex sm:flex-row-reverse">
                          <form method="post" className="bg-gray-100">
                            <input type="hidden" name="loadId" value={loadIdToBeDeleted} />
                            <button
                                type="submit"
                                name="_action"
                                value="delete_confirmed"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium hover:bg-red-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                              >
                              <TrashIcon className="w-6 h-6 text-red-500 hover:text-white" aria-hidden="true" />
                            </button>
                          </form>
                          <form method="post" className="bg-gray-100">
                            <button
                              type="submit"
                              name="_action"
                              value="cancel"
                              className="w-full inline-flex justify-left rounded-md border border-transparent shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                              <XCircleIcon className="w-6 h-6 text-orange-400 hover:text-white" aria-hidden="true" />
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}
                  <Disclosure.Button className="flex justify-between items-center w-full p-4 text-left text-sm font-bold text-green-800 hover:bg-green-50">
                    <span>{`${load.origin} -> ${load.destination}`}</span>
                    <span>{ `${load.loadDetails}` }</span>
                    <div className="flex items-center space-x-2">
                      {load.loadStatus === 'open' && (
                        <div className="flex items-center">
                          <LockOpenIcon className="w-5 h-5 text-orange-500" />
                          <span className="text-green-500">Open</span>
                        </div>
                      )}
                      {load.loadStatus === 'closed' && (
                        <div className="flex items-center">
                          <LockClosedIcon className="w-5 h-5 text-red-500" />
                          <span className="text-red-500">Closed</span>
                        </div>
                      )}
                      {load.loadStatus === 'accepted' && (
                        <div className="flex items-center">
                          <DocumentCheckIcon className="w-5 h-5 text-blue-500" />
                          <span className="text-blue-500">Accepted</span>
                        </div>
                      )}
                      {load.loadStatus === 'delivered' && (
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          <span className="text-green-600">Delivered</span>
                        </div>
                      )}
                      {load.loadStatus === 'rejected' && (
                        <div className="flex items-center">
                          <MinusCircleIcon className="w-5 h-5 text-red-500" />
                          <span className="text-red-500">Rejected</span>
                        </div>
                      )}
                      {load.loadStatus === 'enroute' && (
                        <div className="flex items-center">
                          <EllipsisHorizontalCircleIcon className="w-5 h-5 text-green-400" />
                          <span className="text-orange-500">Enroute</span>
                        </div>
                      )}
                      <ChevronUpIcon className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-orange-500 font-extrabold`} />
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="p-2 pl-4 text-gray-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <p>
                        Pickup Date:{" "}
                        {new Date(load.pickupDate).toLocaleDateString()}
                      </p>
                      <p>
                        Delivery Date:{" "}
                        {new Date(load.deliveryDate).toLocaleDateString()}
                      </p>
                      <p>Commodity: {load.commodity}</p>
                      <p>Weight: {load.weight} kg</p>
                      <p>Offer Amount: ${load.offerAmount}</p>
                      <p>Details: {load.loadDetails}</p>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <form method="post">
                        <input type="hidden" name="loadId" value={load.id} />
                        <input type="hidden" name="origin" value={load.origin} />
                        <input type="hidden" name="destination" value={load.destination} />
                        <input type="hidden" name="pickupDate" value={load.pickupDate} />
                        <input type="hidden" name="deliveryDate" value={load.deliveryDate} />
                        <input type="hidden" name="commodity" value={load.commodity} />
                        <input type="hidden" name="weight" value={load.weight} />
                        <input type="hidden" name="offerAmount" value={load.offerAmount} />
                        <input type="hidden" name="loadDetails" value={load.loadDetails} />
                        <input type="hidden" name="loadStatus" value={load.loadStatus} />
                        <button
                          type="submit"
                          name="_action"
                          value="edit"
                          className={`px-4 py-2 mr-2 text-blue-700 rounded ${shipperHasAccess ? 'bg-gray-100 hover:bg-orange-400' : 'bg-gray-400 cursor-not-allowed'}`}
                          disabled={!shipperHasAccess}
                        >
                          <PencilIcon className="w-6 h-6 text-blue-700" aria-hidden="true" />
                        </button>
                      </form>
                      <form method="post" className="bg-gray-100">
                        <input type="hidden" name="loadId" value={load.id} />
                        <button
                          type="submit"
                          name="_action"
                          value="delete"
                          className={`px-4 py-2 mr-2 text-red-700 rounded ${shipperHasAccess ? ' hover:bg-orange-400' : 'bg-gray-400 cursor-not-allowed'}`}
                          disabled={!shipperHasAccess}
                        >
                          <TrashIcon className="w-6 h-6 text-red-700" aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
      </div>
    )}
    </div>
  );
}

export function ErrorBoundary() {
  const errorResponse: any = useRouteError();
  const jsonError = JSON.parse(errorResponse);
  const error = {
    message: jsonError.data.message,
    status: jsonError.data.status
  };

  return <ErrorDisplay error={error} />;
}