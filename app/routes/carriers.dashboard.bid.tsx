import {
  redirect,
  type LoaderFunction,
  json,
  type MetaFunction,
  type ActionFunction,
} from "@remix-run/node";
import {
  useLoaderData,
  Form,
  useActionData,
  useOutletContext,
  useSearchParams,
} from "@remix-run/react";
import { UpdateBid, DeleteBid } from "~/api/services/bid.service";
import { Disclosure } from "@headlessui/react";
import { commitSession, destroySession, getSession } from "../api/services/session";
import "flowbite";
import {
  ChevronUpIcon,
  ArrowRightIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import AccessDenied from "~/components/accessdenied";
import { authenticator } from "~/api/services/auth.server";
import { ErrorBoundary } from "~/components/errorBoundary";
import { useState, useEffect } from "react";
import { TimezoneAbbr } from "~/components/TimezoneAbbr";
import BidAdjustmentView from "~/components/bidadjustmentview";
import type { BidUpdateRequest } from "~/api/models/bidRequest";
import { LoadStatusBadge } from "~/components/statusBadge";
import ContactShipperView from "~/components/contactshipper";
import ChatWindow from "~/components/ChatWindow";
import { parseISO, isAfter } from 'date-fns';
import { LoadStatusIcon } from "~/components/LoadStatusIcon";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Afroinnovate | Carrier Dashboard | Bids",
      description: "Dashboard for viewing and managing carrier bids",
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);
    const carrierProfile = session.get("carrier");

    if (!user) {
      return redirect("/logout/");
    }

    if (user?.user.userType === "shipper") {
      return redirect("/shipper/dashboard/");
    }

    const timezone = session.get("timeZone") || "UTC";

    return json({
      carrierProfile: carrierProfile,
      timezone: timezone,
    });
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
  sender: 'user' | 'other';
  timestamp: Date;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action");
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);

  console.log("action", action);

  switch (action) {
    case "placebid": {
      console.log("action", action);
      const bidId = formData.get("bidId") as string;
      const bidAmount = formData.get("bidAmount") as string;
     
      if (!bidId || !bidAmount) {
        return json({ success: false, message: "Invalid bid data" });
      }

      const bidUpdateRequest: BidUpdateRequest = {
        updatedBy: user.user.id,
        bidAmount: parseFloat(bidAmount),
      };

      console.log("bidUpdateRequest", bidUpdateRequest);

      try {
        await UpdateBid(user.token, parseInt(bidId), bidUpdateRequest);
        return json({
          success: true,
          message: "Bid updated successfully",
          updatedBidId: parseInt(bidId),
          updatedBidAmount: parseFloat(bidAmount),
        });
      } catch (error) {
        console.error("Error updating bid:", error);
        return json({ success: false, message: "Failed to update bid" });
      }
    }

    case "delete_confirmed": {
      const bidId = formData.get("bidId") as string;

      try {
        await DeleteBid(user.token, parseInt(bidId));
        return json({
          success: true,
          message: "Bid withdrawn successfully",
          deletedBidId: parseInt(bidId),
        });
      } catch (error) {
        return json({ success: false, message: "Failed to withdraw bid" });
      }
    }

    case "closeContact":
      return json({
        success: true,
        message: "Contact modal closed",
      });

    case "sendMessage": {
      const message = formData.get("message") as string;
      let messages = session.get("chatMessages") || [];
      
      const newMessage: Message = {
        id: Date.now(),
        text: message,
        sender: 'user',
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
    
    case "contact":
      return json({
        success: true,
        message: "contactMode",
      });
      
    default:
      return json({ success: false, message: "Invalid action" });
  }

  // Handle other actions (remove, contact) here if needed

  return null;
};

export default function CarrierBidDashboard() {
  const loaderData: any = useLoaderData();
  const actionData = useActionData();
  const { bids } = useOutletContext<{ loads: any; bids: any }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [localBids, setLocalBids] = useState(bids);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const timezone = loaderData?.timezone || "UTC";
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [bidToDelete, setBidToDelete] = useState<number | null>(null)
  const [showContactShipper, setShowContactShipper] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [date, setDate] = useState(searchParams.get('date') || '');

  let error = "";
  let info = "";

  // Process errors or informational messages
  if (loaderData?.errno) {
    error = "Oops! Something went wrong. Please try again.";
  }

  // Extract user data from loader
  let carrierProfile: any = loaderData?.carrierProfile || {};

  useEffect(() => {
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    let filteredBids = bids;
    if (status && status !== 'all') {
      filteredBids = filteredBids.filter((bid: { bidStatus: { toString: () => string } }) => bid.bidStatus.toString() === status);
    }

    if (date) {
      const filterDate = parseISO(date);
      filteredBids = filteredBids.filter(bid => isAfter(parseISO(bid.biddingTime), filterDate));
    }

    setLocalBids(filteredBids);

    if (filteredBids.length === 0) {
      info = "No bids match the current filters.";
    } else {
      info = "";
    }
  }, [bids, searchParams]);

  // Update localBids if action was successful
  useEffect(() => {
    if (
      actionData &&
      typeof actionData === "object" && "success" in actionData && actionData.success
    ) {
      setLocalBids((prevBids: Array<{ id: number; bidAmount: number }>) =>
        prevBids.map((bid) =>
          bid.id ===
          (
            actionData as {
              success: boolean;
              updatedBidId: number;
              updatedBidAmount: number;
            }
          ).updatedBidId
            ? { ...bid, bidAmount: actionData.updatedBidAmount }
            : bid
        )
      );
      setSelectedBid(null); // Close the popup after successful update
    } else if (actionData && typeof actionData === 'object' && 'message' in actionData && actionData.message.includes("Canceled the Update")) {
      setSelectedBid(null); // Close the popup after successful update
    }
  }, [actionData]);

  useEffect(() => {
    if (actionData && typeof actionData === "object") {
      if ("deletedBidId" in actionData) {
        setLocalBids((prevBids) =>
          prevBids.filter((bid) => bid.id !== actionData.deletedBidId)
        );
        setBidToDelete(null); // Close the confirmation modal
      }
      if ("message" in actionData) {
        setFeedbackMessage(actionData.message as string);
        const timer = setTimeout(() => {
          setFeedbackMessage(null);
        }, 3000); // Message will disappear after 3 seconds

        return () => clearTimeout(timer);
      }
    }
  }, [actionData]);
  useEffect(() => {
    if (actionData && typeof actionData === "object" && "newMessage" in actionData) {
      setChatMessages((prevMessages) => [...prevMessages, actionData.newMessage as Message]);
    }
  }, [actionData]);

  // Add null check for carrierProfile.user and businessProfile
  if (
    carrierProfile?.user?.userType !== "carrier" ||
    !carrierProfile?.user?.businessProfile
  ) {
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have access to the carrier dashboard."
      />
    );
  }

  const currency = "ETB";

  function formatDateTime(
    dateTimeString: string,
    format: "date" | "time"
  ): string {
    const date = new Date(dateTimeString);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      ...(format === "date"
        ? { year: "numeric", month: "short", day: "numeric" }
        : { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  useEffect(() => {
    // Lazy load images for better performance
    const lazyImages = document.querySelectorAll("img[data-src]");
    if (lazyImages.length > 0) {
      const lazyImageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              img.src = img.dataset.src || "";
              img.removeAttribute("data-src");
              observer.unobserve(img);
            }
          });
        }
      );
      lazyImages.forEach((img) => lazyImageObserver.observe(img));

      // Clean up observer on component unmount
      return () => lazyImageObserver.disconnect();
    }
  }, []);

  const handleContactShipper = (shipper, load) => {
    setSelectedShipper(shipper || { firstName: 'Unknown', lastName: 'Shipper' });
    setSelectedLoad(load);
    setShowContactShipper(true);
  };

  const handleCloseContactShipper = () => {
    setShowContactShipper(false);
    setSelectedShipper(null);
    setSelectedLoad(null);
  };

  const handleOpenChat = () => {
    setShowContactShipper(false);
    setShowChatWindow(true);
  };

  const handleFilter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchParams({ status, date });
  };

  const handleReset = () => {
    setStatus('all');
    setDate('');
    setSearchParams({});
  };

  return (
    <div className="container mx-auto dark:bg-gray-800 p-4">
      {feedbackMessage && (
        <div
          className={`p-4 mb-4 text-center ${
            actionData &&
            typeof actionData === "object" &&
            "success" in actionData &&
            actionData.success
              ? "text-green-500 bg-green-100"
              : "text-orange-500 bg-orange-100"
          } rounded-lg transition-opacity duration-300 ${
            feedbackMessage ? "opacity-100" : "opacity-0"
          }`}
        >
          {feedbackMessage}
        </div>
      )}
      {error && (
        <div className="p-4 mb-4 text-center text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="flex justify-center items-center shadow-md mb-6">
        <h1 className="text-3xl font-bold mb-4 p-3 text-center text-white">
          Explore Bids Dashboard
        </h1>
      </div>
      {info && (
        <div className="p-4 mb-4 text-center text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-300">
          {info}
        </div>
      )}

      <form onSubmit={handleFilter} className="mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            name="status"
            className="p-2 border rounded bg-gray-700 text-white"
          >
            <option value="all">All Statuses</option>
            <option value="0">Pending</option>
            <option value="1">Accepted</option>
            <option value="2">Rejected</option>
          </select>
          <input
            type="date"
            name="date"
            className="p-2 border rounded bg-gray-700 text-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {localBids.map((bid: any) => (
          <Disclosure key={bid.id}>
            {({ open }) => (
              <div className="bg-gray-700 shadow rounded-lg">
                <Disclosure.Button className="flex flex-wrap justify-between items-center w-full p-4 text-left text-sm font-bold text-white hover:bg-gray-600">
                  <div className="flex flex-wrap items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
                    <h2 className="text-sm sm:text-lg sm:font-bold font-normal truncate max-w-[100px] sm:max-w-none">
                      {bid.load.origin}
                    </h2>
                    <ArrowRightIcon className="w-4 h-4 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" />
                    <h2 className="text-sm sm:text-lg sm:font-bold font-normal truncate max-w-[100px] sm:max-w-none">
                      {bid.load.destination}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 justify-end">
                    <span className="hidden sm:inline">
                      <LoadStatusBadge status={getStatusText(bid.bidStatus)} />
                    </span>
                    <span className="sm:hidden">
                      <LoadStatusIcon status={getStatusText(bid.bidStatus)} />
                    </span>
                    <span className="text-sm sm:text-lg font-normal sm:font-bold">
                      {currency} {bid.bidAmount}
                    </span>
                    <ChevronUpIcon
                      className={`hidden sm:block sm:w-6 sm:h-6 ${
                        open ? "transform rotate-180" : ""
                      } text-gray-300`}
                    />
                  </div>
                </Disclosure.Button>

                <Disclosure.Panel className="p-4 text-gray-300 bg-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg shadow-lg">
                      <h3 className="text-xl font-bold mb-2">Bid Details</h3>
                      <p key={`amount-${bid.id}`}>
                        Amount: {currency} {bid.bidAmount}
                      </p>
                      <p key={`date-${bid.id}`}>
                        Date: {formatDateTime(bid.biddingTime, "date")}
                      </p>
                      <p key={`time-${bid.id}`}>
                        Time: {formatDateTime(bid.biddingTime, "time")}{" "}
                        <TimezoneAbbr
                          dateTime={bid.biddingTime}
                          timezone={timezone}
                        />
                      </p>
                      <p key={`status-${bid.id}`}>
                        Status:{" "}
                        <LoadStatusBadge
                          status={getStatusText(bid.bidStatus)}
                        />
                      </p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg shadow-lg">
                      <h3 className="text-xl font-bold mb-2">Load Details</h3>
                      <p key={`route-${bid.id}`}>
                        Route: {bid.load.origin} to {bid.load.destination}
                      </p>
                      <p key={`pickup-${bid.id}`}>
                        Pickup: {formatDateTime(bid.load.pickupDate, "date")}
                      </p>
                      <p key={`delivery-${bid.id}`}>
                        Delivery:{" "}
                        {formatDateTime(bid.load.deliveryDate, "date")}
                      </p>
                      <p key={`weight-${bid.id}`}>
                        Weight: {bid.load.weight} kg
                      </p>
                      <p key={`offer-${bid.id}`}>
                        Shipper's Offer: {currency} {bid.load.offerAmount}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Form method="post">
                      <input type="hidden" name="bidId" value={bid.id} />
                      <button
                        type="button"
                        onClick={() =>
                          handleContactShipper(bid.load?.createdBy, bid.load)
                        }
                        className="p-2 m-2 bg-green-500 rounded-full hover:bg-green-600 group relative"
                        title="Contact Shipper"
                      >
                        <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
                        <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded">
                          Contact Shipper
                        </span>
                      </button>
                      <button
                        onClick={() => setSelectedBid(bid)}
                        className="p-2 m-2 bg-orange-400 rounded-full hover:bg-orange-500 group relative"
                        title="Update Bid"
                      >
                        <PencilIcon className="w-5 h-5 text-white" />
                        <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded">
                          Update Bid
                        </span>
                      </button>
                      <button
                        type="submit"
                        name="_action"
                        value="delete"
                        onClick={() => setBidToDelete(bid.id)}
                        className="p-2 m-2 bg-red-500 rounded-full hover:bg-red-600 group relative"
                        title="Withdraw Bid"
                      >
                        <TrashIcon className="w-5 h-5 text-white" />
                        <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded">
                          Withdraw Bid
                        </span>
                      </button>
                    </Form>
                  </div>
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        ))}
      </div>

      {showContactShipper && selectedShipper && (
        <ContactShipperView
          shipper={selectedShipper}
          load={selectedLoad}
          onClose={handleCloseContactShipper}
          onChat={handleOpenChat}
        />
      )}

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

      {selectedBid && (
        <BidAdjustmentView
          loadId={selectedBid.id.toString()}
          initialBid={selectedBid.bidAmount}
          onClose={() => setSelectedBid(null)}
        />
      )}

      {bidToDelete !== null && (
        <DeleteConfirmationModal
          bidId={bidToDelete}
          onCancel={() => setBidToDelete(null)}
        />
      )}
    </div>
  );
}

// Helper function to convert numeric status to text
function getStatusText(status: number): string {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Accepted";
    case 2:
      return "Rejected";
    default:
      return "Unknown";
  }
}

const DeleteConfirmationModal = ({
  bidId,
  onCancel,
}: {
  bidId: number;
  onCancel: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <h3 className="text-lg font-medium text-red-400 mb-4">Withdraw Bid</h3>
        <p className="text-sm text-gray-300 mb-6">
          Are you sure you want to withdraw this bid? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <Form method="post">
            <input type="hidden" name="bidId" value={bidId} />
            <button
              type="submit"
              name="_action"
              value="delete_confirmed"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
            >
              Withdraw
            </button>
          </Form>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

<ErrorBoundary />



