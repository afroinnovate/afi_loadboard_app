import { useState, useEffect } from "react";
import { useLocation, useOutletContext } from "@remix-run/react";
import { mockInvoices } from "~/api/mocks/invoiceData";
import { ShipperInvoiceDetail } from "~/components/invoice/ShipperInvoiceDetail";
import ContactShipperView from "~/components/contactshipper";

export default function ShipperInvoices() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const location = useLocation();
  const { theme } = useOutletContext();

  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    card: theme === "dark" ? "bg-gray-700" : "bg-white",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
  };

  useEffect(() => {
    // Check for message in location state
    if (location.state?.message) {
      // Show message to user (you can implement a proper notification system)
      alert(location.state.message);
      // Clear the message
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleInvoiceClick = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowInvoice(true);
  };

  const handleMessageCarrier = (carrierId: string) => {
    setSelectedCarrier(carrierId);
    setShowContact(true);
    setShowInvoice(false);
  };

  return (
    <div className={`p-6 ${themeClasses.container}`}>
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>

      {/* Invoices Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            onClick={() => handleInvoiceClick(invoice)}
            className={`${themeClasses.card} p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow border ${themeClasses.border}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                <p className={themeClasses.subtext}>
                  {new Date(invoice.issuedDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  ETB {invoice.charges.total.toLocaleString()}
                </p>
                <span
                  className={`inline-block px-2 py-1 rounded text-sm ${
                    invoice.status === "paid"
                      ? "bg-green-500 text-white"
                      : invoice.status === "pending"
                      ? "bg-yellow-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {invoice.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <p className={themeClasses.subtext}>
                From: {invoice.carrier.companyName}
              </p>
              <p className={themeClasses.subtext}>
                Load: {invoice.load.origin} → {invoice.load.destination}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Invoice Detail Modal */}
      {showInvoice && selectedInvoice && (
        <ShipperInvoiceDetail
          invoice={selectedInvoice}
          theme={theme}
          onClose={() => setShowInvoice(false)}
          onMessageCarrier={handleMessageCarrier}
        />
      )}

      {/* Contact Carrier Modal */}
      {showContact && selectedCarrier && (
        <ContactShipperView
          shipper={selectedCarrier} // In this case, we're contacting the carrier
          load={selectedInvoice?.load}
          theme={theme}
          onClose={() => setShowContact(false)}
          onChat={() => {
            // Handle chat initiation
            console.log("Starting chat with carrier:", selectedCarrier);
          }}
        />
      )}
    </div>
  );
}
