import {
  redirect,
  type LoaderFunction,
  json,
  type MetaFunction,
} from "@remix-run/node";
import {
  useLoaderData,
  Form,
} from "@remix-run/react";
import { GetBids } from "~/api/services/bid.service";
import { Disclosure } from "@headlessui/react";
import { destroySession, getSession } from "../api/services/session";
import "flowbite";
import {
  ChevronUpIcon,
  ArrowRightIcon,
} from "@heroicons/react/20/solid";
import AccessDenied from "~/components/accessdenied";
import { authenticator } from "~/api/services/auth.server";
import { ErrorBoundary } from "~/components/errorBoundary";

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

    // Get the bids
    const response = await GetBids(user.token);
    console.log(response);
    if (typeof response === "string") {
      throw response;
    }

    return json({
      bids: response,
      carrierProfile: carrierProfile,
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

export default function CarrierBidDashboard() {
  const loaderData: any = useLoaderData();

  let error = "";
  let info = "";

  // Process errors or informational messages
  if (loaderData?.errno) {
    error = "Oops! Something went wrong. Please try again.";
  }

  // Extract bids and user data from loader
  let bids = loaderData?.bids || [];
  let carrierProfile: any = loaderData?.carrierProfile || {};

  if (loaderData && !error) {
    bids = loaderData.bids;
  } else {
    error = "No bids found or something went wrong. Please try again later or contact support.";
  }

  if (bids.length === 0) {
    info = "You haven't placed any bids yet.";
  }

  // Utility function to determine styles based on bid status
  const getStatusStyles = (status: number) => {
    switch (status) {
      case 0:
        return "bg-yellow-600 text-white";
      case 1:
        return "bg-green-600 text-white";
      case 2:
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getStatusText = (status: number) => {
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
  };

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

  function formatDate(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <div className="container mx-auto dark:bg-gray-800 p-4">
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
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Filter
          </button>
        </div>
      </Form>

      <div className="space-y-4">
        {bids.map((bid: any) => (
          <Disclosure key={bid.bidId}>
            {({ open }) => (
              <div className="bg-gray-700 shadow rounded-lg">
                <Disclosure.Button className="flex justify-between items-center w-full p-4 text-left text-sm font-bold text-white hover:bg-gray-600">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-bold">{bid.load.origin}</h2>
                    <ArrowRightIcon className="w-6 h-6 text-red-400" />
                    <h2 className="text-lg font-bold">{bid.load.destination}</h2>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyles(bid.bidStatus)}`}>
                      {getStatusText(bid.bidStatus)}
                    </span>
                    <span className="text-lg font-bold">
                      {currency} {bid.bidAmount}
                    </span>
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
                      <p key="amount">Amount: {currency} {bid.bidAmount}</p>
                      <p key="date">Date: {formatDate(bid.biddingTime)}</p>
                      <p key="time">Time: {formatTime(bid.biddingTime)}</p>
                      <p key="status">Status: {getStatusText(bid.bidStatus)}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg shadow-lg">
                      <h3 className="text-xl font-bold mb-2">Load Details</h3>
                      <p key="route">Route: {bid.load.origin} to {bid.load.destination}</p>
                      <p key="pickup">Pickup: {new Date(bid.load.pickupDate).toLocaleDateString()}</p>
                      <p key="delivery">Delivery: {new Date(bid.load.deliveryDate).toLocaleDateString()}</p>
                      <p key="weight">Weight: {bid.load.weight} kg</p>
                      <p key="offer">Shipper's Offer: {currency} {bid.load.offerAmount}</p>
                    </div>
                  </div>
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        ))}
      </div>
    </div>
  );
}

<ErrorBoundary />


