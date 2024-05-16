import {
  redirect,
  type LoaderFunction,
  json,
  type ActionFunction,
  type MetaFunction,
} from "@remix-run/node";
import { NavLink, useActionData, useLoaderData, useNavigate, useRouteError } from "@remix-run/react";
import { GetLoads } from "~/api/services/load.service";
import { Disclosure } from "@headlessui/react";
import { getSession } from "../api/services/session";
import "flowbite";
import {
  ChevronUpIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/20/solid";
import AccessDenied from "~/components/accessdenied";
import { useEffect, useState } from "react";
import BidAdjustmentView from "~/components/bidadjustmentview";
import ContactShipperView from "~/components/contactshipper";
import { LoginResponse } from "~/api/models/loginResponse";
import { dummyData } from "~/api/dummy/dummy-data";
import { checkUserRole } from "~/components/checkroles";
import { manageBidProcess } from "~/api/services/bid.helper";
import ErrorDisplay from "~/components/ErrorDisplay";

const userData: LoginResponse = {
  token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YzEzNGVmMC1lZmY4LTQ2NmUtOTU1ZS1lMTk1NzAwZDg2OTYiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IldhciIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiN2MxMzRlZjAtZWZmOC00NjZlLTk1NWUtZTE5NTcwMGQ4Njk2IiwianRpIjoiYmJmNmZhOTEtOTljYy00NzAxLWJkZWUtNWRkMWY3MWJhZTdmIiwibmJmIjoxNzE1ODYwMTMwLCJleHAiOjE3MTU4NjM3MzUsImlhdCI6MTcxNTg2MDEzNSwiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.m24wLWyItr-658y3ewUgh1rex8hOjvbxM_MCDeodp9s",
  tokenType: "Bearer",
  refreshToken: "eyJhbGci",
  expiresIn: 3600,
  user: {
    "id": "7c134ef0-eff8-466e-955e-e195700d8696",
    "userName": "tangotew@gmail.com",
    "email": "tangotew@gmail.com",
    "firstName": "Tango",
    "lastName": "War",
    "roles": [
        "owner_operator",
    ],
    "phoneNumber": "+15806471212"
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

export const loader = async ({ request }) => {
  try {
    // const session = await getSession(request.headers.get("Cookie"));
    // const user = session.get("user");

    const user: any = userData;

    if (!user) {
      throw new Error(
        JSON.stringify({
          data: {
            message: "Unauthorized",
            status: 401,
          },
        })
      );
    }

    const response = await GetLoads(user.token);
    // const response: Response = dummyData;
    
    if (typeof response === "string") {
      throw response;
    }

    return json([response, user]);
  } catch (error: any) {
    if(JSON.parse(error).data.status == 401){
      return redirect("/login/")
    }
    throw error;
  }
};

export const action = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get("user");

    // const user: any = userData;

    if (!user) {
      throw JSON.stringify({
        data: {
        message: "Unauthorized", 
        status: 401 
      }});
    }

    const formData = await request.formData();
    const actionType = formData.get("_action");
    const loadId = formData.get("loadId") 
    const bidLoadId = formData.get("bidLoadId")
 
    switch (actionType) {
      case "contact":
        return json({"error": "", "message": "contactMode" });

      case "bid":
        return json({
          "error": "",
          "message": "bidMode",
          "loadId":  bidLoadId,
          "offerAmount": formData.get("offerAmount")
        });

      case "placebid":
        const bidDetails = await manageBidProcess(user, loadId, formData);
        return json({"error": "", "message": bidDetails.message, "amount": bidDetails.amount});
      
      case "closeContact":
        return redirect("/carriers/dashboard/view");

      default:
        throw new Error("Invalid action");
    }
  } catch (error: any) {
    if(JSON.parse(error).data.status == 401){
      return redirect("/login/")
    }
    throw error;
  }
};

export default function CarrierViewLoads() {
  const loaderData: any = useLoaderData();
  const actionData: any = useActionData();
  const navigate = useNavigate();

  let error = "";
  let info = "";

  // Process errors or informational messages
  if (loaderData?.errno) {
    if (loaderData.errno === "ENOTFOUND") {
      error =
        "Oops! You have a connectivity issue. Please connect to a reliable internet.";
    } else {
      error = "Oops! Something went wrong. Please try again.";
    }
  } else if (actionData && actionData !== undefined) {
    const { actionError, message, amount } = actionData;
    if (message !== undefined && message.includes("bidMode")) {
      info = "You are in bid mode. Please place your bid.";
    } else if (message !== undefined && message.includes("bidNotPlaced")) {
      info = `Oops! Your bid wasn't placed/updated. Please try again. Amount: ${amount}`;
    } else if (
      message !== undefined &&
      (message.includes("bidPlaced") ||
      message.includes("bidUpdatePlaced"))
    ) {
      info = `Bid placed/updated successfully. New amount: ${amount}`;
    }
    else if (actionError !== null || actionError !== undefined) {
      error = actionError
    }
  }

  // Extract loads and user data from loader
  let loads = [];
  let user = {};
  if (Array.isArray(loaderData) && loaderData.length === 2 && !error) {
    loads = loaderData[0];
    user = loaderData[1];
  } else {
    error =
      "No loads found or something went wrong. Please try again later or contact support.";
  }

  if (Object.keys(loads).length === 0) {
    info = "No loads posted, please check back later";
  }

  // User roles and permission checks
  const [shipperAccess, shipperHasAccess, adminAccess, carrierAccess, carrierHasAccess] = checkUserRole(user?.user.roles);

  // Navigate away if unauthorized
  useEffect(() => {
    if ((shipperHasAccess || shipperAccess) && (!carrierHasAccess && !carrierAccess)) {
      navigate("/dashboard/");
    } 
  }, [shipperHasAccess, carrierHasAccess, shipperAccess, carrierAccess, navigate]);

  let contactMode = actionData && actionData.message === "contactMode" ? actionData.message : "";
  let bidMode = actionData && actionData.message === "bidMode" ? actionData.message : ""; //bidmode confirmation

  let loadIdToBeBid = 0;
  let currentBid = 0;
  if (bidMode === "bidMode") {
    loadIdToBeBid = actionData.loadId;
    currentBid = actionData.offerAmount;
  }

  // Utility function to determine styles based on load status
  const getStatusStyles = (status) => {
    switch (status) {
      case "open":
        return "bg-orange-500";
      case "accepted":
        return "bg-blue-500";
      case "enroute":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  // Conditional rendering for access denied or valid dashboard
  if (!shipperHasAccess && !carrierHasAccess && !adminAccess && !carrierAccess) {
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have access to the carrier dashboard."
      />
    );
  } 

  return (
    <div
      className={`container mx-auto dark:bg-gray-800 ${error ? "mb-4" : ""}`}
    >
      {error && (
        <div className="p-4 mb-2 text-center text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="flex justify-center items-center shadow-md mb-3">
        <h1 className="text-2xl font-serif mb-4 p-3 text-center text-white">
          Pick your Load and Hit the Road
        </h1>
      </div>
      {info && (
        <div className="p-4 mb-2 text-center text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-300">
          {info}
        </div>
      )}
      <div className="space-y-4 pt-2">
        {loads.map((load: any) => (
          <Disclosure
            as="div"
            key={load.id}
            className="bg-gray-700 shadow rounded-lg"
          >
            {({ open }) => (
              <>
                {/* Contact Shipper View */}
                {
                  contactMode === "contactMode" && (
                    <ContactShipperView
                      load={load}
                      shipper={load.createdBy}
                    />
                  )
                }

                {/* Bid Adjustment View */}
                {
                  bidMode === "bidMode" && (
                    <BidAdjustmentView
                      loadId={load.loadId}
                      initialBid={currentBid}
                    />
                  )
                }

                <Disclosure.Button className="flex justify-between items-center w-full p-4 text-left text-sm font-bold text-white hover:bg-gray-600">
                  <div className="pl-2 flex items-center space-x-3">
                    <h2 className="text-lg font-bold">{load.origin}</h2>
                    <ArrowRightIcon className="w-6 h-6 text-red-400" />
                    <h2 className="text-lg font-bold">{load.destination}</h2>
                  </div>
                  <div className="flex flex-col items-center justify-center flex-grow mx-4">
                    <span className="text-xs text-gray-400">Posted by</span>
                    <span className="text-sm font-medium text-gray-300">
                      {load.createdBy
                        ? `${load.createdBy.firstName} ${load.createdBy.lastName}`
                        : ""}
                    </span>
                    <span className="text-lg font-semibold text-blue-400">
                      ${load.offerAmount}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-medium py-1 px-2 rounded-full ${getStatusStyles(
                        load.loadStatus
                      )}`}
                    >
                      {load.loadStatus.charAt(0).toUpperCase() +
                        load.loadStatus.slice(1)}
                    </span>
                    <ChevronUpIcon
                      className={`w-8 h-8 ${
                        open ? "transform rotate-180" : ""
                      } text-gray-300`}
                    />
                  </div>
                </Disclosure.Button>

                {/* Conditional Panels */}
                <Disclosure.Panel className="p-2 pl-4 text-gray-300 bg-gray-800">
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

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 mt-4">
                  
                    {carrierAccess && (
                      <NavLink to="/carriers/profile" className="inline-block bg-orange-500 text-white px-8 py-4 m-1 cursor-pointer transform transition hover:animate-pulse hover:-translate-x-10">
                        <button className="text-lg">
                          Please Complete your profile to pick up a load
                        </button>
                      </NavLink>
                    )}

                    {carrierHasAccess && (
                      <form method="post">
                        <input type="hidden" name="loadId" value={ load.id } />
                        <button
                          type="submit"
                          name="_action"
                          value="contact"
                          className="flex items-center px-4 py-2 text-sm font-medium text-green-400 bg-gray-700 border border-green-400 rounded hover:bg-green-500 hover:text-white focus:outline-none"
                          aria-label="Contact Carrier"
                        >
                          <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                          Message Carrier
                        </button>
                      </form>
                    )}
                    {carrierHasAccess && (
                      <form method="post">
                        <input type="hidden" name="bidLoadId" value={ load.id } />
                        <input type="hidden" name="loadIdToBeBid" value={ loadIdToBeBid } />
                        <input
                          type="hidden"
                          name="offerAmount"
                          value={load.offerAmount}
                        />
                        <button
                          type="submit"
                          name="_action"
                          value="bid"
                          className="flex items-center px-4 py-2 text-sm font-medium text-blue-400 bg-gray-700 border border-blue-400 rounded hover:bg-blue-500 hover:text-white focus:outline-none"
                          aria-label="Place Bid"
                        >
                          <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                          Place a Bid
                        </button>
                      </form>
                    )}
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

export function ErrorBoundary() {
  try{
    const errorResponse: any = useRouteError();
    const jsonError = JSON.parse(errorResponse);
    const error = {
      message: jsonError.data.message,
      status: jsonError.data.status,
    };

    return <ErrorDisplay error={error} />;
  }catch(e){
    console.error(e);
    return <div>Something went wrong</div>
  }
}