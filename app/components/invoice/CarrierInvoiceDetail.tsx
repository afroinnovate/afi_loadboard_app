import { useState, useEffect, useRef } from "react";
import type { Load } from "~/api/models/load";
import type { Shipper } from "~/api/models/shipper";
import type { Carrier } from "~/api/models/carrier";
import type { Invoice } from "~/api/models/invoice";
import {
  XMarkIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { FEES_AND_TAXES, calculateCarrierDeductions } from "~/utils/constants";
import { Form, useNavigate, useNavigation } from "@remix-run/react";
import { generateInvoice } from "~/api/services/invoice.service";
import { savePaymentMethod } from "~/api/services/payment.service";
import { type PaymentMethod } from "~/api/models/paymentMethod";
import { Loader } from "~/components/loader";

interface InvoiceInfo {
  load: Load;
  shipper: Shipper;
  carrier: Carrier;
  invoice: Invoice;
}

interface CarrierInvoiceDetailProps {
  invoiceInfo: InvoiceInfo;
  token: string;
  theme: "light" | "dark";
  actionData?: {
    success?: boolean;
    error?: string;
    invoice?: Invoice;
    paymentMethod?: PaymentMethod;
  };
}

interface FeedbackMessage {
  type: "success" | "error";
  message: string;
}

interface InvoiceRequest {
  id: number;
  loadId: number;
  issueDate: string;
  dueDate: string;
  status: string;
  carrierId: string;
  amountDue: number;
  totalAmount: number;
  totalVat: number;
  withholding: number;
  serviceFees: number;
  createdAt: string;
  note: string;
  transactionId: string;
  paymentMethod: {
    paymentType: string;
    carrierId: string;
    bankName: string;
    bankAccount: string;
    accountHolderName: string;
    phoneNumber: string;
    cardMethod: string;
    cardType: string;
    lastFourDigits: string;
    billingAddress: string;
  };
}

// Add these interfaces for form validation
interface FormErrors {
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  phoneNumber?: string;
  provider?: string;
}

// Add this function to format payment data
const formatPaymentMethodForApi = (paymentInfo: any) => {
  const basePaymentMethod = {
    method: paymentInfo.preferredMethod,
    type: "",
    bankName: "",
    bankAccount: "",
    accountHolderName: "",
    phoneNumber: "",
    cardMethod: "",
    cardType: "",
    lastFourDigits: "",
    billingAddress: "",
  };

  if (paymentInfo.preferredMethod === "bank") {
    return {
      ...basePaymentMethod,
      type: "bank_transfer",
      bankName: paymentInfo.bankDetails.bankName,
      bankAccount: paymentInfo.bankDetails.accountNumber,
      accountHolderName: paymentInfo.bankDetails.accountHolderName,
    };
  } else {
    return {
      ...basePaymentMethod,
      type: paymentInfo.mobileMoneyDetails.provider,
      phoneNumber: paymentInfo.mobileMoneyDetails.phoneNumber,
      accountHolderName: paymentInfo.mobileMoneyDetails.accountHolderName,
    };
  }
};

export function CarrierInvoiceDetail({
  invoiceInfo: initialInvoiceInfo,
  token,
  theme,
  actionData,
}: CarrierInvoiceDetailProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [invoice, setInvoice] = useState(initialInvoiceInfo.invoice);
  const [taxInfoConfirmed, setTaxInfoConfirmed] = useState(false);
  const [serviceFeesConfirmed, setServiceFeesConfirmed] = useState(false);
  const [carrierInfoConfirmed, setCarrierInfoConfirmed] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    preferredMethod: initialInvoiceInfo.invoice.paymentMethod?.method || "bank",
    bankDetails: {
      bankName: initialInvoiceInfo.invoice.paymentMethod?.bankName || "",
      accountNumber:
        initialInvoiceInfo.invoice.paymentMethod?.bankAccount || "",
      accountHolderName:
        initialInvoiceInfo.invoice.paymentMethod?.accountHolderName || "",
    },
    mobileMoneyDetails: {
      provider: initialInvoiceInfo.invoice.paymentMethod?.type || "TeleBirr",
      phoneNumber: initialInvoiceInfo.invoice.paymentMethod?.phoneNumber || "",
      accountHolderName:
        initialInvoiceInfo.invoice.paymentMethod?.accountHolderName || "",
    },
  });
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const themeClasses = {
    modal:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    section: theme === "dark" ? "bg-gray-700" : "bg-gray-50",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
    input:
      theme === "dark"
        ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
        : "bg-white text-gray-900 border-gray-300 focus:border-blue-500",
  };

  // Add validation functions
  const validateAccountNumber = (value: string) => {
    return /^\d+$/.test(value);
  };

  const validatePhoneNumber = (value: string) => {
    return /^[+\d]+$/.test(value);
  };

  const validatePaymentInfo = () => {
    const errors: FormErrors = {};
    let isValid = true;

    if (paymentInfo.preferredMethod === "bank") {
      if (!paymentInfo.bankDetails.bankName) {
        errors.bankName = "Bank name is required";
        isValid = false;
      }
      if (!paymentInfo.bankDetails.accountNumber) {
        errors.accountNumber = "Account number is required";
        isValid = false;
      } else if (
        !validateAccountNumber(paymentInfo.bankDetails.accountNumber)
      ) {
        errors.accountNumber = "Account number must contain only numbers";
        isValid = false;
      }
      if (!paymentInfo.bankDetails.accountHolderName) {
        errors.accountHolderName = "Account holder name is required";
        isValid = false;
      }
    } else {
      if (!paymentInfo.mobileMoneyDetails.provider) {
        errors.provider = "Provider is required";
        isValid = false;
      }
      if (!paymentInfo.mobileMoneyDetails.phoneNumber) {
        errors.phoneNumber = "Phone number is required";
        isValid = false;
      } else if (
        !validatePhoneNumber(paymentInfo.mobileMoneyDetails.phoneNumber)
      ) {
        errors.phoneNumber = "Invalid phone number format";
        isValid = false;
      }
      if (!paymentInfo.mobileMoneyDetails.accountHolderName) {
        errors.accountHolderName = "Account holder name is required";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  // Update payment method change handler
  const handlePaymentMethodChange = (method: "bank" | "mobile_money") => {
    setPaymentInfo((prev) => ({
      ...prev,
      preferredMethod: method,
    }));
    setFormErrors({}); // Clear errors when switching methods
  };

  // Update the bank details input handlers
  const handleBankDetailsChange = (field: string, value: string) => {
    if (field === "accountNumber" && !validateAccountNumber(value)) {
      return; // Don't update if not a valid number
    }

    setPaymentInfo((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value,
      },
    }));
    // Clear error for this field
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Update the mobile money input handlers
  const handleMobileMoneyDetailsChange = (field: string, value: string) => {
    if (field === "phoneNumber" && !validatePhoneNumber(value)) {
      return; // Don't update if not a valid phone number
    }

    setPaymentInfo((prev) => ({
      ...prev,
      mobileMoneyDetails: {
        ...prev.mobileMoneyDetails,
        [field]: value,
      },
    }));
    // Clear error for this field
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const deductions = calculateCarrierDeductions(
    initialInvoiceInfo.load.offerAmount
  );

  const isPaymentInfoComplete = () => {
    if (paymentInfo.preferredMethod === "bank") {
      return (
        paymentInfo.bankDetails.bankName &&
        paymentInfo.bankDetails.accountNumber &&
        paymentInfo.bankDetails.accountHolderName
      );
    } else {
      return (
        paymentInfo.mobileMoneyDetails.provider &&
        paymentInfo.mobileMoneyDetails.phoneNumber &&
        paymentInfo.mobileMoneyDetails.accountHolderName
      );
    }
  };

  const validateInvoice = (
    invoice: InvoiceRequest
  ): { isValid: boolean; error?: string } => {
    if (!invoice.loadId) {
      return { isValid: false, error: "Load information is missing" };
    }
    if (!invoice.carrierId) {
      console.log("invoice details", invoice);
      return {
        isValid: false,
        error: "Carrier info is missing" + invoice.loadId,
      };
    }
    if (!invoice.paymentMethod.paymentType) {
      return { isValid: false, error: "Payment method is required" };
    }
    if (
      invoice.paymentMethod.paymentType === "bank" &&
      (!invoice.paymentMethod.bankName ||
        !invoice.paymentMethod.bankAccount ||
        !invoice.paymentMethod.accountHolderName)
    ) {
      return { isValid: false, error: "Bank details are incomplete" };
    }
    if (
      invoice.paymentMethod.paymentType === "mobile_money" &&
      (!invoice.paymentMethod.type ||
        !invoice.paymentMethod.phoneNumber ||
        !invoice.paymentMethod.accountHolderName)
    ) {
      return { isValid: false, error: "Mobile money details are incomplete" };
    }
    return { isValid: true };
  };

  const handlePublishInvoice = async () => {
    if (!validatePaymentInfo()) {
      return;
    }

    try {
      const invoiceRequest: InvoiceRequest = {
        id: 2,
        loadId: initialInvoiceInfo.load.loadId,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        carrierId: initialInvoiceInfo.carrier.id,
        createdAt: new Date().toISOString(),
        amountDue: initialInvoiceInfo.load.offerAmount,
        totalAmount: deductions.finalAmount,
        totalVat: deductions.vat,
        withholding: deductions.withholding,
        serviceFees: deductions.serviceFee,
        note: "",
        transactionId: "",
        paymentMethod: formatPaymentMethodForApi(paymentInfo),
      };

      const validation = validateInvoice(invoiceRequest);
      if (!validation.isValid) {
        setFeedback({
          type: "error",
          message: validation.error || "Invalid invoice data",
        });
        return;
      }

      // Direct API call
      const response = await generateInvoice(token, invoiceRequest);

      if (response) {
        setFeedback({
          type: "success",
          message: "Invoice published successfully!",
        });
      }
    } catch (error: any) {
      console.error("Error publishing invoice:", error);
      setFeedback({
        type: "error",
        message: error.message || "Failed to publish invoice",
      });
    }
  };

  // Update payment method save handler
  const handleSavePaymentMethod = () => {
    const formData = new FormData();
    formData.append("intent", "save-payment");
    formData.append("paymentMethod", JSON.stringify(paymentInfo));
    submit(formData, { method: "post" });
  };

  // Handle action results
  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        setFeedback({
          type: "error",
          message: actionData.error,
        });
      } else if (actionData.success) {
        if (actionData.invoice) {
          setFeedback({
            type: "success",
            message: "Invoice published successfully!",
          });
        } else if (actionData.paymentMethod) {
          alert("Payment information saved successfully!");
          setSavePaymentInfo(false);
        }
      }
    }
  }, [actionData]);

  // Autofill account holder name with carrier's full name
  useEffect(() => {
    const carrierFullName = `${initialInvoiceInfo.carrier.name}`.trim();
    setPaymentInfo((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        accountHolderName: carrierFullName,
      },
      mobileMoneyDetails: {
        ...prev.mobileMoneyDetails,
        accountHolderName: carrierFullName,
      },
    }));
  }, [initialInvoiceInfo.carrier.name]);

  // Single isPublishing declaration using navigation state
  const isPublishing =
    navigation.state === "submitting" &&
    navigation.formData?.get("_action") === "publish_invoice";

  // Add ref for payment section
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const FeedbackModal = () => {
    if (!feedback) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className={`${themeClasses.modal} p-6 rounded-lg shadow-xl max-w-md w-full`}
        >
          <div
            className={`text-center ${
              feedback.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            <p className="text-lg font-semibold mb-4">{feedback.message}</p>
            {feedback.type === "success" ? (
              <button
                onClick={() => {
                  setFeedback(null);
                  navigate("/carriers/dashboard/invoices");
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                OK
              </button>
            ) : (
              <button
                onClick={() => setFeedback(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.modal} w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">
            Invoice {invoice.invoiceNumber}
          </h2>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <PrinterIcon className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowDownTrayIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate("/carriers/dashboard/invoices")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6 space-y-6">
          {/* From (Carrier) and To (Shipper) sections */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">From (Carrier):</h3>
              <div className={`${themeClasses.section} p-4 rounded`}>
                <p>{initialInvoiceInfo.carrier.name}</p>
                <p>{initialInvoiceInfo.carrier.companyName}</p>
                <p>{initialInvoiceInfo.carrier.address}</p>
                <p>Tax ID: {initialInvoiceInfo.carrier.taxId}</p>
                <p>{initialInvoiceInfo.carrier.email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">To (Shipper):</h3>
              <div className={`${themeClasses.section} p-4 rounded`}>
                <p>{initialInvoiceInfo.shipper.name}</p>
                <p>{initialInvoiceInfo.shipper.companyName}</p>
                <p>{initialInvoiceInfo.shipper.address}</p>
                <p>Tax ID: {initialInvoiceInfo.shipper.taxId}</p>
                <p>{initialInvoiceInfo.shipper.email}</p>
              </div>
            </div>
          </div>

          {/* Payment Information Section */}
          <div
            ref={paymentSectionRef}
            className={`${themeClasses.section} p-4 rounded`}
          >
            <h3 className="font-semibold mb-4">Payment Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Payment Method</label>
                <select
                  value={paymentInfo.preferredMethod}
                  onChange={(e) =>
                    handlePaymentMethodChange(
                      e.target.value as "bank" | "mobile_money"
                    )
                  }
                  className={`w-full p-2 rounded ${themeClasses.input}`}
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>

              {paymentInfo.preferredMethod === "bank" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={paymentInfo.bankDetails.bankName}
                    onChange={(e) =>
                      handleBankDetailsChange("bankName", e.target.value)
                    }
                    className={`w-full p-2 rounded ${themeClasses.input} ${
                      formErrors.bankName ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.bankName && (
                    <p className="text-red-500 text-sm">
                      {formErrors.bankName}
                    </p>
                  )}

                  <input
                    type="text"
                    placeholder="Account Number"
                    value={paymentInfo.bankDetails.accountNumber}
                    onChange={(e) =>
                      handleBankDetailsChange("accountNumber", e.target.value)
                    }
                    className={`w-full p-2 rounded ${themeClasses.input} ${
                      formErrors.accountNumber ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.accountNumber && (
                    <p className="text-red-500 text-sm">
                      {formErrors.accountNumber}
                    </p>
                  )}

                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={paymentInfo.bankDetails.accountHolderName}
                    onChange={(e) =>
                      handleBankDetailsChange(
                        "accountHolderName",
                        e.target.value
                      )
                    }
                    className={`w-full p-2 rounded ${themeClasses.input} ${
                      formErrors.accountHolderName ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.accountHolderName && (
                    <p className="text-red-500 text-sm">
                      {formErrors.accountHolderName}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={paymentInfo.mobileMoneyDetails.provider}
                    onChange={(e) =>
                      handleMobileMoneyDetailsChange("provider", e.target.value)
                    }
                    className={`w-full p-2 rounded ${themeClasses.input} ${
                      formErrors.provider ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select Provider</option>
                    <option value="TeleBirr">TeleBirr</option>
                    <option value="CBEBirr">CBE Birr</option>
                    <option value="HelloCash">HelloCash</option>
                    <option value="AmolePay">Amole Pay</option>
                  </select>
                  {formErrors.provider && (
                    <p className="text-red-500 text-sm">
                      {formErrors.provider}
                    </p>
                  )}

                  <input
                    type="text"
                    placeholder="Phone Number (e.g., +251...)"
                    value={paymentInfo.mobileMoneyDetails.phoneNumber}
                    onChange={(e) =>
                      handleMobileMoneyDetailsChange(
                        "phoneNumber",
                        e.target.value
                      )
                    }
                    className={`w-full p-2 rounded ${themeClasses.input} ${
                      formErrors.phoneNumber ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-red-500 text-sm">
                      {formErrors.phoneNumber}
                    </p>
                  )}

                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={paymentInfo.mobileMoneyDetails.accountHolderName}
                    onChange={(e) =>
                      handleMobileMoneyDetailsChange(
                        "accountHolderName",
                        e.target.value
                      )
                    }
                    className={`w-full p-2 rounded ${themeClasses.input} ${
                      formErrors.accountHolderName ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.accountHolderName && (
                    <p className="text-red-500 text-sm">
                      {formErrors.accountHolderName}
                    </p>
                  )}
                </div>
              )}

              {/* Save Payment Info Option */}
              {isPaymentInfoComplete() && (
                <div className="mt-4 space-y-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={savePaymentInfo}
                      onChange={(e) => setSavePaymentInfo(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">
                      Save this payment method for future use
                    </span>
                  </label>

                  {savePaymentInfo && (
                    <Form method="post">
                      <input
                        type="hidden"
                        name="_action"
                        value="save-payment"
                      />
                      <input type="hidden" name="intent" value="save-payment" />
                      <input
                        type="hidden"
                        name="paymentMethod"
                        value={JSON.stringify(
                          formatPaymentMethodForApi(paymentInfo)
                        )}
                      />
                      <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors duration-300"
                      >
                        Save Payment Information
                      </button>
                    </Form>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add Load Details Section */}
          <div className={`${themeClasses.section} p-4 rounded mt-4`}>
            <h3 className="font-semibold mb-4">Load Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={themeClasses.subtext}>Origin</p>
                <p>{initialInvoiceInfo.load.origin}</p>
              </div>
              <div>
                <p className={themeClasses.subtext}>Destination</p>
                <p>{initialInvoiceInfo.load.destination}</p>
              </div>
              <div>
                <p className={themeClasses.subtext}>Pickup Date</p>
                <p>
                  {new Date(
                    initialInvoiceInfo.load.pickupDate
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className={themeClasses.subtext}>Delivery Date</p>
                <p>
                  {new Date(
                    initialInvoiceInfo.load.deliveryDate
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className={themeClasses.subtext}>Commodity</p>
                <p>{initialInvoiceInfo.load.commodity}</p>
              </div>
              <div>
                <p className={themeClasses.subtext}>Weight</p>
                <p>{initialInvoiceInfo.load.weight} kg</p>
              </div>
            </div>
          </div>

          {/* Update Charges Section */}
          <div className={`${themeClasses.section} p-4 rounded`}>
            <h3 className="font-semibold mb-4">Payment Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <p>Base Rate</p>
                <p>
                  ETB {initialInvoiceInfo.load.offerAmount.toLocaleString()}
                </p>
              </div>

              {/* Deductions Section */}
              <div className="border-t border-b py-2 my-2">
                <h4 className="font-medium text-red-500 mb-2">Deductions:</h4>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between text-red-500">
                    <p>
                      Platform Service Fee (
                      {FEES_AND_TAXES.SERVICE_FEE_RATE * 100}%)
                    </p>
                    <p>- ETB {deductions.serviceFee.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <p>VAT ({FEES_AND_TAXES.VAT_RATE * 100}%)</p>
                    <p>- ETB {deductions.vat.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <p>
                      Withholding Tax (
                      {FEES_AND_TAXES.WITHHOLDING_TAX_RATE * 100}%)
                    </p>
                    <p>- ETB {deductions.withholding.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between font-medium text-red-500 border-t border-red-200 pt-2">
                    <p>Total Deductions</p>
                    <p>- ETB {deductions.totalDeductions.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Final Amount */}
              <div className="flex justify-between font-bold text-lg pt-2">
                <p>You Will Receive</p>
                <p>ETB {deductions.finalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Updated Confirmations */}
          <div className="space-y-4">
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={carrierInfoConfirmed}
                onChange={(e) => setCarrierInfoConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I confirm that my payment information is correct and complete
              </span>
            </label>

            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={taxInfoConfirmed}
                onChange={(e) => setTaxInfoConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I understand that ETB {deductions.vat.toLocaleString()} (VAT)
                and ETB {deductions.withholding.toLocaleString()} (Withholding
                Tax) will be automatically deducted and paid to the government
              </span>
            </label>

            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={serviceFeesConfirmed}
                onChange={(e) => setServiceFeesConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I agree to the {FEES_AND_TAXES.SERVICE_FEE_RATE * 100}% platform
                service fee of ETB {deductions.serviceFee.toLocaleString()}
              </span>
            </label>
          </div>

          {/* Send Button Section */}
          <Form
            method="post"
            onSubmit={(e) => {
              if (!isPaymentInfoComplete()) {
                e.preventDefault();

                // Highlight missing fields
                const errors: FormErrors = {};
                if (paymentInfo.preferredMethod === "bank") {
                  if (!paymentInfo.bankDetails.bankName) {
                    errors.bankName = "Please enter your bank name";
                  }
                  if (!paymentInfo.bankDetails.accountNumber) {
                    errors.accountNumber = "Please enter your account number";
                  }
                  if (!paymentInfo.bankDetails.accountHolderName) {
                    errors.accountHolderName =
                      "Please enter account holder name";
                  }
                } else {
                  if (!paymentInfo.mobileMoneyDetails.provider) {
                    errors.provider =
                      "Please select your mobile money provider";
                  }
                  if (!paymentInfo.mobileMoneyDetails.phoneNumber) {
                    errors.phoneNumber = "Please enter your phone number";
                  }
                  if (!paymentInfo.mobileMoneyDetails.accountHolderName) {
                    errors.accountHolderName =
                      "Please enter account holder name";
                  }
                }
                setFormErrors(errors);

                // Scroll to payment section
                paymentSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });

                return;
              }
            }}
          >
            <input type="hidden" name="_action" value="publish_invoice" />
            <input
              type="hidden"
              name="loadId"
              value={initialInvoiceInfo.load.loadId}
            />
            <input
              type="hidden"
              name="amountDue"
              value={initialInvoiceInfo.load.offerAmount}
            />
            <input
              type="hidden"
              name="totalAmount"
              value={deductions.finalAmount}
            />
            <input type="hidden" name="totalVat" value={deductions.vat} />
            <input
              type="hidden"
              name="withholding"
              value={deductions.withholding}
            />
            <input
              type="hidden"
              name="serviceFees"
              value={deductions.serviceFee}
            />
            <input type="hidden" name="note" value="" />
            <input
              type="hidden"
              name="paymentMethod"
              value={JSON.stringify({
                paymentType: paymentInfo.preferredMethod,
                carrierId: initialInvoiceInfo.carrier.id,
                bankName: paymentInfo.bankDetails.bankName,
                bankAccount: paymentInfo.bankDetails.accountNumber,
                accountHolderName: paymentInfo.bankDetails.accountHolderName,
                phoneNumber: "",
                cardMethod: "",
                cardType: "",
                lastFourDigits: "",
                billingAddress: "",
              })}
            />
            <input
              type="hidden"
              name="commodity"
              value={initialInvoiceInfo.load.commodity}
            />
            <input
              type="hidden"
              name="origin"
              value={initialInvoiceInfo.load.origin}
            />
            <input
              type="hidden"
              name="destination"
              value={initialInvoiceInfo.load.destination}
            />

            <button
              type="submit"
              disabled={
                !carrierInfoConfirmed ||
                !taxInfoConfirmed ||
                !serviceFeesConfirmed ||
                isPublishing
              }
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-300 flex items-center justify-center
                ${
                  carrierInfoConfirmed &&
                  taxInfoConfirmed &&
                  serviceFeesConfirmed &&
                  !isPublishing
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-gray-300 cursor-not-allowed text-gray-500"
                }`}
            >
              {isPublishing ? (
                <>
                  <Loader size={20} className="mr-2" />
                  Publishing...
                </>
              ) : (
                "Publish Invoice"
              )}
            </button>
          </Form>
        </div>

        {/* Add feedback modal */}
        {feedback && <FeedbackModal />}
      </div>
    </div>
  );
}
