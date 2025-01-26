import { useState } from "react";
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

interface InvoiceInfo {
  load: Load;
  shipper: Shipper;
  carrier: Carrier;
  invoice: Invoice;
}

interface CarrierInvoiceDetailProps {
  invoiceInfo: InvoiceInfo;
  theme: "light" | "dark";
  onClose: () => void;
}

export function CarrierInvoiceDetail({
  invoiceInfo: initialInvoiceInfo,
  theme,
  onClose,
}: CarrierInvoiceDetailProps) {
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

  const handlePaymentMethodChange = (method: "bank" | "mobile_money") => {
    setPaymentInfo((prev) => ({
      ...prev,
      preferredMethod: method,
    }));
  };

  const handleSendInvoice = () => {
    // Here we'll add the API call to send the invoice to the shipper
    // For now, just close the modal
    console.log("Invoice sent to shipper:", {
      ...invoice,
      carrier: {
        ...initialInvoiceInfo.carrier,
        paymentInfo,
      },
    });
    onClose();
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
        paymentInfo.mobileMoneyDetails.accountName
      );
    }
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
              onClick={onClose}
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
          <div className={`${themeClasses.section} p-4 rounded`}>
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
                      setPaymentInfo((prev) => ({
                        ...prev,
                        bankDetails: {
                          ...prev.bankDetails,
                          bankName: e.target.value,
                        },
                      }))
                    }
                    className={`w-full p-2 rounded ${themeClasses.input}`}
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={paymentInfo.bankDetails.accountNumber}
                    onChange={(e) =>
                      setPaymentInfo((prev) => ({
                        ...prev,
                        bankDetails: {
                          ...prev.bankDetails,
                          accountNumber: e.target.value,
                        },
                      }))
                    }
                    className={`w-full p-2 rounded ${themeClasses.input}`}
                  />
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={paymentInfo.bankDetails.accountHolderName}
                    onChange={(e) =>
                      setPaymentInfo((prev) => ({
                        ...prev,
                        bankDetails: {
                          ...prev.bankDetails,
                          accountHolderName: e.target.value,
                        },
                      }))
                    }
                    className={`w-full p-2 rounded ${themeClasses.input}`}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={paymentInfo.mobileMoneyDetails.provider}
                    onChange={(e) =>
                      setPaymentInfo((prev) => ({
                        ...prev,
                        mobileMoneyDetails: {
                          ...prev.mobileMoneyDetails,
                          provider: e.target.value as any,
                        },
                      }))
                    }
                    className={`w-full p-2 rounded ${themeClasses.input}`}
                  >
                    <option value="TeleBirr">TeleBirr</option>
                    <option value="CBEBirr">CBE Birr</option>
                    <option value="HelloCash">HelloCash</option>
                    <option value="AmolePay">Amole Pay</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={paymentInfo.mobileMoneyDetails.phoneNumber}
                    onChange={(e) =>
                      setPaymentInfo((prev) => ({
                        ...prev,
                        mobileMoneyDetails: {
                          ...prev.mobileMoneyDetails,
                          phoneNumber: e.target.value,
                        },
                      }))
                    }
                    className={`w-full p-2 rounded ${themeClasses.input}`}
                  />
                  <input
                    type="text"
                    placeholder="Account Name"
                    value={paymentInfo.mobileMoneyDetails.accountName}
                    onChange={(e) =>
                      setPaymentInfo((prev) => ({
                        ...prev,
                        mobileMoneyDetails: {
                          ...prev.mobileMoneyDetails,
                          accountName: e.target.value,
                        },
                      }))
                    }
                    className={`w-full p-2 rounded ${themeClasses.input}`}
                  />
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
                    <button
                      onClick={() => {
                        // Here we'll add the API call to save the payment info
                        console.log("Saving payment info:", paymentInfo);
                        // Show success message
                        alert("Payment information saved successfully!");
                        setSavePaymentInfo(false);
                      }}
                      className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors duration-300"
                    >
                      Save Payment Information
                    </button>
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

          {/* Send Button */}
          <button
            onClick={handleSendInvoice}
            disabled={
              !carrierInfoConfirmed ||
              !taxInfoConfirmed ||
              !serviceFeesConfirmed
            }
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-300
              ${
                carrierInfoConfirmed && taxInfoConfirmed && serviceFeesConfirmed
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
          >
            Send Invoice to Shipper
          </button>
        </div>
      </div>
    </div>
  );
}
