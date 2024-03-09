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
  MinusCircleIcon,
  EllipsisHorizontalCircleIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/20/solid";
import type { LoadRequest } from "~/api/models/loadRequest";
import UpdateLoadView from "~/components/updateload";
import AccessDenied from "~/components/accessdenied";
import { useEffect } from "react";

const userData: LoginResponse = {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxN2E4NjM5Mi00ZjZiLTQ2NjItOWJhMC0wMWQ2OTcwY2YyNjciLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IlRldyIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiMTdhODYzOTItNGY2Yi00NjYyLTliYTAtMDFkNjk3MGNmMjY3IiwianRpIjoiOTJjMmFiMmQtMGE1My00MWExLWEyYzktYjE3M2QwNTc1ZDA3IiwibmJmIjoxNzA5OTY1Njg4LCJleHAiOjE3MDk5NjkyOTMsImlhdCI6MTcwOTk2NTY5MywiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.trcE4MYAZ6zutVqzExwjIn9hvNQDIrUdTm8EXd-U3bc",
  "tokenType": "Bearer",
  "refreshToken": "eyJhbGci",
  "expiresIn": 3600,
  "user": {
    "id": "17a86392-4f6b-4662-9ba0-01d6970cf267",
    "userName": "tangotew@gmail.com",
    "email": "tangotew@gmail.com",
    "firstName": "Tango",
    "lastName": "Tew",
    "roles": [
        "owner_operator"
    ]
  }
};

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
    // // Find the parent route match containing the user and token
    // const session = await getSession(request.headers.get("Cookie"));
    // const user: any = session.get("user");
    const user: any = userData;

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
  const loadId = Number(formData.get("loadId"));
  const action = formData.get("_action");
  console.log("ID: ", loadId, "Action: ", action);
  console.log("Form Data: ", formData);

  try {
    if (action === "edit" && loadId) {
      return json("editMode");
    } else if (action === "save_changes") {
      console.log("Saving Changes");
      const data = formData.get("origin");
      console.log("Data: ", data);

      const formattedPickupDate = new Date(
        (formData.get("pickupDate") as string) + "T12:00:00.000Z"
      ).toISOString();
      const formattedDeliveryDate = new Date(
        (formData.get("deliveryDate") as string) + "T12:00:00.000Z"
      ).toISOString();

      console.log("loadId: ", formData.get("loadId"));
      const Id =
        Number(formData.get("loadId")) !== 0
          ? Number(formData.get("loadId"))
          : 99999;
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
      };

      const response = await UpdateLoad(user.token, Id, requestBody);
      if (response) {
        console.log("Response: ", response);
      }
      return redirect("/dashboard/loads/view/");
    } else if (action === "delete" && loadId) {
      return json("confirmation");
    } else if (action === "delete_confirmed") {
      await DeleteLoad(user.token, loadId);
      return redirect("/dashboard/loads/view/");
    } else if (action === "cancel") {
      return redirect("/dashboard/loads/view/");
    } else {
      throw new Error("Invalid action");
    }
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
    }
    user = loaderData[1];
  }

  var roles: string[] = [""];

  if (user && error === "") {
    user = user.user;
    roles = user.roles.map((role: string) => role.toLowerCase());
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
  } else {
    return (
      <div className="container mx-auto px-4 py-8 bg-slate-900 text-white">
        <div className="flex justify-center items-center shadow-md border-spacing-3 mb-3">
          <h1 className="text-2xl font-bold mb-4 p-3 text-center text-green-500 shadow-md shadow-white">
            Pick your Load and Hit the Road
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
                    {editMode === "editMode" && (
                      <UpdateLoadView
                        commodity={load.commodity}
                        deliveryDate={load.deliveryDate}
                        destination={load.destination}
                        loadDetails={load.loadDetails}
                        loadStatus={load.loadStatus}
                        offerAmount={load.offerAmount}
                        origin={load.origin}
                        pickupDate={load.pickupDate}
                        weight={load.weight}
                        userId={user.userId}
                        loadId={load.id}
                      />
                    )}
                    <Disclosure.Button className="flex justify-between items-center w-full p-4 text-left text-sm font-bold text-green-800 hover:bg-green-50">
                      <span>{`${load.origin} -> ${load.destination}`}</span>
                      <span>{`${load.loadDetails}`}</span>
                      <div className="flex items-center space-x-2">
                        {load.loadStatus === "open" && (
                          <div className="flex items-center">
                            <LockOpenIcon className="w-5 h-5 text-orange-500" />
                            <span className="text-green-500">Open</span>
                          </div>
                        )}
                        {/* {load.loadStatus === 'closed' && (
                          <div className="flex items-center">
                            <LockClosedIcon className="w-5 h-5 text-red-500" />
                            <span className="text-red-500">Closed</span>
                          </div>
                        )} */}
                        {load.loadStatus === "accepted" && (
                          <div className="flex items-center">
                            <DocumentCheckIcon className="w-5 h-5 text-blue-500" />
                            <span className="text-blue-500">Accepted</span>
                          </div>
                        )}
                        {/* {load.loadStatus === 'delivered' && (
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
                        )} */}
                        {load.loadStatus === "enroute" && (
                          <div className="flex items-center">
                            <EllipsisHorizontalCircleIcon className="w-5 h-5 text-green-400" />
                            <span className="text-orange-500">Enroute</span>
                          </div>
                        )}
                        <ChevronUpIcon
                          className={`${
                            open ? "transform rotate-180" : ""
                          } w-5 h-5 text-orange-500 font-extrabold`}
                        />
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
                            className={`px-4 py-2 mr-2 text-blue-700 rounded ${
                              shipperHasAccess
                                ? "bg-gray-100 hover:bg-orange-400"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                            disabled={!shipperHasAccess}
                          >
                            <PencilIcon
                              className="w-6 h-6 text-blue-700"
                              aria-hidden="true"
                            />
                          </button>
                        </form>
                        <form method="post" className="bg-gray-100">
                          <input type="hidden" name="loadId" value={load.id} />
                          <button
                            type="submit"
                            name="_action"
                            value="contact"
                            data-tooltip-target="tooltip-light"
                            data-tooltip-style="light"
                            className={`px-4 py-2 mr-2 text-orange-500 rounded ${
                              shipperHasAccess
                                ? " hover:bg-blue-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                            disabled={!shipperHasAccess }
                          >
                            <ChatBubbleLeftIcon
                              className="w-6 h-6 text-orange-500 hover:text-lg"
                              aria-hidden="true"
                            />
                          </button>
                          <div
                            id="tooltip-light"
                            role="tooltip"
                            className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 tooltip"
                          >
                            Contact Carrier...
                            <div
                              className="tooltip-arrow"
                              data-popper-arrow
                            ></div>
                          </div>
                        </form>
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            )
          )}
        </div>
      </div>
    );
  }
}
