import { redirect, type LoaderFunction, json } from "@remix-run/node";
import { useOutletContext, useLoaderData } from "@remix-run/react";
import { getSession, destroySession } from "~/api/services/session";
import { authenticator } from "~/api/services/auth.server";
import type { Invoice } from "~/api/models/invoice";
import { getCarrierInvoices } from "~/api/services/invoice.service";
import { useState, useEffect } from "react";
import { CarrierInvoiceDetail } from "~/components/invoice/CarrierInvoiceDetail";
import { InvoiceDetail } from "~/components/invoice/InvoiceDetail";
import { FEES_AND_TAXES, calculateCarrierDeductions } from "~/utils/constants";

interface OutletContext {
  theme: "light" | "dark";
  loads: any[];
  bids: any[];
}

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
  const { carrierProfile, invoices: initialInvoices } =
    useLoaderData<typeof loader>();
  const [selectedLoad, setSelectedLoad] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices || []);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [showInvoiceView, setShowInvoiceView] = useState(false);

  useEffect(() => {
    console.log("Checking for draft invoice...");
    const draftInvoice = sessionStorage.getItem("draftInvoice");
    if (draftInvoice && carrierProfile) {
      try {
        console.log("Processing draft invoice:", draftInvoice);
        const parsedInvoice = JSON.parse(draftInvoice);
        const loadData = {
          id: parsedInvoice.loadId,
          origin: parsedInvoice.origin,
          destination: parsedInvoice.destination,
          weight: parsedInvoice.weight,
          commodity: parsedInvoice.commodity,
          offerAmount: parsedInvoice.offerAmount,
          estimatedDistance: parsedInvoice.estimatedDistance,
          createdBy: {
            id: parsedInvoice.createdBy.userId,
            firstName: parsedInvoice.createdBy.firstName,
            lastName: parsedInvoice.createdBy.lastName,
            email: parsedInvoice.createdBy.email,
            phone: parsedInvoice.createdBy.phone,
            businessProfile: parsedInvoice.createdBy.businessProfile
          }
        };

        console.log("Setting selected load:", loadData);
        setSelectedLoad(loadData);
        setShowInvoiceDetail(true);
        sessionStorage.removeItem("draftInvoice");
      } catch (error) {
        console.error("Error processing draft invoice:", error);
      }
    }
  }, [carrierProfile]);

  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900",
    header: theme === "dark" ? "text-white" : "text-gray-900",
    card: theme === "dark" ? "bg-gray-800" : "bg-white",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
  };

  const handleGenerateInvoice = () => {
    console.log("Generate invoice clicked, available loads:", loads);
    const uninvoicedLoad = loads?.find(load => 
      !invoices.some(invoice => invoice.loadId === load.loadId)
    );
    
    if (uninvoicedLoad) {
      console.log("Found uninvoiced load:", uninvoicedLoad);
      const formattedLoad = {
        id: uninvoicedLoad.loadId,
        origin: uninvoicedLoad.origin,
        destination: uninvoicedLoad.destination,
        weight: uninvoicedLoad.weight,
        commodity: uninvoicedLoad.commodity,
        offerAmount: uninvoicedLoad.offerAmount,
        estimatedDistance: uninvoicedLoad.estimatedDistance,
        createdBy: {
          id: uninvoicedLoad.createdBy.userId,
          firstName: uninvoicedLoad.createdBy.firstName,
          lastName: uninvoicedLoad.createdBy.lastName,
          email: uninvoicedLoad.createdBy.email,
          phone: uninvoicedLoad.createdBy.phone,
          businessProfile: uninvoicedLoad.createdBy.businessProfile
        }
      };

      console.log("Setting formatted load:", formattedLoad);
      setSelectedLoad(formattedLoad);
      setShowInvoiceDetail(true);
    }
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceView(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoiceDetail(false);
    setShowInvoiceView(false);
    setSelectedLoad(null);
    setSelectedInvoice(null);
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    setInvoices((prev) => [invoice, ...prev]);
    handleCloseInvoice();
  };

  return (
    <div className={`w-full ${themeClasses.container} p-4`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        {loads && loads.length > 0 && (
          <button
            onClick={handleGenerateInvoice}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Generate Invoice
          </button>
        )}
      </div>

      {showInvoiceDetail && selectedLoad && carrierProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CarrierInvoiceDetail
            loadData={selectedLoad}
            userInfo={{
              id: carrierProfile.id,
              firstName: carrierProfile.firstName,
              lastName: carrierProfile.lastName,
              email: carrierProfile.email,
              phone: carrierProfile.phone,
              businessProfile: {
                companyName: carrierProfile.businessProfile?.companyName || "",
                address: carrierProfile.businessProfile?.address || "",
                businessRegistrationNumber: carrierProfile.businessProfile?.businessRegistrationNumber || ""
              }
            }}
            theme={theme}
            onClose={handleCloseInvoice}
            onSave={handleSaveInvoice}
          />
        </div>
      )}

      {showInvoiceView && selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          theme={theme}
          onClose={handleCloseInvoice}
        />
      )}

      {!loads || loads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className={`text-lg ${themeClasses.text} mb-4`}>
            No loads available
          </p>
          <p className={themeClasses.subtext}>
            Complete some loads to generate invoices
          </p>
        </div>
      ) : invoices.length > 0 ? (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.number}
              onClick={() => handleInvoiceClick(invoice)}
              className={`${themeClasses.card} p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow border ${themeClasses.border}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{invoice.number}</h3>
                  <p className={themeClasses.subtext}>
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    ETB {invoice.amount.toLocaleString()}
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
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className={`text-lg ${themeClasses.text} mb-4`}>No invoices yet</p>
          <p className={themeClasses.subtext}>
            Click "Generate Invoice" to create your first invoice
          </p>
        </div>
      )}
    </div>
  );
}
