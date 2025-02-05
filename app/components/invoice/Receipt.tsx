import { Form } from "@remix-run/react";
import { PrinterIcon, ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { Invoice } from "~/api/models/invoice";
import type { Load } from "~/api/models/load";
import type { Carrier } from "~/api/models/carrier";
import type { LinksFunction } from "@remix-run/node";

interface ReceiptProps {
  invoice: Invoice;
  load: Load;
  theme: "light" | "dark";
}

export const links: LinksFunction = () => [
  {
    rel: "preload",
    href: "/logo2.ico",
    as: "image",
  },
];

export function Receipt({ invoice, load, theme }: ReceiptProps) {
  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    header: theme === "dark" ? "bg-gray-700" : "bg-gray-50",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    button:
      theme === "dark"
        ? "hover:bg-gray-700 text-gray-200"
        : "hover:bg-gray-100 text-gray-700",
  };

  return (
    <div className={`${themeClasses.container} p-6`}>
      {/* Header with Logo */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center">
          <img 
            src="/logo2.ico" 
            alt="AfroInnovate Logo" 
            className="h-10 w-auto mr-2" 
          />
          <div>
            <h1 className="text-2xl font-bold text-orange-500">AFI LoadBoard</h1>
            <p className="text-sm text-gray-500">www.afiloadboard.com</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Form method="post">
            <button
              type="submit"
              name="_action"
              value="print"
              className={`p-2 rounded-full ${themeClasses.button}`}
              title="Print Receipt"
            >
              <PrinterIcon className="w-6 h-6" />
            </button>
          </Form>
          <Form method="post">
            <button
              type="submit"
              name="_action"
              value="download"
              className={`p-2 rounded-full ${themeClasses.button}`}
              title="Download Receipt"
            >
              <ArrowDownTrayIcon className="w-6 h-6" />
            </button>
          </Form>
          <Form method="post">
            <button
              type="submit"
              name="_action"
              value="close"
              className={`p-2 rounded-full ${themeClasses.button}`}
              title="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </Form>
        </div>
      </div>

      {/* Receipt Details */}
      <div className={`${themeClasses.header} p-4 rounded-lg mb-6`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Receipt Number:</p>
            <p>{invoice.transactionId}</p>
            <p className="mt-2 font-semibold">Invoice Number:</p>
            <p>{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Payment Date:</p>
            <p>{new Date(invoice.paymentDate || invoice.issueDate).toLocaleDateString()}</p>
            <p className="mt-2 font-semibold">Due Date:</p>
            <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Carrier and Load Details */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className={`${themeClasses.header} p-4 rounded-lg`}>
          <h3 className="font-semibold mb-2">From (Carrier)</h3>
          <p>{invoice.carrier?.businessProfile?.companyName}</p>
          <p>{invoice.carrier?.firstName} {invoice.carrier?.lastName}</p>
          <p>{invoice.carrier?.email}</p>
          <p>{invoice.carrier?.phone}</p>
          {invoice.carrier?.businessProfile?.address && (
            <p>{invoice.carrier.businessProfile.address}</p>
          )}
        </div>
        <div className={`${themeClasses.header} p-4 rounded-lg`}>
          <h3 className="font-semibold mb-2">Load Details</h3>
          <p>Load ID: {load.loadId}</p>
          <p>Route: {load.origin} → {load.destination}</p>
          <p>Commodity: {load.commodity}</p>
          <p>Weight: {load.weight} kg</p>
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Payment Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <p>Service Fee:</p>
              <p>ETB {invoice.serviceFees.toLocaleString()}</p>
            </div>
            <div className="flex justify-between border-b pb-2">
              <p>VAT (15%):</p>
              <p>ETB {invoice.totalVat.toLocaleString()}</p>
            </div>
            <div className="flex justify-between border-b pb-2">
              <p>Withholding (2%):</p>
              <p>ETB {invoice.withholding.toLocaleString()}</p>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <p>Total Amount Paid:</p>
              <p>ETB {invoice.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Payment Method</h3>
          <div className={`${themeClasses.header} p-4 rounded-lg`}>
            <p>Status: {invoice.status.toUpperCase()}</p>
            {invoice.paymentMethod && (
              <>
                <p>Method: {invoice.paymentMethod.paymentType}</p>
                {invoice.paymentMethod.bankName && (
                  <p>Bank: {invoice.paymentMethod.bankName}</p>
                )}
                {invoice.paymentMethod.accountHolderName && (
                  <p>Account Holder: {invoice.paymentMethod.accountHolderName}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
        <p>Thank you for your business!</p>
        <p>For any questions, please contact support@afiloadboard.com</p>
        <p className="mt-2">© {new Date().getFullYear()} AFI LoadBoard. All rights reserved.</p>
      </div>
    </div>
  );
}
