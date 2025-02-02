import { useState } from "react";
import type { Invoice } from "~/api/models/invoice";
import {
  XMarkIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { FEES_AND_TAXES } from "~/utils/constants";
import type { Load } from "~/api/models/load";
import type { Carrier } from "~/api/models/carrier";

interface CarrierInfo {
  carrierId?: string;
  carrierName?: string | null;
  carrierEmail?: string | null;
  carrierPhone?: string | null;
  carrierBusinessName?: string | null;
  carrier?: {
    userId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    businessProfile?: {
      companyName?: string;
      address?: string;
      taxId?: string;
    };
  } | null;
}

interface ShipperInvoiceDetailProps {
  invoice: Invoice & CarrierInfo;
  load: Load;
  currentUser: any;
  theme: "light" | "dark";
  onClose: () => void;
}

const PaymentInfoSection = ({
  invoice,
  theme,
}: {
  invoice: Invoice & CarrierInfo;
  theme: "light" | "dark";
}) => {
  const themeClasses = {
    modal:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    section: theme === "dark" ? "bg-gray-700" : "bg-gray-50",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
  };

  const hasPaymentInfo = invoice.paymentMethod || invoice.paymentMethodId;

  return (
    <div
      className={`${themeClasses.section} p-4 rounded border-2 ${
        hasPaymentInfo ? "border-green-500" : "border-yellow-500"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Payment Information</h3>
        {hasPaymentInfo ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Payment Info Available
          </span>
        ) : (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Payment Info Required
          </span>
        )}
      </div>

      {hasPaymentInfo ? (
        <div className="space-y-2">
          {invoice.paymentMethodId && (
            <p>
              <span className="font-medium">Payment Method ID: </span>
              {invoice.paymentMethodId}
            </p>
          )}
          {invoice.paymentMethod && (
            <>
              <p>
                <span className="font-medium">Payment Type: </span>
                {invoice.paymentMethod.paymentType}
              </p>
              {invoice.paymentMethod.bankName && (
                <p>
                  <span className="font-medium">Bank: </span>
                  {invoice.paymentMethod.bankName}
                </p>
              )}
              {invoice.paymentMethod.accountHolderName && (
                <p>
                  <span className="font-medium">Account Holder: </span>
                  {invoice.paymentMethod.accountHolderName}
                </p>
              )}
              {invoice.paymentMethod.bankAccount && (
                <p>
                  <span className="font-medium">Account Number: </span>
                  {invoice.paymentMethod.bankAccount}
                </p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded">
          <p className="text-yellow-800 dark:text-yellow-200">
            Payment information is required to process this invoice. Please
            contact the carrier to provide their payment details.
          </p>
          <button
            className="mt-2 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100"
            onClick={() => {
              // Implement contact carrier logic
              console.log("Contact carrier for payment info");
            }}
          >
            Contact Carrier →
          </button>
        </div>
      )}
    </div>
  );
};

export function ShipperInvoiceDetail({
  invoice,
  load,
  currentUser,
  theme,
  onClose,
}: ShipperInvoiceDetailProps) {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [serviceFeesAccepted, setServiceFeesAccepted] = useState(false);

  const themeClasses = {
    modal:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    section: theme === "dark" ? "bg-gray-700" : "bg-gray-50",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
    button:
      theme === "dark"
        ? "hover:bg-gray-700 text-gray-200"
        : "hover:bg-gray-100 text-gray-700",
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implementation for PDF download
    console.log("Downloading invoice...");
  };

  const handleShare = async (platform: string) => {
    const shareText = `Invoice #${invoice.invoiceNumber} for load from ${
      load.origin
    } to ${
      load.destination
    }. Amount: ETB ${invoice.totalAmount.toLocaleString()}`;

    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
        break;
      case "messenger":
        window.open(
          `https://www.facebook.com/share/share.php?u=${encodeURIComponent(
            window.location.href
          )}`
        );
        break;
      case "message":
        if (navigator.share) {
          try {
            await navigator.share({
              title: `Invoice ${invoice.invoiceNumber}`,
              text: shareText,
              url: window.location.href,
            });
          } catch (err) {
            console.error("Error sharing:", err);
          }
        }
        break;
    }
    setShowShareOptions(false);
  };

  const handlePayment = async () => {
    if (!termsAccepted || !serviceFeesAccepted) return;

    try {
      console.log("Processing payment:", {
        totalAmount: invoice.totalAmount,
        invoiceId: invoice.id,
      });
      onClose();
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  const renderCarrierInfo = () => {
    return (
      <div>
        <h3 className="font-semibold mb-2">From (Carrier):</h3>
        <div className={`${themeClasses.section} p-4 rounded`}>
          {invoice.carrier || invoice.carrierBusinessName ? (
            <>
              {invoice.carrierBusinessName && (
                <p className="font-medium">{invoice.carrierBusinessName}</p>
              )}
              {invoice.carrierName && <p>{invoice.carrierName}</p>}
              {invoice.carrierEmail && (
                <p>
                  <span className={themeClasses.subtext}>Email: </span>
                  {invoice.carrierEmail}
                </p>
              )}
              {invoice.carrierPhone && (
                <p>
                  <span className={themeClasses.subtext}>Phone: </span>
                  {invoice.carrierPhone}
                </p>
              )}
              {invoice.carrier && (
                <>
                  {invoice.carrier.businessProfile?.companyName && (
                    <p className="font-medium">
                      {invoice.carrier.businessProfile.companyName}
                    </p>
                  )}
                  {invoice.carrier.firstName && (
                    <p>
                      <span className={themeClasses.subtext}>
                        Contact Person:{" "}
                      </span>
                      {`${invoice.carrier.firstName} ${
                        invoice.carrier.lastName || ""
                      }`}
                    </p>
                  )}
                  {invoice.carrier.businessProfile?.address && (
                    <p>
                      <span className={themeClasses.subtext}>Address: </span>
                      {invoice.carrier.businessProfile.address}
                    </p>
                  )}
                  {invoice.carrier.businessProfile?.taxId && (
                    <p>
                      <span className={themeClasses.subtext}>Tax ID: </span>
                      {invoice.carrier.businessProfile.taxId}
                    </p>
                  )}
                  {invoice.carrier.phone && (
                    <p>
                      <span className={themeClasses.subtext}>Phone: </span>
                      {invoice.carrier.phone}
                    </p>
                  )}
                </>
              )}
            </>
          ) : (
            <p className="text-gray-500 italic">
              Carrier details not available
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderShipperInfo = () => {
    return (
      <div>
        <h3 className="font-semibold mb-2">To (Shipper):</h3>
        <div className={`${themeClasses.section} p-4 rounded`}>
          {currentUser.businessProfile?.companyName && (
            <p className="font-medium">
              {currentUser.businessProfile.companyName}
            </p>
          )}
          <p>
            <span className={themeClasses.subtext}>Contact Person: </span>
            {currentUser.firstName} {currentUser.lastName}
          </p>
          {currentUser.businessProfile?.address && (
            <p>
              <span className={themeClasses.subtext}>Address: </span>
              {currentUser.businessProfile.address}
            </p>
          )}
          {currentUser.businessProfile?.taxId && (
            <p>
              <span className={themeClasses.subtext}>Tax ID: </span>
              {currentUser.businessProfile.taxId}
            </p>
          )}
          <p>
            <span className={themeClasses.subtext}>Email: </span>
            {currentUser.email}
          </p>
          {currentUser.phone && (
            <p>
              <span className={themeClasses.subtext}>Phone: </span>
              {currentUser.phone}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div
        className={`${
          themeClasses.modal
        } w-full max-w-4xl rounded-lg shadow-xl relative my-2 sm:my-8 ${
          theme === "dark" ? "border border-gray-700" : "border border-gray-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-200">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl sm:text-2xl font-bold">
              Invoice #{invoice.invoiceNumber}
            </h2>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`${themeClasses.subtext} text-sm`}>Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
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

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePrint}
              className={`p-2 rounded-full ${themeClasses.button} flex items-center`}
              title="Print Invoice"
            >
              <PrinterIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="sr-only">Print</span>
            </button>
            <button
              onClick={handleDownload}
              className={`p-2 rounded-full ${themeClasses.button} flex items-center`}
              title="Download Invoice"
            >
              <ArrowDownTrayIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="sr-only">Download</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowShareOptions(!showShareOptions)}
                className={`p-2 rounded-full ${themeClasses.button} flex items-center`}
                title="Share Invoice"
              >
                <ShareIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="sr-only">Share</span>
              </button>
              {showShareOptions && (
                <div
                  className={`absolute right-0 mt-2 py-2 w-48 ${themeClasses.modal} rounded-md shadow-xl z-10 border ${themeClasses.border}`}
                >
                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Share via WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare("messenger")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Share via Messenger
                  </button>
                  <button
                    onClick={() => handleShare("message")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Share via Message
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${themeClasses.button} flex items-center`}
              title="Close"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <PaymentInfoSection invoice={invoice} theme={theme} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {renderCarrierInfo()}
              {renderShipperInfo()}
            </div>

            <div className={`${themeClasses.section} p-4 rounded`}>
              <h3 className="font-semibold mb-4">Load Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={themeClasses.subtext}>Route</p>
                  <p>
                    {load.origin} → {load.destination}
                  </p>
                </div>
                <div>
                  <p className={themeClasses.subtext}>Load ID</p>
                  <p>{load.loadId}</p>
                </div>
                <div>
                  <p className={themeClasses.subtext}>Commodity</p>
                  <p>{load.commodity}</p>
                </div>
                <div>
                  <p className={themeClasses.subtext}>Weight</p>
                  <p>{load.weight} kg</p>
                </div>
                <div>
                  <p className={themeClasses.subtext}>Pickup Date</p>
                  <p>{new Date(load.pickupDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className={themeClasses.subtext}>Delivery Date</p>
                  <p>{new Date(load.deliveryDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className={`${themeClasses.section} p-4 rounded`}>
              <h3 className="font-semibold mb-4">Payment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p>Base Amount:</p>
                  <p>ETB {invoice.amountDue.toLocaleString()}</p>
                </div>
                <div className="flex justify-between">
                  <p>Service Fee:</p>
                  <p>ETB {invoice.serviceFees.toLocaleString()}</p>
                </div>
                <div className="flex justify-between">
                  <p>VAT (15%):</p>
                  <p>ETB {invoice.totalVat.toLocaleString()}</p>
                </div>
                <div className="flex justify-between">
                  <p>Withholding (2%):</p>
                  <p>ETB {invoice.withholding.toLocaleString()}</p>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                  <p>Total Amount:</p>
                  <p>ETB {invoice.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className={`${themeClasses.section} p-4 rounded`}>
              <h3 className="font-semibold mb-2">Additional Information</h3>
              <div className="space-y-2">
                <p>
                  <span className={themeClasses.subtext}>Invoice Date: </span>
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </p>
                <p>
                  <span className={themeClasses.subtext}>Due Date: </span>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
                {invoice.note && (
                  <p>
                    <span className={themeClasses.subtext}>Note: </span>
                    {invoice.note}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                />
                <span className="text-sm">
                  I confirm that all the information provided is correct and I
                  accept the terms and conditions of payment
                </span>
              </label>
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={serviceFeesAccepted}
                  onChange={(e) => setServiceFeesAccepted(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                />
                <span className="text-sm">
                  I understand and agree to the service fees, VAT, and
                  withholding tax charges
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 sm:p-6 sticky bottom-0 bg-inherit">
          <button
            onClick={handlePayment}
            disabled={
              !termsAccepted || !serviceFeesAccepted || !invoice.paymentMethod
            }
            className={`w-full py-2 sm:py-3 px-4 rounded-md font-medium transition-colors duration-300 ${
              termsAccepted && serviceFeesAccepted && invoice.paymentMethod
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {!invoice.paymentMethod
              ? "Payment information required"
              : !termsAccepted || !serviceFeesAccepted
              ? "Accept terms to proceed with payment"
              : `Pay ETB ${invoice.totalAmount.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
