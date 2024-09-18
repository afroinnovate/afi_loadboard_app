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
} from "@remix-run/react";
import { GetLoads } from "~/api/services/load.service";
import { Disclosure } from "@headlessui/react";
import { commitSession, destroySession, getSession } from "../api/services/session";
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
import { manageBidProcess } from "~/api/services/bid.helper";
import { authenticator } from "~/api/services/auth.server";
import { redirectUser } from "~/components/redirectUser";
import { ErrorBoundary } from "~/components/errorBoundary";
import { LoadInfoDisplay } from "~/helpers/loadViewHelpers";
import { useMemo, useState, useEffect } from "react";
import ChatWindow from "~/components/ChatWindow";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Afroinnovate | Loadboard  | View Loads",
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
      return redirect("/logout/");
    }

    const expires = new Date(Date.now() + EXPIRES_IN);

    if (user?.user.userType === "shipper") {
      return redirect("/shipper/dashboard/");
    }

    // check if the user is authorized to access this page, else redircdt them the appropriate page
    const shipperDashboard = await redirectUser(user?.user);
    if (shipperDashboard) {
      return redirect("/shipper/dashboard/", {
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

    return json(
      { loads: response, carrierProfile: carrierProfile },
      {
        headers: {
          "Set-Cookie": await commitSession(session, { expires }),
        },
      }
    );
  } catch (error: any) {
    if (JSON.parse(error).data.status == 401) {
      const session = await getSession(request.headers.get("Cookie"));

      return redirect("/login/", {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      });
    }
    throw error;
  }
};

interface Message {
  id: number;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
}

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
    const shipper = JSON.parse(formData.get("shipper") as string); // Parse the shipper info
    const contactLoad = JSON.parse(formData.get("load") as string); // Parse the shipper info
    console.log("bidLoadId", bidLoadId, "actionType", actionType);
    switch (actionType) {
      case "contact":
        return json({
          error: "",
          message: "contactMode",
          contactLoadShipper: shipper,
          contactLoad: contactLoad,
        });

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

      case "sendMessage": {
        const message = formData.get("message") as string;
        let messages = session.get("chatMessages") || [];

        const newMessage: Message = {
          id: Date.now(),
          text: message,
          sender: "user",
          timestamp: new Date(),
        };

        // messages.push(newMessage);
        session.set("chatMessages", messages);
        return json(
          { success: true, message: "Message sent successfully", newMessage },
          {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          }
        );
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (error: any) {
    let errorMessage = "Failed to process bid";
    if (error instanceof SyntaxError) {
      console.error("Syntax error:", error);
    } else {
      try {
        const parsedError = JSON.parse(error);
        if (parsedError.data.status == 401) {
          return redirect("/logout/");
        }
        errorMessage = parsedError.message || errorMessage;
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
      }
    }
    console.error("Bid process error:", error);
    return json({ error: errorMessage }, { status: 500 });
  }
};

export default function CarrierViewLoads() {
  const loaderData: any = useLoaderData();
  const actionData: any = useActionData();
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [selectedShipper, setSelectedShipper] = useState(null);

  // Memoize the error and info messages
  const { error, info } = useMemo(() => {
    let errorMsg = "";
    let infoMsg = "";

    // Process errors or informational messages
    if (loaderData?.errno) {
      if (loaderData.errno === "ENOTFOUND") {
        errorMsg =
          "Oops! You have a connectivity issue. Please connect to a reliable internet.";
      } else {
        errorMsg = "Oops! Something went wrong. Please try again.";
      }
    } else if (actionData && actionData !== undefined) {
      const { actionError, message, amount } = actionData;
      if (message !== undefined && message.includes("bidMode")) {
        infoMsg = "You are in bid mode. Please place your bid.";
      } else if (message !== undefined && message.includes("bidNotPlaced")) {
        infoMsg = `Oops! Your bid wasn't placed/updated. Please try again. Amount: ${amount}`;
      } else if (
        message !== undefined &&
        (message.includes("bidPlaced") || message.includes("bidUpdatePlaced"))
      ) {
        infoMsg = `Bid placed/updated successfully. New amount: ${amount}`;
      } else if (actionError !== null || actionError !== undefined) {
        errorMsg = actionError;
      }
    }

    return { error: errorMsg, info: infoMsg };
  }, [loaderData, actionData]);

  // Memoize the loads and carrier profile
  const { loads, carrierProfile, additionalInfo } = useMemo(() => {
    let loadsData = loaderData?.loads || [];
    let carrierProfileData: any = loaderData?.carrierProfile || {};
    let additionalInfoMsg = "";

    if (loaderData && !error) {
      loadsData = loaderData.loads;
    } else {
      additionalInfoMsg =
        "No loads found or something went wrong. Please try again later or contact support.";
    }

    if (Object.keys(loadsData).length === 0) {
      additionalInfoMsg = "No loads posted, please check back later";
    }

    return {
      loads: loadsData,
      carrierProfile: carrierProfileData,
      additionalInfo: additionalInfoMsg,
    };
  }, [loaderData, error]);

  const carrierHasAccess =
    carrierProfile.user.userType === "carrier" &&
    carrierProfile.user.businessProfile.carrierRole !== null
      ? true
      : false;

  const carrierAccess =
    carrierProfile.user.userType === "carrier" ? true : false;

  let contactMode =
    actionData && actionData.message === "contactMode"
      ? actionData.message
      : "";
  let contactLoadShipper =
    contactMode === "contactMode" ? actionData.contactLoadShipper : null;
  let contactLoad =
    contactMode === "contactMode" ? actionData.contactLoad : null;

  let bidMode =
    actionData && actionData.message === "bidMode" ? actionData.message : ""; //bidmode confirmation

  let loadIdToBeBid = actionData?.loadIdToBeBid || null;
  let currentBid = actionData?.offerAmount || 0;

  useEffect(() => {
    if (actionData && actionData.newMessage) {
      setChatMessages((prevMessages) => [...prevMessages, actionData.newMessage]);
    }
  }, [actionData]);

  const handleOpenChat = (shipper: any) => {
    setSelectedShipper(shipper);
    setShowChatWindow(true);
  };

  // Memoize the status styles function
  const getStatusStyles = useMemo(
    () => (status: string) => {
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
    },
    []
  );

  // Conditional rendering for access denied or valid dashboard
  if (carrierProfile.user.userType !== "carrier") {
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have access to the carrier dashboard."
      />
    );
  }

  const currency = "ETB";

  return (
    <div className="container mx-auto dark:bg-gray-800 max-w-7xl px-4 sm:px-6 lg:px-8">
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
      {(info || additionalInfo) && (
        <div className="p-4 mb-2 text-center text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-300">
          {info || additionalInfo}
        </div>
      )}
      <div className="space-y-4 pt-2">
        {loads.map((load: any) => (
          <Disclosure
            as="div"
            key={load.loadId}
            className="bg-gray-700 shadow rounded-lg"
          >
            {({ open }) => (
              <>
                {/* Contact Shipper View */}
                {contactMode === "contactMode" && (
                  <ContactShipperView
                    shipper={contactLoadShipper}
                    load={contactLoad}
                    onClose={() => setShowContactShipper(false)}
                    onChat={() => handleOpenChat(contactLoadShipper)}
                  />
                )}

                {/* Bid Adjustment View */}
                {bidMode === "bidMode" && load.loadId && (
                  <BidAdjustmentView
                    loadId={loadIdToBeBid}
                    initialBid={currentBid}
                  />
                )}

                <Disclosure.Button className="flex justify-between items-center w-full p-4 text-left text-sm font-bold text-white hover:bg-gray-600">
                  <div className="pl-2 flex items-center space-x-3">
                    <h2 className="text-lg font-bold">{load.origin}</h2>
                    <ArrowRightIcon className="w-6 h-6 text-red-400" />
                    <h2 className="text-lg font-bold">{load.destination}</h2>
                  </div>
                  <LoadInfoDisplay
                    load={load}
                    currency={currency}
                    background="bg-gray-800"
                    shadow="shadow-lg"
                    offerColor="white"
                  />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="flex flex-wrap justify-end space-x-2 mt-4">
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
                        <input
                          type="hidden"
                          name="loadId"
                          value={load.loadId}
                        />
                        <input
                          type="hidden"
                          name="shipper"
                          value={JSON.stringify(load.createdBy)}
                        />
                        <input
                          type="hidden"
                          name="load"
                          value={JSON.stringify(load)}
                        />
                        <button
                          type="submit"
                          name="_action"
                          value="contact"
                          className="flex items-center px-4 py-2 text-sm font-medium text-green-400 bg-gray-700 border border-green-400 rounded hover:bg-green-500 hover:text-white focus:outline-none"
                          aria-label="Contact Carrier"
                        >
                          <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                          Message Shipper
                        </button>
                      </form>
                    )}
                    {carrierHasAccess && (
                      <form method="post">
                        <input
                          type="hidden"
                          name="bidLoadId"
                          value={load.loadId}
                        />
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

      <ChatWindow
        isOpen={showChatWindow}
        onClose={() => setShowChatWindow(false)}
        recipientName={
          selectedShipper
            ? `${selectedShipper.firstName || "Unknown"} ${
                selectedShipper.lastName || "Shipper"
              }`
            : "Shipper"
        }
        messages={chatMessages}
      />
    </div>
  );
}

<ErrorBoundary />;
