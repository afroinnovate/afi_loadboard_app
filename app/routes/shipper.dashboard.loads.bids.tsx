import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  useLoaderData,
  Form,
  useSubmit,
  useNavigation,
  useOutletContext,
  useActionData,
} from "@remix-run/react";
import { json, type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
import {
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  ChevronUpIcon,
  CameraIcon,
  ChevronUpDownIcon
} from "@heroicons/react/20/solid";
import { UpdateBid } from "~/api/services/bid.service";
import AccessDenied from "~/components/accessdenied";
import { ErrorBoundary } from "~/components/errorBoundary";
import { commitSession, getSession } from "~/api/services/session";
import ContactShipperView from "~/components/contactshipper";
import { authenticator } from "~/api/services/auth.server";
import { type BidUpdateRequest } from "~/api/models/bidRequest";
import ChatWindow from "~/components/ChatWindow";

interface Message {
  id: number;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user: any = session.get(authenticator.sessionKey);

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

  return json({ user },
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

  if (!bidId) {
    return json({ error: "Bid ID is required" }, { status: 400 });
  }

  const id = Number(bidId);

  if (isNaN(id)) {
    return json({ error: "Invalid Bid ID" }, { status: 400 });
  }

  switch (action) {
    case "accept":
      const acceptRequest: BidUpdateRequest = {
        bidStatus: 1,
        updatedBy: shipper.id,
      };
      try {
        console.log("acceptRequest", acceptRequest);
        await UpdateBid(shipper.token, id, acceptRequest);
        return json({
          success: true,
          message: "Bid status is changed to Accepted",
        });
      } catch (error: any) {
        console.log("Error accepting bid: ", error);
        return json(
          {
            error: error.message || "An error occurred while accepting the bid",
          },
          { status: 500 }
        );
      }
    case "reject":
      const rejectRequest: BidUpdateRequest = {
        bidStatus: 2,
        updatedBy: shipper.id,
      };
      try {
        await UpdateBid(shipper.token, id, rejectRequest);
        return json({
          success: true,
          message: "Bid status is changed to Rejected",
        });
      } catch (error: any) {
        console.log("Error rejecting bid: ", error);
        return json(
          {
            error: error.message || "An error occurred while rejecting the bid",
          },
          { status: 500 }
        );
      }
    case "closeContact":
      return json({ closeContact: true });
    case "sendMessage": {
      const message = formData.get("message") as string;
      let messages = session.get("chatMessages") || [];
      
      const newMessage: Message = {
        id: Date.now(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
      };
      
      messages.push(newMessage);
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
      return json({ error: "Invalid action" }, { status: 400 });
  }
};

interface BidsViewProps {
  loads: any;
  bidsDict: { load: any; bids: any[] }[];
  theme: string;
  timezone: string;
}

export default function BidsView() {
  const loaderData: any = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const { bidsDict, theme, timezone } = useOutletContext<BidsViewProps>();
  const user = loaderData?.user;

  // Extract bids from the list of dictionaries and include the load object
  const bids: any[] = bidsDict.flatMap((dict: any) =>
    dict.bids.map((bid: any) => ({ ...bid, load: dict.load }))
  );

  const [expandedBid, setExpandedBid] = useState(null);
  const [filterConfig, setFilterConfig] = useState({
    status: "all",
    minAmount: 0,
  });
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState(null);

  useEffect(() => {
    if (actionData && actionData.newMessage) {
      setChatMessages((prevMessages) => [...prevMessages, actionData.newMessage]);
    }
  }, [actionData]);

  if (user.user.userType !== "shipper") {
    return (
      <AccessDenied
        returnUrl="/shipper/dashboard/loads/view"
        message="You do not have enough access to see your biddings. Click Home to complete your profile."
      />
    );
  }

  const handleSort = useCallback((key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  }, []);

  const handleFilter = (e: any) => {
    const { name, value } = e.target;
    setFilterConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExpand = (id: any) => {
    setExpandedBid(expandedBid === id ? null : id);
  };

  const handleOpenChat = (carrier: any) => {
    setSelectedCarrier(carrier);
    setShowChatWindow(true);
  };

  // Modify filteredAndSortedBids to handle single sort field and filtering
  const filteredAndSortedBids = useMemo(() => {
    let filteredBids = bids.filter((bid: any) => {
      if (filterConfig.status === "all") {
        return true;
      } else {
        return bid.bidStatus === parseInt(filterConfig.status);
      }
    });
    
    if (sortConfig.key) {
      filteredBids.sort((a: any, b: any) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredBids;
  }, [bids, filterConfig, sortConfig]);

  // Helper function to get sort direction icon
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ChevronUpDownIcon className="w-4 h-4 inline-block ml-1" />;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

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
    text: theme === "dark" ? "text-gray-200" : "text-black",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", { timeZone: timezone });
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${themeClasses.container}`}>
      <h1 className={`text-2xl md:text-3xl font-bold mb-6 text-center ${themeClasses.header}`}>
        Review Bids
      </h1>

      <div className="mb-4 flex flex-wrap items-center space-y-2 md:space-y-0 md:space-x-4">
        <div className="flex items-center w-full md:w-auto">
          <CameraIcon className={`w-5 h-5 mr-2 ${themeClasses.button} hidden md:inline-block`} />
          <select
            name="status"
            onChange={handleFilter}
            className={`w-full md:w-auto mr-2 p-2 rounded ${themeClasses.input}`}
          >
            <option value="all">All Status</option>
            <option value="0">Pending</option>
            <option value="1">Accepted</option>
            <option value="2">Rejected</option>
          </select>
        </div>
      </div>
      <div className={`mb-4 ${themeClasses.text}`}>
        Showing {filteredAndSortedBids.length} of {bids.length} bids
      </div>

      <div className={`overflow-x-auto rounded-lg shadow ${themeClasses.table}`}>
        <table className="w-full table-auto">
          <thead>
            <tr className={themeClasses.tableHeader}>
              <th
                onClick={() => handleSort("carrier.firstName")}
                className="p-2 cursor-pointer text-left"
              >
                Carrier {getSortIcon("carrier.firstName")}
              </th>
              <th
                onClick={() => handleSort("bidAmount")}
                className="p-2 cursor-pointer text-left"
              >
                Bid Amount {getSortIcon("bidAmount")}
              </th>
              <th
                onClick={() => handleSort("bidStatus")}
                className="p-2 cursor-pointer text-left"
              >
                Status {getSortIcon("bidStatus")}
              </th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedBids.map((bid: any) => (
              <React.Fragment key={bid.id}>
                <tr
                  className={`border-b ${themeClasses.tableRow} cursor-pointer`}
                  onClick={() => handleExpand(bid.id)}
                >
                  <td className="p-2 text-left">
                    <div className="truncate max-w-[150px] sm:max-w-none">
                      {`${bid.carrier.firstName} ${bid.carrier.lastName}`}
                    </div>
                  </td>
                  <td className="p-2 text-left">${bid.bidAmount}</td>
                  <td className="p-2 text-left">
                    <div className="truncate max-w-[100px] sm:max-w-none">
                      {["Pending", "Accepted", "Rejected"][bid.bidStatus]}
                    </div>
                  </td>
                  <td className="p-2 text-left">
                    <div className="flex justify-start items-center space-x-2">
                      {expandedBid !== bid.id ? (
                        <>
                          <Form method="post" className="inline-block">
                            <input type="hidden" name="bidId" value={bid.id} />
                            <button
                              type="submit"
                              name="_action"
                              value="accept"
                              onClick={(e) => e.stopPropagation()}
                              className={`mr-2 ${themeClasses.button}`}
                            >
                              <CheckCircleIcon className="w-5 h-5 text-green-600 hover:text-green-800" />
                            </button>
                          </Form>
                          <Form method="post" className="inline-block">
                            <input type="hidden" name="bidId" value={bid.id} />
                            <button
                              type="submit"
                              name="_action"
                              value="reject"
                              onClick={(e) => e.stopPropagation()}
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
                        </>
                      ) : (
                        <ChevronUpIcon className="w-5 h-5" />
                      )}
                    </div>
                  </td>
                </tr>
                {expandedBid === bid.id && (
                  <tr key={`expanded-${bid.id}`}>
                    <td
                      colSpan={4}
                      className={`p-4 ${themeClasses.expandedRow}`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3
                            className={`font-bold ${themeClasses.header} pl-4`}
                          >
                            Carrier Details
                          </h3>
                          <p className={`${themeClasses.text} pl-4 break-words`}>
                            Name:{" "}
                            {`${bid.carrier.firstName} ${bid.carrier.lastName}`}
                          </p>
                          <p className={`${themeClasses.text} pl-4 break-words`}>
                            Phone: {bid.carrier.phone}
                          </p>
                          <p className={`${themeClasses.text} pl-4 break-words`}>
                            Email: {bid.carrier.email}
                          </p>
                          <p className={`${themeClasses.text} pl-4 break-words`}>
                            Company: {bid.carrier.companyName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3
                            className={`font-bold ${themeClasses.header} pl-4`}
                          >
                            Load Details
                          </h3>
                          <p className={`${themeClasses.text} pl-4 break-words`}>
                            Origin: {bid.load.origin}
                          </p>
                          <p className={`${themeClasses.text} pl-4 break-words`}>
                            Destination: {bid.load.destination}
                          </p>
                          <p className={`${themeClasses.text} pl-4 break-words`}>
                            Pickup Date: {formatDate(bid.load.pickupDate)}
                          </p>
                          <p className={`${themeClasses.text} pl-4 break-words`}>
                            Delivery Date: {formatDate(bid.load.deliveryDate)}
                          </p>
                          <p className={`${themeClasses.text} pl-4 break-words`}>
                            Commodity: {bid.load.commodity}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-4">
                        <Form method="post" className="w-full md:w-auto">
                          <input type="hidden" name="bidId" value={bid.id} />
                          <button
                            type="submit"
                            name="_action"
                            value="accept"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                          >
                            Accept
                          </button>
                        </Form>
                        <Form method="post" className="w-full md:w-auto">
                          <input type="hidden" name="bidId" value={bid.id} />
                          <button
                            type="submit"
                            name="_action"
                            value="reject"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full md:w-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </Form>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCarrier(bid.carrier);
                          }}
                          className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
          onChat={() => {
            handleOpenChat(selectedCarrier);
            setSelectedCarrier(null); // Close the contact popup
          }}
        />
      )}

      <ChatWindow
        isOpen={showChatWindow}
        onClose={() => setShowChatWindow(false)}
        recipientName={
          selectedCarrier
            ? `${selectedCarrier.firstName || "Unknown"} ${
                selectedCarrier.lastName || "Carrier"
              }`
            : "Carrier"
        }
        messages={chatMessages}
      />
    </div>
  );
}

<ErrorBoundary />;