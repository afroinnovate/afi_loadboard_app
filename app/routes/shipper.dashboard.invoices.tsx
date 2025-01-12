import { useState, useEffect } from "react";
import { InvoiceCard } from "~/components/invoice/InvoiceCard";
import { InvoiceDetail } from "~/components/invoice/InvoiceDetail";
import { mockInvoices, type Invoice } from "~/api/mocks/invoiceData";
import { useOutletContext, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/api/services/auth.server";
import { getUserInfo } from "~/api/services/user.service";

// Constants for tax calculations
const TAX_RATES = {
  VAT: 0.15, // 15% VAT
  WITHHOLDING: 0.02, // 2% Withholding tax
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // Get detailed user info
  const userInfo = await getUserInfo(user.user.id, user.token);

  return { userInfo, user };
};

export default function Invoices() {
  const { theme, loads } = useOutletContext<{
    theme: "light" | "dark";
    loads: any[];
  }>();
  const { userInfo, user } = useLoaderData<typeof loader>();
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    // Initialize with mock data
    setLocalInvoices(mockInvoices);

    // Check for draft invoice in sessionStorage
    const draftInvoice = sessionStorage.getItem("draftInvoice");
    if (draftInvoice) {
      try {
        const parsedInvoice = JSON.parse(draftInvoice);
        const loadData = loads?.find(
          (load) => load.loadId.toString() === parsedInvoice.loadId
        );

        // Enhance invoice with user and load data
        const enhancedInvoice: Invoice = {
          ...parsedInvoice,
          shipper: {
            name: `${userInfo.firstName} ${userInfo.lastName}`,
            companyName: userInfo.businessProfile.companyName,
            address: userInfo.businessProfile.address || "Address pending",
            taxId:
              userInfo.businessProfile.businessRegistrationNumber ||
              "Tax ID pending",
            email: userInfo.email,
          },
          carrier: {
            name: loadData?.carrier?.name || "Pending Assignment",
            companyName: loadData?.carrier?.companyName || "Pending Assignment",
            address: loadData?.carrier?.address || "Address pending",
            taxId: loadData?.carrier?.taxId || "Tax ID pending",
            email: loadData?.carrier?.email || "Email pending",
          },
          load: {
            origin: loadData?.origin || parsedInvoice.load.origin,
            destination:
              loadData?.destination || parsedInvoice.load.destination,
            deliveryDate:
              loadData?.deliveryDate || parsedInvoice.load.deliveryDate,
            commodity: loadData?.commodity || parsedInvoice.load.commodity,
            weight: loadData?.weight || parsedInvoice.load.weight,
          },
          charges: {
            baseRate: Number(
              loadData?.offerAmount || parsedInvoice.charges.baseRate
            ),
            additionalServices: parsedInvoice.charges.additionalServices || [],
            subtotal: Number(
              loadData?.offerAmount || parsedInvoice.charges.baseRate
            ),
            taxes: {
              VAT:
                Number(
                  loadData?.offerAmount || parsedInvoice.charges.baseRate
                ) * TAX_RATES.VAT,
              withholding:
                Number(
                  loadData?.offerAmount || parsedInvoice.charges.baseRate
                ) * TAX_RATES.WITHHOLDING,
            },
            total: calculateTotal(
              Number(loadData?.offerAmount || parsedInvoice.charges.baseRate)
            ),
          },
        };

        // Update local invoices with the enhanced invoice
        setLocalInvoices((prevInvoices) => {
          const filteredInvoices = prevInvoices.filter(
            (inv) => inv.id !== enhancedInvoice.id
          );
          return [enhancedInvoice, ...filteredInvoices];
        });

        // Automatically select the new invoice for display
        setSelectedInvoice(enhancedInvoice);

        // Clear the draft from sessionStorage
        sessionStorage.removeItem("draftInvoice");
      } catch (error) {
        console.error("Error processing draft invoice:", error);
      }
    }
  }, [loads, userInfo]); // Dependencies updated to include loads and userInfo

  // Helper function to calculate total with taxes
  const calculateTotal = (baseAmount: number) => {
    const subtotal = baseAmount;
    const vat = subtotal * TAX_RATES.VAT;
    const withholding = subtotal * TAX_RATES.WITHHOLDING;
    return subtotal + vat + withholding;
  };

  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900",
    header: theme === "dark" ? "text-white" : "text-gray-900",
    select:
      theme === "dark"
        ? "bg-gray-800 text-white border-gray-700"
        : "bg-white text-gray-900 border-gray-200",
  };

  const filteredInvoices =
    filterStatus === "all"
      ? localInvoices
      : localInvoices.filter((invoice) => invoice.status === filterStatus);

  return (
    <div className={`container mx-auto px-4 py-8 ${themeClasses.container}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${themeClasses.header}`}>
          Invoices
        </h1>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`p-2 rounded border ${themeClasses.select}`}
        >
          <option value="all">All Invoices</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredInvoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            theme={theme}
            onClick={() => setSelectedInvoice(invoice)}
          />
        ))}
      </div>

      {selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          theme={theme}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
