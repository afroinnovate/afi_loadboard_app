import { useEffect, useState } from "react";
import { useOutletContext, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { Invoice } from "~/api/models/invoice";
import { mockInvoices } from "~/api/mocks/invoiceData";
import { destroySession, getSession } from "~/api/services/session";
import { CarrierInvoiceDetail } from "~/components/invoice/CarrierInvoiceDetail";
import { authenticator } from "~/api/services/auth.server";
import { getCarrierInvoices } from "~/api/services/invoice.service";
import type { Load } from "~/api/models/load";
import type { Shipper } from "~/api/models/shipper";
import type { Carrier } from "~/api/models/carrier";

interface OutletContext {
  theme: "light" | "dark";
  loads: any[];
  bids: any[];
}

interface InvoiceInfo {
  load: Load;
  shipper: Shipper;
  carrier: Carrier;
  invoice: Invoice;
}

const calculateTotal = (baseAmount: number) => {
  const VAT_RATE = 0.15;
  const WITHHOLDING_RATE = 0.02;
  const vat = baseAmount * VAT_RATE;
  const withholding = baseAmount * WITHHOLDING_RATE;
  return baseAmount + vat + withholding;
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);
    const carrierProfile = session.get("carrier");

    if (!user) {
      return redirect("/logout/");
    }

    if (user?.user.userType === "shipper") {
      return redirect("/shipper/dashboard/");
    }

    const invoices = await getCarrierInvoices(user.token, carrierProfile.id);

    return json({
      carrierProfile,
      invoices: invoices || [],
    });
  } catch (error: any) {
    if (JSON.parse(error).data.status === 401) {
      const session = await getSession(request.headers.get("Cookie"));
      return redirect("/login/", {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      });
    }
    throw error;
  }
};

export default function CarrierInvoices() {
  const { theme, loads } = useOutletContext<OutletContext>();
  const { carrierProfile } = useLoaderData<typeof loader>();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>([]);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo | null>(null);

  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    header: theme === "dark" ? "bg-gray-700" : "bg-gray-100",
    card: theme === "dark" ? "bg-gray-700" : "bg-white",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
  };

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

        if (loadData) {
          const invoiceInfo: InvoiceInfo = {
            load: loadData,
            shipper: {
              id: loadData.shipperId,
              name: parsedInvoice.shipper.name,
              companyName: parsedInvoice.shipper.companyName,
              address: parsedInvoice.shipper.address,
              taxId: parsedInvoice.shipper.taxId,
              email: parsedInvoice.shipper.email,
            },
            carrier: {
              id: carrierProfile.id,
              name: `${carrierProfile.user.firstName} ${carrierProfile.user.lastName}`,
              companyName: carrierProfile.user.businessProfile.companyName,
              phoneNumber:
                carrierProfile.user.phoneNumber || "Phone number pending",
              taxId:
                carrierProfile.user.businessProfile
                  .businessRegistrationNumber || "Tax ID pending",
              email: carrierProfile.user.email,
            },
            invoice: {
              id: parsedInvoice.id,
              loadId: loadData.loadId,
              number:
                parsedInvoice.invoiceNumber ||
                `INV-${loadData.loadId}-${Date.now()}`,
              amount: loadData.agreedRate || loadData.rate,
              status: "pending",
              issueDate: new Date().toISOString(),
              dueDate: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              shipperId: loadData.shipperId,
              totalAmount: 0, // Will be calculated in CarrierInvoiceDetail
              totalVat: 0,
              withHolding: 0,
              serviceFees: 0,
              notes: "",
              transactionId: "",
              paymentMethod: {
                method: "bank",
                type: "",
                bankName: "",
                bankAccount: "",
                accountHolderName: "",
                phoneNumber: "",
                cardMethod: "",
                cardType: "",
                lastFourDigits: "",
                billingAddress: "",
              },
            },
          };

          setInvoiceInfo(invoiceInfo);
          setShowInvoiceDetail(true);

          // Clear the draft from sessionStorage
          sessionStorage.removeItem("draftInvoice");
        }
      } catch (error) {
        console.error("Error processing draft invoice:", error);
      }
    }
  }, [carrierProfile, loads]);

  const handleCloseInvoice = () => {
    setShowInvoiceDetail(false);
    setSelectedInvoice(null);
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  };

  return (
    <div className={`w-full ${themeClasses.container} p-4`}>
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>

      {/* Show Invoice Detail Modal */}
      {showInvoiceDetail && invoiceInfo && (
        <CarrierInvoiceDetail
          invoiceInfo={invoiceInfo}
          theme={theme}
          onClose={handleCloseInvoice}
        />
      )}

      {/* List of Invoices */}
      <div className="grid gap-4">
        {localInvoices.map((invoice) => (
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
                To: {invoice.shipper.companyName}
              </p>
              <p className={themeClasses.subtext}>
                Load: {invoice.load.origin} → {invoice.load.destination}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
