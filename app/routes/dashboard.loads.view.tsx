// routes/dashboard/loads/view.tsx
import { redirect, type LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LoadResponse } from "~/api/models/loadResponse";
import { GetLoads } from "~/api/services/load.service";
import { Disclosure } from "@headlessui/react";
import { getSession } from "../api/services/session";
import {
  ChevronUpIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/20/solid";

// const userData: LoginResponse = {
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMjhlODJhYy1lZDFhLTQ3YTYtODAyNy05YTZmYzBhMGVmYjkiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IlRldyIsImVtYWlsIjoidGFuZ29nYXRkZXQ3NkBnbWFpbC5jb20iLCJuYW1laWQiOiIyMjhlODJhYy1lZDFhLTQ3YTYtODAyNy05YTZmYzBhMGVmYjkiLCJqdGkiOiJkNTA5ZjU0Zi1hZTAwLTQ1OWEtYjNlMy05ZTkyOTgwNTc2ZjMiLCJuYmYiOjE3MDc1MjU5OTksImV4cCI6MTcwNzUyOTYwNCwiaWF0IjoxNzA3NTI2MDA0LCJpc3MiOiJhZnJvaW5ub3ZhdGUuY29tIiwiYXVkIjoiYXBwLmxvYWRib2FyZC5hZnJvaW5ub3ZhdGUuY29tIn0.ODYisBMtvEFFUoFkUmOU1U93M8z6asAM3sfdC887Jjg",
//   "expiresIn": 3600,
//   "refreshToken": "eyJ",
//   "tokenType": "Bearer",
//   "user": {
//       "id": "228e82ac-ed1a-47a6-8027-9a6fc0a0efb9",
//       "userName": "tangogatdet76@gmail.com",
//       "email": "tangogatdet76@gmail.com",
//       "firstName": "Tango",
//       "lastName": "Tew",
//       "roles": [
//           "admin",
//           "owner_operator"
//       ]
//   }
// };

export const loader: LoaderFunction = async ({ request }) => {
  try {
   
    // Find the parent route match containing the user and token
    const session = await getSession(request.headers.get("Cookie"));
    const user: any = session.get("user");
    
    if(!user) {
      throw new Error("401 Unauthorized");
    }


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

export default function ViewLoads() {
  const loaderData: any = useLoaderData(); 
  let error = ''
 
  if (loaderData && loaderData.errno) {
    if (loaderData.errno === "ENOTFOUND") {
      error =
        "Oopse!, you seem to have connectivity issue, please connect to a reliable internet.";
    } else {
      error = "Oops!, Something Went wrong, please try again.";
    }
  }

  var loads: object = {};
  let user: any = {};
  if (loaderData.length == 2 && error === "") {
    loads = loaderData[0];
    user = loaderData[1];
  }
  
  var roles: string[] = [""];


  if (user) {
    user = user.user;
    roles = user.roles.map((role: string) => role.toLowerCase());
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
                          className={`px-4 py-2 text-white rounded ${hasAccess ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                          disabled={!hasAccess}
                        >
                          Edit
                        </button>
                      </form>
                      <form method="post">
                        <input type="hidden" name="loadId" value={load.id} />
                        <button
                          type="submit"
                          name="_action"
                          value="delete"
                          className={`px-4 py-2 text-white rounded ${hasAccess ? 'bg-red-500 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
                          disabled={!hasAccess}
                        >
                          Delete
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
