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
  useOutletContext,
  useNavigate,
} from "@remix-run/react";
import { GetLoads } from "~/api/services/load.service";
import { getCarrierInvoices } from "~/api/services/invoice.service";
import { Disclosure } from "@headlessui/react";
import {
  commitSession,
  destroySession,
  getSession,
} from "../api/services/session";
import "flowbite";
import {
  ChevronUpIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import AccessDenied from "~/components/accessdenied";
import BidAdjustmentView from "~/components/bidadjustmentview";
import ContactShipperView from "~/components/contactshipper";
import { manageBidProcess } from "~/api/services/bid.helper";
import { authenticator } from "~/api/services/auth.server";
import { redirectUser } from "~/components/redirectUser";
import { ErrorBoundary } from "~/components/errorBoundary";
import { LoadInfoDisplay } from "~/components/loadViewHelpers";
import { useMemo, useState, useEffect } from "react";
import ChatWindow from "~/components/ChatWindow";
import { CarrierInvoiceDetail } from "~/components/invoice/CarrierInvoiceDetail";

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

    if (!user) {
      return redirect("/logout/");
    }

    if (!carrierProfile) {
      return json({
        error: "Carrier profile not found",
        loads: [],
        invoices: [],
        carrierProfile: null,
      });
    }

    const session_expiration: any = process.env.SESSION_EXPIRATION;
    const EXPIRES_IN = parseInt(session_expiration) * 1000; // Convert seconds to milliseconds
    if (isNaN(EXPIRES_IN)) {
      throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
    }

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

    // Get both loads and invoices
    try {
      // const [loadsResponse, invoicesResponse] = await Promise.all([
      //   GetLoads(user.token),
      //   getCarrierInvoices(user.token, carrierProfile.id),
      // ]);

      return json({
        // loads: loadsResponse,
        carrierProfile,
        // invoices: Array.isArray(invoicesResponse) ? invoicesResponse : [],
        token: user.token,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      return json({
        // loads: [],
        carrierProfile,
        // invoices: [],
        token: user.token,
        error: "Failed to fetch data. Please try again.",
      });
    }
  } catch (error: any) {
    console.error("Loader error:", error);
    const session = await getSession(request.headers.get("Cookie"));

    if (error.status === 401) {
      return redirect("/login/", {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      });
    }

    return json({
      error: "An unexpected error occurred",
      loads: [],
      invoices: [],
      carrierProfile: null,
    });
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
    const carrierProfile = session.get("carrier");

    if (!user) {
      return redirect("/login/");
    }

    const formData = await request.formData();
    const actionType = formData.get("_action");

    switch (actionType) {
      case "view_invoice": {
        const invoiceId = formData.get("invoiceId");
        const loadId = formData.get("loadId");
        const load = JSON.parse(formData.get("load") as string);
        const shipper = JSON.parse(formData.get("shipper") as string);

        // Construct the invoice info with all required data
        return json({
          success: true,
          message: "viewMode",
          invoiceData: {
            load,
            shipper: {
              name: `${shipper.firstName} ${shipper.lastName}`,
              companyName:
                shipper.businessProfile?.companyName || "Company Name Pending",
              address: shipper.businessProfile?.address || "Address pending",
              taxId:
                shipper.businessProfile?.businessRegistrationNumber ||
                "Tax ID pending",
              email: shipper.email,
            },
            carrier: {
              name: `${carrierProfile.user.firstName} ${carrierProfile.user.lastName}`,
              companyName:
                carrierProfile.user.businessProfile?.companyName ||
                "Company Name Pending",
              address:
                carrierProfile.user.businessProfile?.address ||
                "Address pending",
              taxId:
                carrierProfile.user.businessProfile
                  ?.businessRegistrationNumber || "Tax ID pending",
              email: carrierProfile.user.email,
            },
            invoice: formData.get("invoice")
              ? JSON.parse(formData.get("invoice") as string)
              : null,
          },
        });
      }

      case "contact":
        return json({
          error: "",
          message: "contactMode",
          contactLoadShipper: formData.get("shipper"),
          contactLoad: formData.get("load"),
        });

      case "bid":
        return json({
          error: "",
          message: "bidMode",
          loadIdToBeBid: formData.get("bidLoadId"),
          offerAmount: formData.get("offerAmount"),
        });

      case "placebid":
        const bidAmount = formData.get("bidAmount");
        const bidDetails = await manageBidProcess(
          carrierProfile,
          Number(formData.get("bidLoadId")),
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
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Action error:", error);
    return json(
      {
        error: "Failed to process request",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

interface OutletContext {
  loads: any[];
  invoices: any[];
  bids: any[];
  theme: "light" | "dark";
  timezone: string;
  toggleTheme: () => void;
}

const handleInvoiceGeneration = (
  load: any,
  carrierProfile: any,
  e: React.MouseEvent
) => {
  e.preventDefault();
  e.stopPropagation();

  const currentDate = new Date();
  const dueDate = new Date(currentDate);
  dueDate.setDate(dueDate.getDate() + 30);

  const partialInvoice = {
    id: `INV-${load.loadId}`,
    invoiceNumber: `INV/${currentDate.getFullYear()}/${load.loadId
      .toString()
      .padStart(3, "0")}`,
    loadId: load.loadId.toString(),
    issuedDate: currentDate.toISOString().split("T")[0],
    dueDate: dueDate.toISOString().split("T")[0],
    createdAt: currentDate.toISOString(),
    status: "pending",
    shipper: {
      name: `${load.createdBy.firstName} ${load.createdBy.lastName}`,
      companyName:
        load.createdBy.businessProfile?.companyName || "Company Name Pending",
      address: load.createdBy.businessProfile?.address || "Address pending",
      taxId:
        load.createdBy.businessProfile?.businessRegistrationNumber ||
        "Tax ID pending",
      email: load.createdBy.email,
    },
    carrier: {
      name: `${carrierProfile.user.firstName} ${carrierProfile.user.lastName}`,
      companyName:
        carrierProfile.user.businessProfile?.companyName ||
        "Company Name Pending",
      address:
        carrierProfile.user.businessProfile?.address || "Address pending",
      taxId:
        carrierProfile.user.businessProfile?.businessRegistrationNumber ||
        "Tax ID pending",
      email: carrierProfile.user.email,
    },
    load: {
      origin: load.origin,
      destination: load.destination,
      pickupDate: new Date(load.pickupDate).toLocaleDateString(),
      deliveryDate: new Date(load.deliveryDate).toLocaleDateString(),
      commodity: load.commodity,
      weight: `${load.weight} kg`,
      details: load.loadDetails,
    },
    charges: {
      baseRate: Number(load.offerAmount),
      additionalServices: [],
      subtotal: Number(load.offerAmount),
      taxes: {
        VAT: Number(load.offerAmount) * 0.15,
        withholding: Number(load.offerAmount) * 0.02,
      },
      total: Number(load.offerAmount) * 1.17, // Base + VAT + Withholding
    },
    paymentTerms: "Net 30",
    notes: `Invoice for load ${load.loadId} - ${load.commodity} shipment from ${
      load.origin
    } to ${load.destination}. Generated on ${currentDate.toLocaleDateString()}`,
  };

  try {
    sessionStorage.setItem("draftInvoice", JSON.stringify(partialInvoice));
    window.location.href = `/carriers/dashboard/invoice/${load.loadId}`;
  } catch (error) {
    console.error("Error handling invoice generation:", error);
  }
};

export default function CarrierViewLoads() {
  const loaderData: any = useLoaderData();
  const actionData: any = useActionData();
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [selectedShipper, setSelectedShipper] = useState<any>(null);
  const { theme, loads, invoices } = useOutletContext<OutletContext>();
  const { carrierProfile, error: loaderError } = loaderData;
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const navigate = useNavigate();

  // Early return if there's no carrier profile
  if (!carrierProfile || !carrierProfile.user) {
    return (
      <div className="p-4 text-center">
        <div className="p-4 mb-2 text-center text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-300">
          {loaderError ||
            "Unable to load carrier profile. Please try again later."}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // console.log("carrier context loads: ", loads);
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

  // Update the memoized values to use context loads
  const { additionalInfo } = useMemo(() => {
    let additionalInfoMsg = "";

    if (!loads || loads.length === 0) {
      additionalInfoMsg = "No loads posted, please check back later";
    }

    return {
      additionalInfo: additionalInfoMsg,
    };
  }, [loaderData, loads]);

  const carrierHasAccess =
    carrierProfile?.user?.userType === "carrier" &&
    carrierProfile?.user?.businessProfile?.carrierRole !== null;

  const carrierAccess = carrierProfile?.user?.userType === "carrier";

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
      setChatMessages((prevMessages) => [
        ...prevMessages,
        actionData.newMessage,
      ]);
    }
  }, [actionData]);

  const handleOpenChat = (shipper: any) => {
    setSelectedShipper(shipper);
    setShowChatWindow(true);
  };

  // Memoize the status styles function
  const getStatusStyles = useMemo(
    () => (status: string) => {
      // Convert status to lowercase for consistent comparison
      switch (status.toLowerCase()) {
        case "open":
          return `bg-green-600 text-white`;
        case "accepted":
          return `bg-gray-500 text-white`;
        case "enroute":
          return `bg-red-500 text-white`;
        case "delivered":
          return `bg-blue-500 text-white`;
        default:
          return `bg-orange-500 text-white`;
      }
    },
    []
  );

  // Function to check if a load has an invoice
  const getLoadInvoice = (loadId: number) => {
    return invoices.find((invoice: any) => invoice.loadId === loadId);
  };

  // Update handleInvoiceAction to use navigation
  const handleInvoiceAction = (load: any, existingInvoice: any) => {
    if (existingInvoice) {
      // Navigate to view/edit route for existing invoice
      navigate(`/carriers/dashboard/invoice/view/${existingInvoice.id}`);
    } else {
      // Navigate to generate invoice route
      navigate(`/carriers/dashboard/invoice/${load.loadId}`);
    }
  };

  // Update renderInvoiceButton to show appropriate text
  const renderInvoiceButton = (load: any) => {
    if (load.loadStatus.toLowerCase() !== "delivered") {
      return null;
    }

    const existingInvoice = getLoadInvoice(load.loadId);

    return (
      <button
        type="button"
        onClick={() => handleInvoiceAction(load, existingInvoice)}
        className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium ${themeClasses.button.primary} rounded hover:bg-blue-500 hover:text-white focus:outline-none`}
      >
        <DocumentTextIcon className="w-5 h-5 mr-2" />
        {existingInvoice ? "View Invoice" : "Generate Invoice"}
      </button>
    );
  };

  // Add invoice view modal
  const InvoiceViewModal = () => {
    if (!showInvoiceView || !selectedInvoice) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className={`${themeClasses.modal} w-full max-w-4xl rounded-lg shadow-xl p-6 m-4 max-h-[90vh] overflow-y-auto`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Invoice Details</h2>
            <button
              onClick={() => {
                setShowInvoiceView(false);
                setSelectedInvoice(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <CarrierInvoiceDetail
            invoiceInfo={{
              load: loads.find((l: any) => l.loadId === selectedInvoice.loadId),
              shipper: selectedInvoice.shipper,
              carrier: selectedInvoice.carrier,
              invoice: selectedInvoice,
            }}
            token={loaderData.token}
            theme={theme}
            readOnly={true}
            onClose={() => {
              setShowInvoiceView(false);
              setSelectedInvoice(null);
            }}
          />
        </div>
      </div>
    );
  };

  // Conditional rendering for access denied or valid dashboard
  if (carrierProfile?.user?.userType !== "carrier") {
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have access to the carrier dashboard."
      />
    );
  }

  const currency = "ETB";

  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    card: theme === "dark" ? "bg-gray-700" : "bg-gray-100",
    button: {
      primary:
        theme === "dark"
          ? "bg-white border border-orange-400 text-blue-500 hover:bg-orange-500 hover:text-white"
          : "bg-white border border-blue-500 text-blue-500 hover:bg-orange-500 hover:text-white",
      secondary:
        theme === "dark"
          ? "bg-white border border-green-400 text-green-500 hover:bg-gray-700"
          : "bg-white border border-green-400 text-green-500 hover:bg-gray-400",
      danger:
        theme === "dark"
          ? "bg-red-600 hover:bg-red-700"
          : "bg-red-500 hover:bg-red-600",
    },
    text: {
      primary: theme === "dark" ? "text-white" : "text-gray-900",
      secondary: theme === "dark" ? "text-gray-300" : "text-gray-600",
    },
    heading: theme === "dark" ? "text-white" : "text-green-800",
    modal: theme === "dark" ? "bg-gray-800" : "bg-white",
  };

  return (
    <div className={`container mx-auto p-4 ${themeClasses.container}`}>
      {error && (
        <div className="p-4 mb-2 text-center text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="flex justify-center items-center shadow-md mb-3">
        <h1
          className={`text-2xl font-serif mb-4 p-3 text-center ${themeClasses.heading}`}
        >
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
            className={`${themeClasses.card} shadow rounded-lg`}
          >
            {({ open }) => (
              <>
                {/* Contact Shipper View */}
                {contactMode === "contactMode" && (
                  <ContactShipperView
                    shipper={contactLoadShipper}
                    load={contactLoad}
                    onClose={() => {}}
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

                <Disclosure.Button
                  className={`flex flex-wrap justify-between items-center w-full p-4 text-left text-sm font-medium ${themeClasses.text.primary} hover:bg-opacity-80`}
                >
                  <div className="w-full sm:w-auto flex flex-wrap items-center space-x-2 mb-2 sm:mb-0">
                    <h2 className="text-sm sm:text-base font-medium">
                      {load.origin}
                    </h2>
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                    <h2 className="text-sm sm:text-base font-medium">
                      {load.destination}
                    </h2>
                  </div>
                  <div className="w-full sm:w-auto flex flex-wrap items-center justify-between sm:justify-end space-x-2">
                    <div className="flex items-center space-x-4 w-full sm:w-auto flex-wrap">
                      {" "}
                      <LoadInfoDisplay
                        load={load}
                        currency={currency}
                        theme={theme}
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
                          className={`w-6 h-6 sm:w-8 sm:h-8 flex-wrap ${
                            open ? "transform rotate-180" : ""
                          } text-gray-300`}
                        />
                      </div>
                    </div>
                  </div>
                </Disclosure.Button>

                <Disclosure.Panel
                  className={`p-2 pl-4 text-sm ${themeClasses.text.secondary} ${themeClasses.card} bg-opacity-50`}
                >
                  <div className="grid grid-cols-1 gap-2">
                    <p className="flex flex-wrap">
                      <span className="w-full sm:w-auto sm:mr-2 font-medium">
                        Pickup Date:
                      </span>
                      <span>
                        {new Date(load.pickupDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="flex flex-wrap">
                      <span className="w-full sm:w-auto sm:mr-2 font-medium">
                        Estimated Delivery Date:
                      </span>
                      <span>
                        {new Date(load.deliveryDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="flex flex-wrap">
                      <span className="w-full sm:w-auto sm:mr-2 font-medium">
                        Commodity:
                      </span>
                      <span>{load.commodity}</span>
                    </p>
                    <p className="flex flex-wrap">
                      <span className="w-full sm:w-auto sm:mr-2 font-medium">
                        Weight:
                      </span>
                      <span>{load.weight} kg</span>
                    </p>
                    <p className="flex flex-wrap">
                      <span className="w-full sm:w-auto sm:mr-2 font-medium">
                        Offer Amount:
                      </span>
                      <span>
                        {currency} {load.offerAmount}
                      </span>
                    </p>
                    <p className="flex flex-wrap">
                      <span className="w-full sm:w-auto sm:mr-2 font-medium">
                        Details:
                      </span>
                      <span>{load.loadDetails}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    {carrierAccess && !carrierHasAccess && (
                      <NavLink
                        to="/carriers/dashboard/account/business/"
                        className={`w-full sm:w-auto inline-block ${themeClasses.button.primary} text-white px-4 py-2 text-sm rounded cursor-pointer transform transition`}
                      >
                        Complete profile to pick up a load
                      </NavLink>
                    )}

                    {carrierHasAccess && (
                      <>
                        {/* Message Shipper button - always visible */}
                        <form method="post" className="w-full sm:w-auto">
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
                            className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium ${themeClasses.button.secondary} rounded hover:bg-green-500 hover:text-white focus:outline-none`}
                            aria-label="Contact Carrier"
                          >
                            <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                            Message Shipper
                          </button>
                        </form>

                        {/* Generate Invoice button - only for delivered loads */}
                        {renderInvoiceButton(load)}
                      </>
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

      {/* Add the invoice view modal */}
      <InvoiceViewModal />
    </div>
  );
}

<ErrorBoundary />;
