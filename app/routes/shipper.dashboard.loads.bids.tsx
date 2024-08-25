import React, { useState } from "react";
import {
  useLoaderData,
  useActionData,
  Form,
  useSubmit,
  useNavigation,
  Link,
} from "@remix-run/react";
import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import {
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CameraIcon
} from "@heroicons/react/20/solid";
import { GetBids } from "~/api/services/bid.service";
import { checkUserRole } from "~/components/checkroles";
import AccessDenied from "~/components/accessdenied";
import { ErrorBoundary } from "~/components/errorBoundary";
import { commitSession, getSession } from "~/api/services/session";
import ContactShipperView from "~/components/contactshipper";
import { authenticator } from "~/api/services/auth.server";

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
  if (!bids) {
    return json(
      { bids: [], user: shipperProfile, theme: "dark" },
      {
        headers: {
          "Set-Cookie": await commitSession(session, { expires }),
        },
      }
    );
  }
  return json({ bids, user, theme: "light" },
    { headers: { "Set-Cookie": await commitSession(session, { expires }) } });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action");
  const bidId = formData.get("bidId");
  const session = await getSession(request.headers.get("Cookie"));
  const user: any = session.get("user");

  switch (action) {
    case "accept":
      // await AcceptBid(bidId, user.token);
      return json({ success: true, message: "Bid accepted" });
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

  let info = "";
  if (bids.length === 0) {
    info =
      "Your load have not been bid yet, check back later or adjust the proposed amount";
  }

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

  const handleAction = (action, bidId) => {
    const formData = new FormData();
    formData.append("_action", action);
    formData.append("bidId", bidId);
    submit(formData, { method: "post" });
  };

  const filteredAndSortedBids = bids
    .filter(
      (bid) =>
        filterConfig.status === "all" || bid.status === filterConfig.status
    )
    .filter((bid) => bid.amount >= filterConfig.minAmount)
    .sort((a, b) => {
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
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
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
                onClick={() => handleSort("carrier")}
                className="p-2 cursor-pointer"
              >
                Carrier
              </th>
              <th
                onClick={() => handleSort("amount")}
                className="p-2 cursor-pointer"
              >
                Bid Amount
              </th>
              <th
                onClick={() => handleSort("status")}
                className="p-2 cursor-pointer"
              >
                Status
              </th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {info && (
              <p
                className={`p-4 m-4 text-center ${
                  theme === "dark" ? "text-green-300" : "text-green-700"
                } rounded-md animate-pulse`}
              >
                {info}
              </p>
            )}
            {filteredAndSortedBids.map((bid) => (
              <React.Fragment key={bid.id}>
                <tr className={`border-b ${themeClasses.tableRow}`}>
                  <td className="p-2">{bid.carrier}</td>
                  <td className="p-2">${bid.amount}</td>
                  <td className="p-2">{bid.status}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleExpand(bid.id)}
                      className={`mr-2 ${themeClasses.button}`}
                    >
                      {expandedBid === bid.id ? (
                        <ChevronUpIcon className="w-5 h-5" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                      )}
                    </button>
                    <Form method="post" className="inline">
                      <button
                        type="submit"
                        name="_action"
                        value="accept"
                        onClick={() => handleAction("accept", bid.id)}
                        className={`mr-2 ${themeClasses.button}`}
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                    </Form>
                    <Form method="post" className="inline">
                      <button
                        type="submit"
                        name="_action"
                        value="reject"
                        onClick={() => handleAction("reject", bid.id)}
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
                      onClick={() => setSelectedCarrier(bid.carrier)}
                      className={
                        theme === "dark"
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-800"
                      }
                    >
                      <PhoneIcon className="w-5 h-5" />
                    </button>
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
                          <p>Name: {bid.carrierName}</p>
                          <p>Phone: {bid.carrierPhone}</p>
                        </div>
                        <div>
                          <h3 className={`font-bold ${themeClasses.header}`}>
                            Bid Details
                          </h3>
                          <p>Proposed Pickup: {bid.proposedPickup}</p>
                          <p>Proposed Delivery: {bid.proposedDelivery}</p>
                        </div>
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