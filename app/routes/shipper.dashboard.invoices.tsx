import { useState, useEffect } from "react";
import { InvoiceCard } from "~/components/invoice/InvoiceCard";
import { InvoiceDetail } from "~/components/invoice/InvoiceDetail";
import { useOutletContext, useLoaderData } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { authenticator } from "~/api/services/auth.server";
import { getUserInfo } from "~/api/services/user.service";
import {
  getShipperInvoices,
  updateInvoice,
  deleteInvoice,
} from "~/api/services/invoice.service";
import type { Invoice } from "~/api/models/invoice";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // Get detailed user info
  const userInfo = await getUserInfo(user.user.id, user.token);

  // Get shipper's invoices
  const invoices = await getShipperInvoices(user.token, userInfo.id);

  return { userInfo, user, invoices };
};

export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();
  const action = formData.get("action");
  const invoiceId = formData.get("invoiceId") as string;

  try {
    switch (action) {
      case "approve":
        await updateInvoice(user.token, invoiceId, {
          status: "approved",
        });
        break;
      case "dispute":
        await updateInvoice(user.token, invoiceId, {
          status: "disputed",
        });
        break;
      case "delete":
        await deleteInvoice(user.token, invoiceId);
        break;
      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }

    // Fetch updated invoices after action
    const updatedInvoices = await getShipperInvoices(user.token, user.user.id);
    return json({ success: true, invoices: updatedInvoices });
  } catch (error) {
    return json({ error: "Operation failed" }, { status: 500 });
  }
};

export default function Invoices() {
  const { theme, loads } = useOutletContext<{
    theme: "light" | "dark";
    loads: any[];
  }>();
  const {
    userInfo,
    user,
    invoices: initialInvoices,
  } = useLoaderData<typeof loader>();
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices || []);

  const handleInvoiceAction = async (action: string, invoiceId: string) => {
    const formData = new FormData();
    formData.append("action", action);
    formData.append("invoiceId", invoiceId);

    try {
      const response = await fetch("/shipper/dashboard/invoices", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setInvoices(result.invoices);
        setSelectedInvoice(null);
      } else {
        // Handle error (show notification, etc.)
        console.error("Operation failed:", result.error);
      }
    } catch (error) {
      console.error("Failed to perform action:", error);
    }
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
      ? invoices
      : invoices.filter((invoice) => invoice.status === filterStatus);

  return (
    <div className={`container mx-auto px-4 py-8 ${themeClasses.container}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${themeClasses.header}`}>
          Invoices
        </h1>
        {invoices.length > 0 && (
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`p-2 rounded border ${themeClasses.select}`}
          >
            <option value="all">All Invoices</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="disputed">Disputed</option>
            <option value="paid">Paid</option>
          </select>
        )}
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className={`text-lg ${themeClasses.header} mb-4`}>
            No invoices found
          </p>
          <p className={`${themeClasses.select} text-sm`}>
            When you have invoices, they will appear here.
          </p>
        </div>
      ) : (
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
      )}

      {filteredInvoices.length === 0 && filterStatus !== "all" && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className={`text-lg ${themeClasses.header} mb-4`}>
            No {filterStatus} invoices found
          </p>
          <button
            onClick={() => setFilterStatus("all")}
            className="text-orange-500 hover:text-orange-600"
          >
            View all invoices
          </button>
        </div>
      )}

      {selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          theme={theme}
          onClose={() => setSelectedInvoice(null)}
          onApprove={() => handleInvoiceAction("approve", selectedInvoice.id)}
          onDispute={() => handleInvoiceAction("dispute", selectedInvoice.id)}
          onDelete={() => handleInvoiceAction("delete", selectedInvoice.id)}
        />
      )}
    </div>
  );
}
