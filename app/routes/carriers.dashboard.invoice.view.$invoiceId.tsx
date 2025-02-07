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
import { FEES_AND_TAXES, calculateCarrierDeductions } from "~/utils/constants";

interface OutletContext {
  theme: "light" | "dark";
  loads: any[];
  bids: any[];
}

interface LoaderData {
  invoice: Invoice;
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
    const invoice = await getInvoiceById(user.token, params.invoiceId);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Ensure carrier can only view their own invoices
    if (invoice.carrierId !== carrierProfile.id) {
      return redirect("/carriers/dashboard/invoices");
    }

    return json({
      invoice,
      carrierProfile,
      token: user.token,
    });
  } catch (error) {
    console.error("Error loading invoice:", error);
    return redirect("/carriers/dashboard/invoices");
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);

  if (!user) {
    return redirect("/logout/");
  }

  try {
    const formData = await request.formData();
    const paymentMethod = JSON.parse(formData.get("paymentMethod") as string);

    const updatedInvoice = await updateInvoice(
      user.token,
      params.invoiceId as string,
      {
        paymentMethod,
      }
    );

    return json({
      success: true,
      message: "Payment information updated successfully",
      invoice: updatedInvoice,
    });
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
  const { invoice, carrierProfile, token } = useLoaderData<LoaderData>();
  const actionData = useActionData();
  const navigate = useNavigate();
  const { theme, loads } = useOutletContext<OutletContext>();
  const [isEditing, setIsEditing] = useState(false);

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
      method: "bank",
      type: "",
      bankName: "",
      bankAccount: "",
      accountHolderName: "",
      phoneNumber: "",
      cardMethod: "",
      cardType: "",
      lastFourDigits: "",
      billingAddress: "",
    }
  );

  // Calculate deductions
  const deductions = calculateCarrierDeductions(invoice.amount);

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

  const handlePaymentMethodUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append("_action", "update_payment_method");
    form.append("paymentMethod", JSON.stringify(editedPaymentMethod));

    try {
      const response = await fetch(``, {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update payment method:", error);
    }
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

        {actionData?.error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
            {actionData.error}
          </div>
        )}
        {actionData?.success && (
          <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg">
            {actionData.message}
          </div>
        )}

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

        {/* Invoice Details Section - Updated with comprehensive financial info */}
        <div className={`${themeClasses.section} p-4 rounded-lg mb-4`}>
          <h3 className="font-semibold mb-4">Invoice Details</h3>

          {/* Basic Invoice Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="font-medium">{invoice.number}</p>
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
                ETB {invoice.amount?.toLocaleString()}
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
                <p>- ETB {deductions.serviceFee.toLocaleString()}</p>
              </div>

              {/* VAT */}
              <div className="flex justify-between text-sm text-red-500">
                <p>VAT ({FEES_AND_TAXES.VAT_RATE * 100}%)</p>
                <p>- ETB {deductions.vat.toLocaleString()}</p>
              </div>

              {/* Withholding */}
              <div className="flex justify-between text-sm text-red-500">
                <p>
                  Withholding Tax ({FEES_AND_TAXES.WITHHOLDING_TAX_RATE * 100}%)
                </p>
                <p>- ETB {deductions.withholding.toLocaleString()}</p>
              </div>

              {/* Total Deductions */}
              <div className="flex justify-between font-medium text-red-500 border-t border-red-200 pt-2 mt-2">
                <p>Total Deductions</p>
                <p>- ETB {deductions.totalDeductions.toLocaleString()}</p>
              </div>
            </div>

            {/* Final Amount */}
            <div className="flex justify-between items-center pt-2">
              <p className="font-bold text-lg">Net Amount (You Will Receive)</p>
              <p className="font-bold text-lg text-green-600">
                ETB {deductions.finalAmount.toLocaleString()}
              </p>
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
            <Form method="post" onSubmit={handlePaymentMethodUpdate}>
              <input
                type="hidden"
                name="_action"
                value="update_payment_method"
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
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save Changes
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
