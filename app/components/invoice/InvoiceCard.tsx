import { type Invoice } from "~/api/mocks/invoiceData";
import {
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  ReceiptRefundIcon,
} from "@heroicons/react/24/outline";

interface InvoiceCardProps {
  invoice: Invoice;
  theme: "light" | "dark";
  onClick: (invoice: Invoice) => void;
}

export function InvoiceCard({ invoice, theme, onClick }: InvoiceCardProps) {
  const themeClasses = {
    card:
      theme === "dark"
        ? "bg-gray-800 border-gray-700"
        : "bg-white border-gray-200",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
    status: {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    },
  };

  return (
    <div
      className={`${themeClasses.card} border rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer`}
      onClick={() => onClick(invoice)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            {invoice.status === "paid" ? (
              <ReceiptRefundIcon className="h-5 w-5 text-green-500" />
            ) : (
              <DocumentTextIcon className="h-5 w-5" />
            )}
            <h3 className={`${themeClasses.text} font-semibold text-lg`}>
              {invoice.invoiceNumber}
            </h3>
          </div>
          <p className={`${themeClasses.subtext} text-sm mt-1`}>
            Load ID: {invoice.loadId}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            themeClasses.status[invoice.status]
          }`}
        >
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className={`${themeClasses.subtext} text-sm`}>Issue Date</p>
          <p className={`${themeClasses.text}`}>
            {new Date(invoice.issueDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className={`${themeClasses.subtext} text-sm`}>Due Date</p>
          <p className={`${themeClasses.text}`}>
            {new Date(invoice.dueDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className={`${themeClasses.subtext} text-sm`}>Amount Due</p>
          <p className={`${themeClasses.text} font-semibold`}>
            ETB {invoice.amountDue.toLocaleString()}
          </p>
        </div>
        <ArrowTopRightOnSquareIcon className="h-5 w-5" />
      </div>

      <div className="mt-2 text-sm">
        <p className={themeClasses.subtext}>
          Created: {new Date(invoice.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
