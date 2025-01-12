import { useState } from "react";
import type { Receipt } from "~/api/mocks/receiptData";
import {
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ReceiptProps {
  receipt: Receipt;
  theme: "light" | "dark";
  onClose: () => void;
}

export function Receipt({ receipt, theme, onClose }: ReceiptProps) {
  const [showShare, setShowShare] = useState(false);

  const themeClasses = {
    container: theme === "dark" ? "bg-gray-800" : "bg-white",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    button: {
      primary: "bg-orange-500 hover:bg-orange-600 text-white",
      secondary:
        theme === "dark"
          ? "bg-gray-700 hover:bg-gray-600 text-white"
          : "bg-gray-100 hover:bg-gray-200 text-gray-900",
    },
  };

  const handleDownload = () => {
    // Implementation for PDF download
    console.log("Downloading receipt...");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: `Payment Receipt - ${receipt.receiptNumber}`,
      text: `Payment receipt for invoice ${receipt.invoiceNumber}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert("Receipt link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`${themeClasses.container} w-full max-w-2xl rounded-lg shadow-xl relative`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Receipt Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-orange-500">
              Payment Receipt
            </h2>
            <p className={themeClasses.subtext}>
              Receipt #{receipt.receiptNumber}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className={`${themeClasses.text} font-semibold mb-2`}>
                From
              </h3>
              <p className={themeClasses.text}>{receipt.payer.companyName}</p>
              <p className={themeClasses.subtext}>{receipt.payer.name}</p>
              <p className={themeClasses.subtext}>
                Tax ID: {receipt.payer.taxId}
              </p>
            </div>
            <div>
              <h3 className={`${themeClasses.text} font-semibold mb-2`}>To</h3>
              <p className={themeClasses.text}>
                {receipt.recipient.companyName}
              </p>
              <p className={themeClasses.subtext}>{receipt.recipient.name}</p>
              <p className={themeClasses.subtext}>
                Tax ID: {receipt.recipient.taxId}
              </p>
            </div>
          </div>

          <div className={`border-t ${themeClasses.border} py-4 mb-4`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={themeClasses.subtext}>Payment Date</p>
                <p className={themeClasses.text}>
                  {new Date(receipt.paidAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className={themeClasses.subtext}>Transaction ID</p>
                <p className={themeClasses.text}>{receipt.transactionId}</p>
              </div>
              <div>
                <p className={themeClasses.subtext}>Payment Method</p>
                <p className={themeClasses.text}>{receipt.paymentMethod}</p>
              </div>
              <div>
                <p className={themeClasses.subtext}>Invoice Number</p>
                <p className={themeClasses.text}>{receipt.invoiceNumber}</p>
              </div>
            </div>
          </div>

          <div className={`border-t ${themeClasses.border} py-4 mb-6`}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className={themeClasses.text}>Subtotal</p>
                <p className={themeClasses.text}>
                  ETB{" "}
                  {(
                    receipt.paidAmount -
                    receipt.taxes.VAT -
                    receipt.taxes.withholding
                  ).toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between">
                <p className={themeClasses.subtext}>VAT (15%)</p>
                <p className={themeClasses.subtext}>
                  ETB {receipt.taxes.VAT.toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between">
                <p className={themeClasses.subtext}>Withholding Tax (2%)</p>
                <p className={themeClasses.subtext}>
                  ETB {receipt.taxes.withholding.toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between font-bold mt-4">
                <p className={themeClasses.text}>Total Paid</p>
                <p className={themeClasses.text}>
                  ETB {receipt.paidAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleDownload}
              className={`${themeClasses.button.secondary} px-4 py-2 rounded-md flex items-center`}
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Download
            </button>
            <button
              onClick={handlePrint}
              className={`${themeClasses.button.secondary} px-4 py-2 rounded-md flex items-center`}
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              Print
            </button>
            <button
              onClick={handleShare}
              className={`${themeClasses.button.secondary} px-4 py-2 rounded-md flex items-center`}
            >
              <ShareIcon className="h-5 w-5 mr-2" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
