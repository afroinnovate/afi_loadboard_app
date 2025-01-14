import { useState } from "react";
import type { Invoice } from "~/api/models/invoice";
import {
  XMarkIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { FEES_AND_TAXES, calculateShipperCharges } from "~/utils/constants";

interface ShipperInvoiceDetailProps {
  invoice: Invoice;
  theme: "light" | "dark";
  onClose: () => void;
  onMessageCarrier: (carrierId: string) => void;
}

export function ShipperInvoiceDetail({
  invoice: initialInvoice,
  theme,
  onClose,
  onMessageCarrier,
}: ShipperInvoiceDetailProps) {
  const [invoice] = useState(initialInvoice);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [serviceFeesAccepted, setServiceFeesAccepted] = useState(false);

  const charges = calculateShipperCharges(invoice.charges.baseRate);

  const themeClasses = {
    modal:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    section: theme === "dark" ? "bg-gray-700" : "bg-gray-50",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
  };

  const handlePayment = async () => {
    if (!termsAccepted || !serviceFeesAccepted) return;

    try {
      // Here we'll add the payment processing logic
      console.log("Processing payment:", {
        totalAmount: charges.finalAmount,
        invoiceId: invoice.id,
      });

      // Close the modal after successful payment
      onClose();
    } catch (error) {
      console.error("Payment failed:", error);
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
            <button
              onClick={() => onMessageCarrier(invoice.carrier.id)}
              className="p-2 hover:bg-gray-100 rounded-full text-blue-500"
              title="Message Carrier"
            >
              <ChatBubbleLeftIcon className="w-6 h-6" />
            </button>
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
                <p>{invoice.carrier.name}</p>
                <p>{invoice.carrier.companyName}</p>
                <p>{invoice.carrier.address}</p>
                <p>Tax ID: {invoice.carrier.taxId}</p>
                <p>{invoice.carrier.email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">To (Shipper):</h3>
              <div className={`${themeClasses.section} p-4 rounded`}>
                <p>{invoice.shipper.name}</p>
                <p>{invoice.shipper.companyName}</p>
                <p>{invoice.shipper.address}</p>
                <p>Tax ID: {invoice.shipper.taxId}</p>
                <p>{invoice.shipper.email}</p>
              </div>
            </div>
          </div>

          {/* Load Details */}
          <div className={`${themeClasses.section} p-4 rounded`}>
            <h3 className="font-semibold mb-2">Load Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <p>Origin: {invoice.load.origin}</p>
              <p>Destination: {invoice.load.destination}</p>
              <p>Commodity: {invoice.load.commodity}</p>
              <p>Weight: {invoice.load.weight} kg</p>
              <p>
                Delivery Date:{" "}
                {new Date(invoice.load.deliveryDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className={`${themeClasses.section} p-4 rounded`}>
            <h3 className="font-semibold mb-4">Payment Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p>Base Rate</p>
                <p>ETB {invoice.charges.baseRate.toLocaleString()}</p>
              </div>

              {/* Additional Charges */}
              <div className="border-t border-b py-2 my-2">
                <h4 className="font-medium text-blue-500 mb-2">
                  Additional Charges:
                </h4>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between text-blue-500">
                    <p>
                      Loading Fee ({FEES_AND_TAXES.LOADING_FEE_RATE * 100}%)
                    </p>
                    <p>+ ETB {charges.loadingFee.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between text-blue-500">
                    <p>Insurance ({FEES_AND_TAXES.INSURANCE_RATE * 100}%)</p>
                    <p>+ ETB {charges.insurance.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between text-blue-500">
                    <p>
                      Platform Service Fee (
                      {FEES_AND_TAXES.SHIPPER_SERVICE_FEE_RATE * 100}%)
                    </p>
                    <p>
                      + ETB{" "}
                      {(
                        invoice.charges.baseRate *
                        FEES_AND_TAXES.SHIPPER_SERVICE_FEE_RATE
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Final Amount */}
              <div className="flex justify-between font-bold text-lg pt-2">
                <p>Total Payment Required</p>
                <p>ETB {charges.finalAmount.toLocaleString()}</p>
              </div>

              {/* Carrier Payment Info */}
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Amount to be received by carrier: ETB{" "}
                  {(invoice.charges.baseRate * 0.82).toLocaleString()}
                  <br />
                  <span className="text-xs">
                    (After deduction of VAT, Withholding Tax, and Carrier
                    Service Fee)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Confirmations */}
          <div className="space-y-4">
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={serviceFeesAccepted}
                onChange={(e) => setServiceFeesAccepted(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I agree to the {FEES_AND_TAXES.SHIPPER_SERVICE_FEE_RATE * 100}%
                platform service fee (ETB{" "}
                {(
                  invoice.charges.baseRate *
                  FEES_AND_TAXES.SHIPPER_SERVICE_FEE_RATE
                ).toLocaleString()}
                )
              </span>
            </label>

            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I understand that this payment is final and cannot be reversed
                once processed
              </span>
            </label>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={!termsAccepted || !serviceFeesAccepted}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-300
              ${
                termsAccepted && serviceFeesAccepted
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
          >
            Pay ETB {charges.finalAmount.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}
