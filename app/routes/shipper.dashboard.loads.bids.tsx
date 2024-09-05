import React, { useState } from "react";
import {
  useLoaderData,
  useActionData,
  Form,
  useSubmit,
  useNavigation,
  Link,
} from "@remix-run/react";
import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import {
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CameraIcon
} from "@heroicons/react/20/solid";
import { GetBids, UpdateBid } from "~/api/services/bid.service";
import { checkUserRole } from "~/components/checkroles";
import AccessDenied from "~/components/accessdenied";
import { ErrorBoundary } from "~/components/errorBoundary";
import { commitSession, getSession } from "~/api/services/session";
import ContactShipperView from "~/components/contactshipper";
import { authenticator } from "~/api/services/auth.server";
import { manageBidProcess } from "~/api/services/bid.helper";
import { BidUpdateRequest } from "~/api/models/bidRequest";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user: any = session.get(authenticator.sessionKey);
  var shipperProfile = session.get("shipper");

  const session_expiration: any = process.env.SESSION_EXPIRATION;
  const EXPIRES_IN = parseInt(session_expiration) * 1000; // Convert seconds to milliseconds
  if (isNaN(EXPIRES_IN)) {
    throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
  }

  const expires = new Date(Date.now() + EXPIRES_IN);

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  //refresh user session
  session.set("user", user);

  const bids = await GetBids(user.token);
  if (bids === null) {
    return json(
      { bids: [], user: shipperProfile, theme: "dark" },
      {
        headers: {
          "Set-Cookie": await commitSession(session, { expires }),
        },
      }
    );
  }
  return json({ bids, user, theme: "dark" },
    { headers: { "Set-Cookie": await commitSession(session, { expires }) } });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const shipper: any = session.get("shipper");
  
  if (!shipper) {
    return redirect("logout");
  }

  const formData = await request.formData();
  const action = formData.get("_action");
  const bidId = formData.get("bidId");
  const loadId = formData.get("loadId");
  const bidStatus = formData.get("bidStatus");

  switch (action) {
    case "accept":
      const request: BidUpdateRequest = {
        bidStatus: 1,
        updatedBy: shipper.id,
        bidAmount: 0,
      };
      try {
        const id = Number(bidId);
        await UpdateBid(shipper.token, id, request);
        return json({ success: true, message: "Bid status is changed to Accepted" });
      } catch (error: any) {
        console.log("Error accepting bid: ", error);
        return json({ error: JSON.parse(error).data.message }, { status: JSON.parse(error).data.status});
      }
    case "reject":
      // await RejectBid(bidId, user.token);
      return json({ success: true, message: "Bid rejected" });
    case "closeContact":
      return json({ closeContact: true });
    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
};


