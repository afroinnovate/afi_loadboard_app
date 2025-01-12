import { type Invoice } from "~/api/mocks/invoiceData";
import {
  XMarkIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface InvoiceDetailProps {
  invoice: Invoice;
  theme: "light" | "dark";
  onClose: () => void;
}

export function InvoiceDetail({ invoice, theme, onClose }: InvoiceDetailProps) {
  const themeClasses = {
    modal:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    section: theme === "dark" ? "bg-gray-700" : "bg-gray-50",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`${themeClasses.modal} w-full max-w-4xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b ${themeClasses.border}">
          <h2 className="text-2xl font-bold">
            Invoice {invoice.invoiceNumber}
          </h2>
          <div className="flex gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <PrinterIcon className="h-6 w-6" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowDownTrayIcon className="h-6 w-6" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Parties Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">From</h3>
              <div className={`${themeClasses.section} p-4 rounded`}>
                <p className="font-medium">{invoice.shipper.companyName}</p>
                <p className={themeClasses.subtext}>
                  {invoice.shipper.address}
                </p>
                <p className={themeClasses.subtext}>
                  Tax ID: {invoice.shipper.taxId}
                </p>
                <p className={themeClasses.subtext}>{invoice.shipper.email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">To</h3>
              <div className={`${themeClasses.section} p-4 rounded`}>
                <p className="font-medium">{invoice.carrier.companyName}</p>
                <p className={themeClasses.subtext}>
                  {invoice.carrier.address}
                </p>
                <p className={themeClasses.subtext}>
                  Tax ID: {invoice.carrier.taxId}
                </p>
                <p className={themeClasses.subtext}>{invoice.carrier.email}</p>
              </div>
            </div>
          </div>

          {/* Load Details */}
          <div className={`${themeClasses.section} p-4 rounded`}>
            <h3 className="font-semibold mb-2">Load Details</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className={themeClasses.subtext}>Route</p>
                <p>
                  {invoice.load.origin} → {invoice.load.destination}
                </p>
              </div>
              <div>
                <p className={themeClasses.subtext}>Delivery Date</p>
                <p>
                  {new Date(invoice.load.deliveryDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className={themeClasses.subtext}>Weight</p>
                <p>{invoice.load.weight.toLocaleString()} kg</p>
              </div>
            </div>
          </div>

          {/* Charges */}
          <div className={`${themeClasses.section} p-4 rounded`}>
            <h3 className="font-semibold mb-4">Charges</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p>Base Rate</p>
                <p>ETB {invoice.charges.baseRate.toLocaleString()}</p>
              </div>
              {invoice.charges.additionalServices.map((service, index) => (
                <div key={index} className="flex justify-between">
                  <p>{service.description}</p>
                  <p>ETB {service.amount.toLocaleString()}</p>
                </div>
              ))}
              <div className="border-t border-b py-2 my-2">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>ETB {invoice.charges.subtotal.toLocaleString()}</p>
                </div>
                <div className="flex justify-between">
                  <p>VAT (15%)</p>
                  <p>ETB {invoice.charges.taxes.VAT.toLocaleString()}</p>
                </div>
                <div className="flex justify-between">
                  <p>Withholding Tax (2%)</p>
                  <p>
                    ETB {invoice.charges.taxes.withholding.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>ETB {invoice.charges.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm">
            <p>
              <strong>Payment Terms:</strong> {invoice.paymentTerms}
            </p>
            <p className="mt-2">
              <strong>Notes:</strong> {invoice.notes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
