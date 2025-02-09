import {
  json,
  redirect,
  LoaderFunction,
  ActionFunction,
} from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  useNavigate,
  useOutletContext,
  Form,
} from "@remix-run/react";
import { getSession } from "~/api/services/session";
import { authenticator } from "~/api/services/auth.server";
import { getInvoiceById, updateInvoice } from "~/api/services/invoice.service";
import type { Invoice } from "~/api/models/invoice";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FEES_AND_TAXES } from "~/utils/constants";
import {
  savePaymentMethod,
  updatePaymentMethod,
} from "~/api/services/payment.service";
import Popup from "~/components/popup";
import { Loader } from "~/components/loader";

interface OutletContext {
  theme: "light" | "dark";
  loads: any[];
  bids: any[];
  loads: any[];
  invoices: Invoice[];
  timezone: string;
  toggleTheme: () => void;
}

interface LoaderData {
  invoiceId: string;
  carrierProfile: any;
  token: string;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);
  const carrierProfile = session.get("carrier");

  if (!user) {
    return redirect("/logout/");
  }

  if (!params.invoiceId) {
    return redirect("/carriers/dashboard/invoices");
  }

  try {
    // Convert the invoice ID to the correct type if needed
    const invoiceId = params.invoiceId;

    return json({
      carrierProfile,
      token: user.token,
      invoiceId,
    });
  } catch (error) {
    console.error("Error loading invoice:", error);
    return redirect("/carriers/dashboard/invoices");
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  console.log("Action started");
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);

  if (!user) {
    console.log("No user found");
    return redirect("/logout/");
  }

  const formData = await request.formData();
  const _action = formData.get("_action");
  console.log("Action type:", _action);

  try {
    switch (_action) {
      case "update_payment_method": {
        console.log("Processing payment method update");
        const paymentMethodData = formData.get("paymentMethod");
        console.log("Raw payment method data:", paymentMethodData);

        const newPaymentMethod = JSON.parse(paymentMethodData as string);
        console.log("Parsed payment method:", newPaymentMethod);

        // Check if paymentMethodId exists
        if (!newPaymentMethod.paymentMethodId) {
          return json(
            {
              error: "Payment method ID is required for updates",
              details: "Missing payment method ID",
            },
            { status: 400 }
          );
        }

        try {
          // Update the payment method
          const updatedPaymentMethod = await updatePaymentMethod(
            user.token,
            newPaymentMethod.paymentMethodId,
            {
              paymentMethodId: newPaymentMethod.paymentMethodId,
              paymentType: newPaymentMethod.paymentType,
              carrierId: newPaymentMethod.carrierId,
              bankName: newPaymentMethod.bankName || "",
              bankAccount: newPaymentMethod.bankAccount || "",
              accountHolderName: newPaymentMethod.accountHolderName || "",
              phoneNumber: newPaymentMethod.phoneNumber || "",
              cardMethod: newPaymentMethod.cardMethod || "",
              cardType: newPaymentMethod.cardType || "",
              lastFourDigits: newPaymentMethod.lastFourDigits || "",
              billingAddress: newPaymentMethod.billingAddress || "",
            }
          );

          return json({
            success: true,
            message: "Payment information updated successfully",
            paymentMethod: updatedPaymentMethod,
          });
        } catch (error: any) {
          console.error("Update payment method error:", error);
          const errorData = JSON.parse(error);
          return json(
            {
              error:
                errorData.data.message || "Failed to update payment method",
              details: errorData.data.status,
            },
            { status: errorData.data.status || 500 }
          );
        }
      }

      case "close":
        return redirect("/carriers/dashboard/invoices");

      default:
        console.log("Invalid action:", _action);
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Action error:", error);
    return json(
      {
        error: "Failed to update payment method",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

export default function ViewInvoice() {
  const { carrierProfile, invoiceId } = useLoaderData<LoaderData>();
  const actionData = useActionData();
  const navigate = useNavigate();
  const { theme, loads, invoices } = useOutletContext<OutletContext>();
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDialog, setShowDialog] = useState(true);

  // Check if invoices is undefined or null (service down)
  if (!invoices) {
    return (
      <Popup
        title="Service Unavailable"
        message="Unable to load invoice details. Our team has been notified."
        type="error"
        theme={theme}
        buttonText="Return to Invoices"
        actionValue="close"
        onAction={() => navigate("/carriers/dashboard/invoices")}
      />
    );
  }

  // The issue is here - we need to convert the IDs to the same type for comparison
  const invoice = invoices.find(
    (inv: Invoice) => inv.id.toString() === invoiceId.toString()
  );

  console.log("Looking for invoice with ID:", invoiceId);
  console.log(
    "Available invoice IDs:",
    invoices.map((inv) => inv.id)
  );
  console.log("Found invoice:", invoice);

  if (!invoice) {
    return (
      <Popup
        title="Invoice Not Found"
        message="The requested invoice could not be found. Please try again later."
        type="warning"
        theme={theme}
        buttonText="Return to Invoices"
        actionValue="close"
        onAction={() => navigate("/carriers/dashboard/invoices")}
      />
    );
  }

  // Ensure carrier can only view their own invoices
  if (invoice.carrierId !== carrierProfile.id) {
    return (
      <Popup
        title="Access Denied"
        message="You do not have permission to view this invoice."
        type="error"
        theme={theme}
        buttonText="Return to Invoices"
        actionValue="close"
        onAction={() => navigate("/carriers/dashboard/invoices")}
      />
    );
  }

  // Get load details from outlet context loads
  const loadDetails = loads.find((load) => load.loadId === invoice.loadId);

  // Get carrier info from session/invoice
  const carrierInfo = {
    name: `${carrierProfile.user.firstName} ${carrierProfile.user.lastName}`,
    companyName: carrierProfile.user.businessProfile?.companyName || "N/A",
    address: carrierProfile.user.businessProfile?.address || "N/A",
    email: carrierProfile.user.email,
  };

  // Get shipper info from load
  const shipperInfo = loadDetails?.createdBy
    ? {
        name: `${loadDetails.createdBy.firstName} ${loadDetails.createdBy.lastName}`,
        companyName:
          loadDetails.createdBy.businessProfile?.companyName || "N/A",
        address: loadDetails.createdBy.businessProfile?.address || "N/A",
        email: loadDetails.createdBy.email,
      }
    : null;

  // Initialize payment method state
  const [editedPaymentMethod, setEditedPaymentMethod] = useState(
    invoice.paymentMethod || {
      paymentType: "bank",
      carrierId: carrierProfile.id,
      paymentMethodId: invoice.paymentMethodId,
      bankName: "",
      bankAccount: "",
      accountHolderName: "",
      // Keep these empty as they're not used for bank payments
      phoneNumber: "",
      cardMethod: "",
      cardType: "",
      lastFourDigits: "",
      billingAddress: "",
    }
  );

  const themeClasses = {
    modal:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    section: theme === "dark" ? "bg-gray-700" : "bg-gray-50",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    input:
      theme === "dark"
        ? "bg-gray-700 border-gray-600"
        : "bg-white border-gray-300",
  };

  // Handle successful update first
  if (actionData?.success) {
    return (
      <Popup
        title="Success"
        message={actionData.message}
        type="success"
        theme={theme}
        buttonText="Close"
        actionValue="close"
      />
    );
  }

  // Handle errors
  if (actionData?.error) {
    return (
      <Popup
        title="Error"
        message={actionData.error}
        type="error"
        theme={theme}
        actionValue="close"
      />
    );
  }

  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setIsProcessing(true); // Start loading
    // Don't prevent default - let Remix handle the form submission
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${themeClasses.modal} w-full max-w-4xl rounded-lg shadow-xl p-6 m-4 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Invoice Details</h2>
          <button
            onClick={() => navigate("/carriers/dashboard/invoices")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Load Information Section */}
        <div className={`${themeClasses.section} p-4 rounded-lg mb-4`}>
          <h3 className="font-semibold mb-2">Load Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">From (Carrier)</p>
              <p className="font-medium">{carrierInfo.name}</p>
              <p className="text-sm text-gray-500">{carrierInfo.companyName}</p>
              <p className="text-sm text-gray-500">{carrierInfo.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">To (Shipper)</p>
              <p className="font-medium">{shipperInfo?.name || "N/A"}</p>
              <p className="text-sm text-gray-500">
                {shipperInfo?.companyName}
              </p>
              <p className="text-sm text-gray-500">{shipperInfo?.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Origin</p>
              <p className="font-medium">{loadDetails?.origin || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Destination</p>
              <p className="font-medium">{loadDetails?.destination || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Commodity</p>
              <p className="font-medium">{loadDetails?.commodity || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Weight</p>
              <p className="font-medium">
                {loadDetails?.weight ? `${loadDetails.weight} kg` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Details Section */}
        <div className={`${themeClasses.section} p-4 rounded-lg mb-4`}>
          <h3 className="font-semibold mb-4">Invoice Details</h3>

          {/* Basic Invoice Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="font-medium">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Issue Date</p>
              <p className="font-medium">
                {new Date(invoice.issueDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-medium">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-sm ${
                  invoice.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : invoice.status === "paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {invoice.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Financial Details */}
          <div className={`${themeClasses.border} border rounded-lg p-4`}>
            {/* Base Amount */}
            <div className="flex justify-between items-center mb-4">
              <p className="font-medium">Base Amount</p>
              <p className="font-medium">
                ETB {invoice.amountDue?.toLocaleString()}
              </p>
            </div>

            {/* Deductions Section */}
            <div className="border-t border-b py-4 my-4 space-y-2">
              <h4 className="font-medium text-red-500 mb-3">Deductions:</h4>

              {/* Service Fee */}
              <div className="flex justify-between text-sm text-red-500">
                <p>
                  Platform Service Fee ({FEES_AND_TAXES.SERVICE_FEE_RATE * 100}
                  %)
                </p>
                <p>- ETB {invoice.serviceFees?.toLocaleString()}</p>
              </div>

              {/* VAT */}
              <div className="flex justify-between text-sm text-red-500">
                <p>VAT ({FEES_AND_TAXES.VAT_RATE * 100}%)</p>
                <p>- ETB {invoice.totalVat?.toLocaleString()}</p>
              </div>

              {/* Withholding */}
              <div className="flex justify-between text-sm text-red-500">
                <p>
                  Withholding Tax ({FEES_AND_TAXES.WITHHOLDING_TAX_RATE * 100}%)
                </p>
                <p>- ETB {invoice.withholding?.toLocaleString()}</p>
              </div>

              {/* Total Deductions */}
              <div className="flex justify-between font-medium text-red-500 border-t border-red-200 pt-2 mt-2">
                <p>Total Deductions</p>
                <p>
                  - ETB{" "}
                  {(
                    invoice.serviceFees +
                    invoice.totalVat +
                    invoice.withholding
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Final Amount */}
            <div className="flex justify-between items-center pt-2">
              <p className="font-bold text-lg">Net Amount (You Will Receive)</p>
              <p className="font-bold text-lg text-green-600">
                ETB {invoice.totalAmount?.toLocaleString()}
              </p>
            </div>

            {/* Add Note Section */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">Note</p>
              <p className="text-sm mt-1">{invoice.note}</p>
            </div>
          </div>
        </div>

        {/* Payment Information Section */}
        <div className={`${themeClasses.section} p-4 rounded-lg`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Payment Information</h3>
            {invoice.status === "pending" && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Payment Method
              </button>
            )}
          </div>

          {isEditing ? (
            <Form method="post" onSubmit={handleSubmit}>
              <input
                type="hidden"
                name="_action"
                value="update_payment_method"
              />
              <input
                type="hidden"
                name="paymentMethod"
                value={JSON.stringify({
                  ...editedPaymentMethod,
                  paymentMethodId: invoice.paymentMethodId,
                })}
              />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={editedPaymentMethod.bankName}
                    onChange={(e) =>
                      setEditedPaymentMethod({
                        ...editedPaymentMethod,
                        bankName: e.target.value,
                      })
                    }
                    className={`w-full p-2 rounded ${themeClasses.input}`}
                    placeholder="Enter bank name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={editedPaymentMethod.bankAccount}
                    onChange={(e) =>
                      setEditedPaymentMethod({
                        ...editedPaymentMethod,
                        bankAccount: e.target.value,
                      })
                    }
                    className={`w-full p-2 rounded ${themeClasses.input}`}
                    placeholder="Enter account number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={editedPaymentMethod.accountHolderName}
                    onChange={(e) =>
                      setEditedPaymentMethod({
                        ...editedPaymentMethod,
                        accountHolderName: e.target.value,
                      })
                    }
                    className={`w-full p-2 rounded ${themeClasses.input}`}
                    placeholder="Enter account holder name"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isProcessing}
                    className={`px-4 py-2 text-gray-600 hover:bg-gray-100 rounded ${
                      isProcessing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    name="_action"
                    value="update_payment_method"
                    disabled={isProcessing}
                    className={`w-full sm:w-auto py-2 px-4 rounded-md font-medium transition-colors duration-300 relative ${
                      theme === "dark"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <Loader size={24} strokeWidth={4} />
                        <span className="ml-2">Updating...</span>
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </Form>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Bank Name</p>
                <p className="font-medium">
                  {invoice.paymentMethod?.bankName || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Number</p>
                <p className="font-medium">
                  {invoice.paymentMethod?.bankAccount || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Holder</p>
                <p className="font-medium">
                  {invoice.paymentMethod?.accountHolderName || "Not provided"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


