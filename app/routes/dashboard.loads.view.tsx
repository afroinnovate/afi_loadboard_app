// routes/dashboard/loads/view.tsx
import { redirect, type LoaderFunction, json, type ActionFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import type { LoadResponse } from "~/api/models/loadResponse";
import { DeleteLoad, GetLoads } from "~/api/services/load.service";
import { Disclosure } from "@headlessui/react";
import { getSession } from "../api/services/session";
import {
  ChevronUpIcon,
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
  PencilIcon,
  XCircleIcon
} from "@heroicons/react/20/solid";

// const userData: LoginResponse = {
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZTJmMzJhZC1jNzc4LTQ3OWEtYjcyMi04OGU0MjdjM2I2ZmQiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IlRldyIsImVtYWlsIjoidGFuZ29nYXRkZXQ3NkBnbWFpbC5jb20iLCJuYW1laWQiOiJhZTJmMzJhZC1jNzc4LTQ3OWEtYjcyMi04OGU0MjdjM2I2ZmQiLCJqdGkiOiI1OWVkMDk5NS0xOGUxLTRlZTctOTNhMy1hY2NkZTBiODRiMDIiLCJuYmYiOjE3MDc4OTEzMTcsImV4cCI6MTcwNzg5NDkyMiwiaWF0IjoxNzA3ODkxMzIyLCJpc3MiOiJhZnJvaW5ub3ZhdGUuY29tIiwiYXVkIjoiYXBwLmxvYWRib2FyZC5hZnJvaW5ub3ZhdGUuY29tIn0.j9ELur-BylH84JgDOZO-jjr_ik6YXfF4KuJa-AMvhCg",
//   "isLockedOut": true,
//   "requiresTwoFactor": false,
//   "user": {
//       "id": "ae2f32ad-c778-479a-b722-88e427c3b6fd",
//       "userName": "tangogatdet76@gmail.com",
//       "email": "tangogatdet76@gmail.com",
//       "firstName": "Tango",
//       "lastName": "Tew",
//       "roles": [
//           "support",
//           "carrier"
//       ]
//   }
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

    // const response: LoadResponse = await GetLoads(userData.token);
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
    if (error.message.includes("401")) {
      return redirect("/login/");
    }

    // if it's not 401, throw the error
    return error;
  }
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    throw new Response("401 Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const loadId = Number(formData.get("loadId"));
  const action = formData.get("_action");
  console.log("ID: ",loadId)

  try {
    if (action === "edit" && loadId) {
      //
    }else if (action === "delete" && loadId) {
      return json("confirmation");
    } else if ( action === "delete_confirmed" ){
      await DeleteLoad(user.token, loadId);
      return redirect("/dashboard/loads/view/");
    }else if( action === "cancel" ){
      return redirect("/dashboard/loads/view/");
    }else {
      throw new Error("Invalid action");
    }
  } catch (error: any) {
    if (error.message.includes(401)){
      return redirect("/login/")
    }
    return new Response("Failed to delete load", { status: 500 });
  }
}

export default function ViewLoads() {
  const loaderData: any = useLoaderData(); 
  const actionData: any = useActionData();
 
  let error = ''
 
  if (loaderData && loaderData.errno) {
    if (loaderData.errno === "ENOTFOUND") {
      error =
        "Oopse!, you seem to have connectivity issue, please connect to a reliable internet.";
    }else {
      error = "Oops!, Something Went wrong, please try again.";
    }
  }else if (actionData && actionData.includes('Failed')) {
    error = "Ooops!, your load hasn't been deleted, please try again."
  }

  var loads: object = {};
  let user: any = {};
  if (loaderData.length == 2 && error === "") {
    loads = loaderData[0];
    user = loaderData[1];
  }
  
  var roles: string[] = [""];

 
  if (user && error === "") {
    user = user.user;
    roles = user.roles.map((role: string) => role.toLowerCase());
  }

  let confirm = ''
  if( actionData && actionData === 'confirmation'){
    confirm = actionData
  }
  // Check if user has 'support', 'admin' or any role containing 'carrier'
  const hasAccess = roles.includes('admin') || roles.some(role => role.includes('carrier'));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center shadow-md border-spacing-3 mb-6">
        <h1 className="text-2xl font-bold mb-4 p-6 text-center text-green-500">
          Manage your Loads with Ease
        </h1>
      </div>
      {error && <p className="text-center text-red-500">{error}</p>}
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
                            <input type="hidden" name="loadId" value={load.id} />
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
                      {load.loadStatus === 'open' ? (
                        <div className="flex items-center">
                          <LockOpenIcon className="w-5 h-5 text-orange-500" />
                          <span className="text-green-500"></span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <LockClosedIcon className="w-5 h-5 text-red-500" />
                          <span className="text-red-500">Closed</span>
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
                        <button
                          type="submit"
                          name="_action"
                          value="edit"
                          className={`px-4 py-2 mr-2 text-blue-700 rounded ${hasAccess ? 'bg-gray-100 hover:bg-orange-400' : 'bg-gray-400 cursor-not-allowed'}`}
                          disabled={!hasAccess}
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
                          className={`px-4 py-2 mr-2 text-red-700 rounded ${hasAccess ? ' hover:bg-orange-400' : 'bg-gray-400 cursor-not-allowed'}`}
                          disabled={!hasAccess}
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
    </div>
  );
}