export default function BidsView() {
  const { bids, user, theme }: any = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [expandedBid, setExpandedBid] = useState(null);
  const [filterConfig, setFilterConfig] = useState({
    status: "all",
    minAmount: 0,
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [selectedCarrier, setSelectedCarrier] = useState(null);

  if (user.user.userType !== "shipper") {
    return (
      <AccessDenied
        returnUrl="/shipper/dashboard/loads/view"
        message="You do not have enough access to see your biddings. Click Home to complete your profile."
      />
    );
  }

  const handleSort = (key: any) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const handleFilter = (e: any) => {
    const { name, value } = e.target;
    setFilterConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpand = (id: any) => {
    setExpandedBid(expandedBid === id ? null : id);
  };

  const handleAction = (action: any, bidId: any) => {
    const formData = new FormData();
    formData.append("_action", action);
    formData.append("bidId", bidId);
    submit(formData, { method: "post" });
  };

  const filteredAndSortedBids = bids
    .filter(
      (bid: any) =>
        filterConfig.status === "all" || bid.bidStatus === filterConfig.status
    )
    .filter((bid: any) => bid.bidAmount >= filterConfig.minAmount)
    .sort((a: any, b: any) => {
      if (sortConfig.key) {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black",
    header: theme === "dark" ? "text-red-500" : "text-green-700",
    table: theme === "dark" ? "bg-gray-800" : "bg-white",
    tableHeader:
      theme === "dark" ? "bg-green-800 text-white" : "bg-green-600 text-white",
    tableRow:
      theme === "dark"
        ? "border-gray-700 hover:bg-gray-700"
        : "border-gray-200 hover:bg-gray-50",
    expandedRow: theme === "dark" ? "bg-gray-700" : "bg-gray-50",
    input:
      theme === "dark"
        ? "bg-gray-700 border-green-600 text-white"
        : "border-green-300 focus:ring-green-500",
    button:
      theme === "dark"
        ? "text-green-400 hover:text-green-300"
        : "text-green-600 hover:text-green-800",
    loader: theme === "dark" ? "border-green-400" : "border-green-500",
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${themeClasses.container}`}>
      <h1
        className={`text-3xl font-bold mb-8 text-center ${themeClasses.header}`}
      >
        Review Bids
      </h1>

      <div className="mb-4 flex items-center">
        <CameraIcon className={`w-5 h-5 mr-2 ${themeClasses.button}`} />
        <select
          name="status"
          onChange={handleFilter}
          className={`mr-2 p-2 rounded ${themeClasses.input}`}
        >
          <option value="all">All Status</option>
          <option value={0}>Pending</option>
          <option value={1}>Accepted</option>
          <option value={2}>Rejected</option>
        </select>
        <input
          type="number"
          name="minAmount"
          placeholder="Min Amount"
          onChange={handleFilter}
          className={`p-2 rounded ${themeClasses.input}`}
        />
      </div>

      <div
        className={`overflow-x-auto rounded-lg shadow ${themeClasses.table}`}
      >
        <table className="w-full">
          <thead>
            <tr className={themeClasses.tableHeader}>
              <th
                onClick={() => handleSort("carrier.firstName")}
                className="p-2 cursor-pointer"
              >
                Carrier
              </th>
              <th
                onClick={() => handleSort("bidAmount")}
                className="p-2 cursor-pointer"
              >
                Bid Amount
              </th>
              <th
                onClick={() => handleSort("bidStatus")}
                className="p-2 cursor-pointer"
              >
                Status
              </th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedBids.map((bid: any) => (
              <React.Fragment key={bid.id}>
                <tr
                  className={`border-b ${themeClasses.tableRow} cursor-pointer`}
                  onClick={() => handleExpand(bid.id)}
                >
                  <td className="p-2 text-center">{`${bid.carrier.firstName} ${bid.carrier.lastName}`}</td>
                  <td className="p-2 text-center">${bid.bidAmount}</td>
                  <td className="p-2 text-center">
                    {["Pending", "Accepted", "Rejected"][bid.bidStatus]}
                  </td>
                  <td className="p-2 text-center">
                    {expandedBid !== bid.id && (
                      <div className="flex justify-center items-center space-x-2">
                        <Form method="post" className="inline">
                          <button
                            type="submit"
                            name="_action"
                            value="accept"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction("accept", bid.id);
                            }}
                            className={`mr-2 ${themeClasses.button}`}
                          >
                            <CheckCircleIcon className="w-5 h-5 text-green-600 hover:text-green-800" />
                          </button>
                        </Form>
                        <Form method="post" className="inline">
                          <button
                            type="submit"
                            name="_action"
                            value="reject"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction("reject", bid.id);
                            }}
                            className={`mr-2 ${
                              theme === "dark"
                                ? "text-red-400 hover:text-red-300"
                                : "text-red-600 hover:text-red-800"
                            }`}
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        </Form>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCarrier(bid.carrier);
                          }}
                          className={
                            theme === "dark"
                              ? "text-blue-400 hover:text-blue-300"
                              : "text-blue-600 hover:text-blue-800"
                          }
                        >
                          <PhoneIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {expandedBid === bid.id && (
                      <ChevronUpIcon className="w-5 h-5" />
                    )}
                  </td>
                </tr>
                {expandedBid === bid.id && (
                  <tr>
                    <td
                      colSpan={4}
                      className={`p-4 ${themeClasses.expandedRow}`}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className={`font-bold ${themeClasses.header}`}>
                            Carrier Details
                          </h3>
                          <p className="text-gray-200">
                            Name:{" "}
                            {`${bid.carrier.firstName} ${bid.carrier.lastName}`}
                          </p>
                          <p className="text-gray-200">
                            Phone: {bid.carrier.phone}
                          </p>
                          <p className="text-gray-200">
                            Email: {bid.carrier.email}
                          </p>
                          <p className="text-gray-200">
                            Company: {bid.carrier.companyName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3 className={`font-bold ${themeClasses.header}`}>
                            Load Details
                          </h3>
                          <p className="text-gray-200">
                            Origin: {bid.load.origin}
                          </p>
                          <p className="text-gray-200">
                            Destination: {bid.load.destination}
                          </p>
                          <p className="text-gray-200">
                            Pickup Date: {bid.load.pickupDate}
                          </p>
                          <p className="text-gray-200">
                            Delivery Date: {bid.load.deliveryDate}
                          </p>
                          <p className="text-gray-200">
                            Commodity: {bid.load.commodity}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-4">
                        <Form method="post" className="inline">
                          <button
                            type="submit"
                            name="_action"
                            value="accept"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction("accept", bid.id);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                          >
                            Accept
                          </button>
                        </Form>
                        <Form method="post" className="inline">
                          <button
                            type="submit"
                            name="_action"
                            value="reject"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction("reject", bid.id);
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </Form>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCarrier(bid.carrier);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Contact
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {navigation.state === "submitting" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div
            className={`animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 ${themeClasses.loader}`}
          ></div>
        </div>
      )}

      {selectedCarrier && (
        <ContactShipperView
          shipper={selectedCarrier}
          load={null}
          onClose={() => setSelectedCarrier(null)}
        />
      )}
    </div>
  );
}

<ErrorBoundary />;