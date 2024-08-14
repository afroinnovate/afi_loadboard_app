import {
  redirect,
  type LoaderFunction,
  json,
  type ActionFunction,
  type MetaFunction,
} from "@remix-run/node";
import {
  NavLink,
  useActionData,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { GetLoads } from "~/api/services/load.service";
import { Disclosure } from "@headlessui/react";
import { commitSession, getSession } from "../api/services/session";
import "flowbite";
import {
  ChevronUpIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/20/solid";
import AccessDenied from "~/components/accessdenied";
import BidAdjustmentView from "~/components/bidadjustmentview";
import ContactShipperView from "~/components/contactshipper";
import { checkUserRole } from "~/components/checkroles";
import { manageBidProcess } from "~/api/services/bid.helper";
import { authenticator } from "~/api/services/auth.server";
import { redirectUser } from "~/components/redirectUser";
import { ErrorBoundary } from "~/components/errorBoundary";

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
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);

    const carrierProfile: any = session.get("carrier");
    const session_expiration: any = process.env.SESSION_EXPIRATION;
    const EXPIRES_IN = parseInt(session_expiration) * 1000; // Convert seconds to milliseconds
    if (isNaN(EXPIRES_IN)) {
      throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
    }

    if (!user) {
      return redirect("/login/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    const expires = new Date(Date.now() + EXPIRES_IN);

    if (user?.user.userType === "shipper") {
      return redirect("/dashboard/")
    }

    // check if the user is authorized to access this page, else redircdt them the appropriate page
    const shipperDashboard = await redirectUser(user?.user);
    if (shipperDashboard) {
      return redirect("/dashboard/", {
        headers: {
          "Set-Cookie": await commitSession(session, { expires }),
        },
      });
    }

    // Get the loads
    const response = await GetLoads(user.token);
    if (typeof response === "string") {
      throw response;
    }

    return json({ "loads": response, "carrierProfile": carrierProfile }, {
      headers: {
        "Set-Cookie": await commitSession(session, { expires }),
      },
    });
  } catch (error: any) {
    if (JSON.parse(error).data.status == 401) {
      const session = await getSession(request.headers.get("Cookie"));
      session.set("user", null);
      session.set("carrier", null);
      session.set("shipper", null);
      return redirect("/login/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
    throw error;
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);

    if (!user) {
      return redirect("/login/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    let carrierProfile: any = session.get("carrier");
    carrierProfile.token = user.token;

    const formData = await request.formData();
    const actionType = formData.get("_action");
    const bidLoadId = formData.get("bidLoadId");

    switch (actionType) {
      case "contact":
        return json({ error: "", message: "contactMode" });

      case "bid":
        return json({
          error: "",
          message: "bidMode",
          loadIdToBeBid: bidLoadId,
          offerAmount: formData.get("offerAmount"),
        });

      case "placebid":
        const bidAmount = formData.get("bidAmount");
        const bidDetails = await manageBidProcess(
          carrierProfile,
          Number(bidLoadId),
          Number(bidAmount)
        );
        return json({
          error: "",
          message: bidDetails.message,
          amount: bidDetails.amount,
        });

      case "closeContact":
        return redirect("/carriers/dashboard/view");

      default:
        throw new Error("Invalid action");
    }
  } catch (error: any) {
    if (JSON.parse(error).data.status == 401) {
      const session = await getSession(request.headers.get("Cookie"));
      session.set("user", null);
      session.set("carrier", null);
      session.set("shipper", null);
      return redirect("/login/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
    throw error;
  }
};

export default function CarrierViewLoads() {
  const loaderData: any = useLoaderData();
  const actionData: any = useActionData();

  console.log("action Data: ", actionData)
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
      (message.includes("bidPlaced") || message.includes("bidUpdatePlaced"))
    ) {
      info = `Bid placed/updated successfully. New amount: ${amount}`;
    } else if (actionError !== null || actionError !== undefined) {
      error = actionError;
    }
  }

  // Extract loads and user data from loader
  let loads = loaderData?.loads || [];
  let carrierProfile: any = loaderData?.carrierProfile || {};

  if (loaderData && !error) {
    loads = loaderData.loads;
  } else {
    error =
      "No loads found or something went wrong. Please try again later or contact support.";
  }

  if (Object.keys(loads).length === 0) {
    info = "No loads posted, please check back later";
  }
  
  console.log("view carrier: ",carrierProfile);
  
  // User roles and permission checks
  const [, shipperHasAccess, adminAccess, carrierAccess, carrierHasAccess] =
    checkUserRole(carrierProfile.roles, carrierProfile.businessProfile.carrierRole ?? "");
  
  console.log(carrierAccess, carrierHasAccess)

  let contactMode =
    actionData && actionData.message === "contactMode"
      ? actionData.message
      : "";
  let bidMode =
    actionData && actionData.message === "bidMode" ? actionData.message : ""; //bidmode confirmation

  let loadIdToBeBid = actionData?.loadIdToBeBid || null;
  let currentBid = actionData?.offerAmount || 0;

  // if (bidMode === "bidMode") {
  //   loadIdToBeBid = actionData.loadId;
  //   currentBid = actionData.offerAmount;
  // }

  // Utility function to determine styles based on load status
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-600";
      case "accepted":
        return "bg-gray-500";
      case "enroute":
        return "bg-red-500";
      default:
        return "bg-orange-500";
    }
  };

  // Conditional rendering for access denied or valid dashboard
  if (
    !shipperHasAccess &&
    !carrierHasAccess &&
    !adminAccess &&
    !carrierAccess
  ) {
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have access to the carrier dashboard."
      />
    );
  }

  const currency = "ETB";

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
                {contactMode === "contactMode" && (
                  <ContactShipperView shipper={load.createdBy} load={load} />
                )}

                {/* Bid Adjustment View */}
                {bidMode === "bidMode" && load.loadId && (
                  <BidAdjustmentView loadId={loadIdToBeBid} initialBid={currentBid} />
                )}

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
                      {currency} {load.offerAmount}
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
                      Estimated Delivery Date:{" "}
                      {new Date(load.deliveryDate).toLocaleDateString()}
                    </p>
                    <p>Commodity: {load.commodity}</p>
                    <p>Weight: {load.weight} kg</p>
                    <p>
                      Offer Amount: {currency} {load.offerAmount}
                    </p>
                    <p>Details: {load.loadDetails}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 mt-4">
                    {carrierAccess && !carrierHasAccess && (
                      <NavLink
                        to="/carriers/dashboard/account/business/"
                        className="inline-block bg-orange-500 text-white px-8 py-4 m-1 cursor-pointer transform transition hover:animate-pulse hover:-translate-x-10"
                      >
                        <button className="text-lg">
                          Please Complete your profile to pick up a load
                        </button>
                      </NavLink>
                    )}

                    {carrierHasAccess && (
                      <form method="post">
                        <input type="hidden" name="loadId" value={load.loadId} />
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
                        <input type="hidden" name="bidLoadId" value={load.loadId} />
                        <input
                          type="hidden"
                          name="offerAmount"
                          value={load.offerAmount}
                        />
                        <button
                          disabled={
                            load.loadStatus === "enroute" ||
                            load.loadStatus === "accepted" ||
                            load.loadStatus === "rejected" ||
                            load.loadStatus === "closed"
                          }
                          type="submit"
                          name="_action"
                          value="bid"
                          // make conditional formatting for the button based on the load status
                          className={`flex items-center px-4 py-2 text-sm font-medium text-orange-400 bg-gray-700 border border-orange-400 rounded hover:bg-orange-500 hover:text-white focus:outline-none ${
                            load.loadStatus === "enroute" ||
                            load.loadStatus === "accepted" ||
                            load.loadStatus === "rejected" ||
                            load.loadStatus === "closed"
                              ? "cursor-not-allowed"
                              : ""
                          }`}
                          // className="flex items-center px-4 py-2 text-sm font-medium text-blue-400 bg-gray-700 border border-blue-400 rounded hover:bg-blue-500 hover:text-white focus:outline-none"
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

<ErrorBoundary />;
