// routes/dashboard/loads/view.tsx
import {
  redirect,
  type LoaderFunction,
  json,
  type ActionFunction,
  type MetaFunction,
} from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import type { LoadResponse } from "~/api/models/loadResponse";
import { DeleteLoad, GetLoads, UpdateLoad } from "~/api/services/load.service";
import { Disclosure } from "@headlessui/react";
import { getSession } from "../api/services/session";
import "flowbite";
import {
  ChevronUpIcon,
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
  PencilIcon,
  XCircleIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  QueueListIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/20/solid";
import type { LoadRequest } from "~/api/models/loadRequest";
import UpdateLoadView from "~/components/updateload";
import AccessDenied from "~/components/accessdenied";
import { useEffect } from "react";

// const userData: LoginResponse = {
  //   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxN2E4NjM5Mi00ZjZiLTQ2NjItOWJhMC0wMWQ2OTcwY2YyNjciLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IlRldyIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiMTdhODYzOTItNGY2Yi00NjYyLTliYTAtMDFkNjk3MGNmMjY3IiwianRpIjoiOGNmOGY0M2EtZDZmNC00NDQ2LWE1NTItMmQ1OWJkOGFmMGYwIiwibmJmIjoxNzEwMDQ1MDM4LCJleHAiOjE3MTAwNDg2NDMsImlhdCI6MTcxMDA0NTA0MywiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.gQY42hckvc0KQUI7PZUPej79pfD5OH2x9XGAAFktYWk",
  //   "tokenType": "Bearer",
  //   "refreshToken": "eyJhbGci",
  //   "expiresIn": 3600,
  //   "user": {
    //     "id": "17a86392-4f6b-4662-9ba0-01d6970cf267",
    //     "userName": "tangotew@gmail.com",
    //     "email": "tangotew@gmail.com",
    //     "firstName": "Tango",
    //     "lastName": "Tew",
    //     "roles": [
        //         "owner_operator"
    //     ]
//   }
// };

const carrier: any = {
  "id": "17a86392-4f6b-4662-9ba0-01d6970cf267",
  "userName": "tangotew@gmail.com",
  "email": "tangotew@gmail.com",
  "firstName": "Bol",
  "lastName": "Ring",
  "type":"Independent Carrier"
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | View Loads",
      description: "Dashboard for viewing the loads",
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    // Find the parent route match containing the user and token
    const session = await getSession(request.headers.get("Cookie"));
    const user: any = session.get("user");
    // const user: any = userData;

    if (!user) {
      throw new Error("401 Unauthorized");
    }

    // const response: LoadResponse = await GetLoads(userData.token);
    let response: LoadResponse = await GetLoads(user.token);
    
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

  // const user: any = userData;

  if (!user) {
    throw new Response("401 Unauthorized", { status: 401 });
  }
 
  const formData = await request.formData();
  console.log("LoadId: ", formData.get("loadId"));
  const loadId = Number(formData.get("loadId"));
  const action = formData.get("_action");
  console.log("ID: ", loadId, "Action: ", action);
  console.log("Form Data: ", formData);

  try {
    if (action === "contact" && loadId) {
      console.log("Contacting Carrier");
      return json("editMode");
    }
    return "editMode";
  } catch (error: any) {
    if (error.message.includes(401)) {
      return redirect("/login/");
    }
    return new Response("Failed to delete load", { status: 500 });
  }
};

export default function ShipperViewLoads() {
  const loaderData: any = useLoaderData();
  const actionData: any = useActionData();
  const navigate = useNavigate();
  
  let error = "";
  let info = "";

  if (loaderData && loaderData.errno) {
    if (loaderData.errno === "ENOTFOUND") {
      error =
        "Oopse!, you seem to have connectivity issue, please connect to a reliable internet.";
    } else {
      error = "Oops!, Something Went wrong, please try again.";
    }
  } else if (actionData && actionData.includes("Failed")) {
    error = "Ooops!, your load hasn't been deleted, please try again.";
  }

  var loads: any = {};
  let user: any = {};
  if (loaderData.length == 2 && error === "") {
    var loads = {};
    let i = 0;
    for (const load of Object.values(loaderData[0])) {
      if (
        load.loadStatus === "open" ||
        load.loadStatus === "accepted" ||
        load.loadStatus === "enroute"
      ) {
        loads[i] = load;
        i++;
      }
      load.poster = carrier;
    }
    user = loaderData[1];
  }else {
    error = "No loads found, Or something went wrong, please try again later or contact support";
  }

  if(Object.keys(loads).length === 0){
    info = "No loads posted, please check back later";
  }

  var roles: string[] = [""];

  if (Object.keys(user).length > 0 && error === "") {
    user = user.user;
    console.log("user", user);
    roles = user.roles.map((role: string) => role.toLowerCase());
    console.log("roles", roles);
  }else{
    roles = ["admin"];
  }

  let editMode = "";
  editMode = actionData && actionData === "editMode" ? actionData : ""; //editmode confirmation

  // Check if user has 'support', 'admin' or any role containing 'carrier'
  const carrierHasAccess =
    roles.includes("support") ||
    roles.includes("admin") ||
    roles.some((role) => role.includes("carrier"));
  const shipperHasAccess =
    roles.includes("shipper") ||
    roles.includes("admin") ||
    roles.some((role) => role.includes("owner_operator")) ||
    roles.some((role) => role.includes("dispatcher")) ||
    roles.some((role) => role.includes("company_driver")) ||
    roles.some((role) => role.includes("fleet_owner"));

  if (!shipperHasAccess && !carrierHasAccess) {
    console.log("access denied")
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have an access to the shipper dashboard"
      />
    );
  } else if (carrierHasAccess && !shipperHasAccess) {
    console.log("redirecting to dashboard")
    useEffect(() => {
      navigate('/dashboard/');
    }, []);
    // return redirect("/dashboard/");
  } else {
    return (
      <div className={`container mx-auto dark:bg-gray-800 ${error ? 'mb-4' : ''}`}>
        {error && (
          <div className="p-4 mb-2 text-center text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-300">
            {error}
          </div>
        )}
          <div className="flex justify-center items-center shadow-md border-spacing-3 mb-3">
           <h1 className="text-2xl font-san font-serif mb-4 p-3 text-center text-white shadow-md shadow-white">
             Pick your Load and Hit the Road
           </h1>
         </div>
         {info && (
           <div className="p-4 mb-2 text-center text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-300">
             {info}
            </div>
          )}
          <div className="space-y-4 pt-2">
            {loads && Object.values(loads).map((load) => (
              <Disclosure as="div" key={load.id} className="bg-gray-700 shadow rounded-lg">
                {({ open }) => (
                  <>
                    {/* Load Overview */}
                    <Disclosure.Button className="flex justify-between items-center w-full p-4 text-left text-sm font-bold text-white hover:bg-gray-600">
                       {/* Load route title */}
                      <div className="pl-2 flex items-center space-x-3">
                        <h2 className="text-lg font-bold">{load.origin}</h2>
                        <ArrowRightIcon className="w-6 h-6 text-red-400"/>
                        <h2 className="text-lg font-bold">{load.destination}</h2>
                      </div>

                      {/* Middle section with posted by and amount */}
                      <div className="flex flex-col items-center justify-center flex-grow mx-4">
                        <span className="text-xs text-gray-400">Posted by</span>
                        <span className="text-sm font-medium text-gray-300">{`${load.poster.firstName} ${load.poster.lastName}`}</span>
                        <span className="text-lg font-semibold text-blue-400">${load.offerAmount}</span>
                      </div>

                      {/* Status and expand icon */}
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-medium py-1 px-2 rounded-full ${getStatusStyles(load.loadStatus)}`}>
                          {load.loadStatus.charAt(0).toUpperCase() + load.loadStatus.slice(1)}
                        </span>
                        <ChevronUpIcon
                          className={`w-8 h-8 ${open ? "transform rotate-180" : ""} text-gray-300`}
                        />
                      </div>
                    </Disclosure.Button>
                    <Disclosure.Panel className="p-2 pl-4 text-gray-300 bg-gray-800">
                      {/* Load details */}
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
                      {/* Action buttons */}
                      <div className="flex justify-end space-x-2 mt-4">
                        <form method="post">
                          <input type="hidden" name="loadId" value={load.id} />
                          <input type="hidden" name="user" value={user} />
                          <button
                            type="submit"
                            name="_action"
                            value="contact"
                            className="flex items-center px-4 py-2 text-sm font-medium text-green-400 bg-gray-700 border border-green-400 rounded hover:bg-green-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            disabled={!shipperHasAccess}
                            aria-label="Contact Carrier"
                          >
                            <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                            Message Carrier
                          </button>
                        </form>
                        <form method="post">
                          <input type="hidden" name="loadId" value={load.id} />
                          <input type="hidden" name="user" value={user} />
                          <button
                            // onClick={() => handleBid(load.id)}
                            type="submit"
                            name="_action"
                            value="bid"
                            className="flex items-center px-4 py-2 text-sm font-medium text-blue-400 bg-gray-700 border border-blue-400 rounded hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={!shipperHasAccess}
                            aria-label="Place Bid"
                          >
                            <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                            Place a Bid
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
  // Utility function to determine styles based on the load status
  function getStatusStyles(status: any) {
    switch (status) {
      case 'open':
        return 'bg-orange-500';
      case 'accepted':
        return 'bg-blue-500';
      case 'enroute':
        return 'bg-yellow-500';
      // Add more cases as needed
      default:
        return 'bg-gray-500';
    }
  }
}


