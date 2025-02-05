import { useState } from "react";
import type { Receipt } from "~/api/mocks/receiptData";
import {
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { Invoice } from "~/api/models/invoice";

interface ReceiptProps {
  invoice: Invoice;
  theme: "light" | "dark";
  onClose: () => void;
}

export function Receipt({ invoice, theme, onClose }: ReceiptProps) {
  const [showShare, setShowShare] = useState(false);

  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    header: theme === "dark" ? "bg-gray-700" : "bg-gray-50",
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
      title: `Payment Receipt - ${invoice.invoiceNumber}`,
      text: `Payment receipt for invoice ${invoice.invoiceNumber}`,
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
    <div
      className={`${themeClasses.container} max-w-2xl mx-auto rounded-lg shadow-xl p-6`}
    >
      <div className={`${themeClasses.header} p-4 rounded-t-lg`}>
        <h2 className="text-2xl font-bold mb-2">Payment Receipt</h2>
        <p className="text-sm">Transaction ID: {invoice.transactionId}</p>
        <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold">Payment Details</h3>
          <p>Invoice Number: {invoice.invoiceNumber}</p>
          <p>Amount Paid: ETB {invoice.amountDue.toLocaleString()}</p>
          <p>Status: {invoice.status}</p>
        </div>

        <button
          onClick={onClose}
          className={`mt-6 px-4 py-2 rounded-md ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          Close Receipt
        </button>
      </div>
    </div>
  );
}
