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
  useNavigation,
} from "@remix-run/react";
import { GetBids, UpdateBid } from "~/api/services/bid.service";
import { Disclosure } from "@headlessui/react";
import { destroySession, getSession } from "../api/services/session";
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

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);

  if (action === "update") {
    const bidId = formData.get("bidId") as string;
    const bidAmount = formData.get("bidAmount") as string;
    
    const bidUpdateRequest: BidUpdateRequest = {
      bidStatus: 0, // Assuming 0 is for "Pending" status
      updatedBy: user.user.id,
      bidAmount: parseFloat(bidAmount),
    };

    try {
      await UpdateBid(user.token, parseInt(bidId), bidUpdateRequest);
      return json({ success: true, message: "Bid updated successfully" });
    } catch (error) {
      return json({ success: false, message: "Failed to update bid" });
    }
  }

  // Handle other actions (remove, contact) here if needed

  return null;
};

export default function CarrierBidDashboard() {
  const loaderData: any = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const { loads, bids } = useOutletContext<{ loads: any; bids: any }>();
  const [localBids, setLocalBids] = useState(bids);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const timezone = loaderData?.timezone || "UTC";

  let error = "";
  let info = "";

  // Process errors or informational messages
  if (loaderData?.errno) {
    error = "Oops! Something went wrong. Please try again.";
  }

  // Extract user data from loader
  let carrierProfile: any = loaderData?.carrierProfile || {};

  useEffect(() => {
    if (bids.length === 0) {
      info = "You haven't placed any bids yet.";
    } else {
      setLocalBids(bids);
    }
  }, [bids]);

  useEffect(() => {
    if (actionData?.success !== undefined) {
      setResponseMessage({
        type: actionData.success ? 'success' : 'error',
        message: actionData.message
      });
      if (actionData.success) {
        // Refresh bids after successful update
        setLocalBids(prevBids => 
          prevBids.map((bid: any) => 
            bid.id === selectedBid.id ? {...bid, bidAmount: selectedBid.bidAmount} : bid
          )
        );
      }
      // Clear the message after 3 seconds
      const timer = setTimeout(() => setResponseMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData, selectedBid]);

  // Add null check for carrierProfile.user and businessProfile
  if (carrierProfile?.user?.userType !== "carrier" || !carrierProfile?.user?.businessProfile) {
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have access to the carrier dashboard."
      />
    );
  }

  const currency = "ETB";

  function formatDateTime(dateTimeString: string, format: 'date' | 'time'): string {
    const date = new Date(dateTimeString);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      ...(format === 'date' 
        ? { year: "numeric", month: "short", day: "numeric" }
        : { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  useEffect(() => {
    // Lazy load images for better performance
    const lazyImages = document.querySelectorAll('img[data-src]');
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });
    lazyImages.forEach(img => lazyImageObserver.observe(img));

    // Clean up observer on component unmount
    return () => lazyImageObserver.disconnect();
  }, []);

  return (
    <div className="container mx-auto dark:bg-gray-800 p-4">
      {responseMessage && (
        <div
          className={`p-4 mb-4 text-center ${
            responseMessage.type === "success"
              ? "text-green-500 bg-green-100"
              : "text-red-500 bg-red-100"
          } rounded-lg`}
        >
          {responseMessage.message}
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

      <Form method="get" className="mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            name="status"
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="0">Pending</option>
            <option value="1">Accepted</option>
            <option value="2">Rejected</option>
          </select>
          <input
            type="date"
            name="date"
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Filter
          </button>
        </div>
      </Form>

      <div className="space-y-4">
        {localBids.map((bid: any) => (
          <Disclosure key={bid.id}>
            {({ open }) => (
              <div className="bg-gray-700 shadow rounded-lg">
                <Disclosure.Button className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full p-4 text-left text-sm font-bold text-white hover:bg-gray-600">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2 sm:mb-0">
                    <h2 className="text-lg font-bold">{bid.load.origin}</h2>
                    <ArrowRightIcon className="w-6 h-6 text-red-400 hidden sm:block" />
                    <h2 className="text-lg font-bold">
                      {bid.load.destination}
                    </h2>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <LoadStatusBadge status={getStatusText(bid.bidStatus)} />
                    <span className="text-lg font-bold">
                      {currency} {bid.bidAmount}
                    </span>
                    <div className="flex space-x-2">
                      <span
                        className="p-1 text-blue-400"
                        title="Contact Shipper"
                      >
                        <ChatBubbleLeftIcon className="w-5 h-5" />
                      </span>
                      <span className="p-1 text-yellow-400" title="Update Bid">
                        <PencilIcon className="w-5 h-5" />
                      </span>
                      <span className="p-1 text-red-400" title="Remove Bid">
                        <TrashIcon className="w-5 h-5" />
                      </span>
                    </div>
                    <ChevronUpIcon
                      className={`w-6 h-6 ${
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
                        Status: <LoadStatusBadge status={getStatusText(bid.bidStatus)} />
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
                        type="submit"
                        name="action"
                        value="contact"
                        className="p-2 m-2 bg-green-500 rounded-full hover:bg-green-600 group relative"
                        title="Contact Shipper"
                      >
                        <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
                        <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded">
                          Contact Shipper
                        </span>
                      </button>
                      <button
                        type="submit"
                        name="action"
                        value="update"
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
                        name="action"
                        value="remove"
                        className="p-2 m-2 bg-red-500 rounded-full hover:bg-red-600 group relative"
                        title="Remove Bid"
                      >
                        <TrashIcon className="w-5 h-5 text-white" />
                        <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded">
                          Remove Bid
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

      {selectedBid && (
        <BidAdjustmentView
          loadId={selectedBid.loadId}
          initialBid={selectedBid.bidAmount}
          onClose={() => setSelectedBid(null)}
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

<ErrorBoundary />


