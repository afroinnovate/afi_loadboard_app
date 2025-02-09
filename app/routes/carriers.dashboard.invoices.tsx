import { useOutletContext, useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { Invoice } from "~/api/models/invoice";
import { getSession } from "~/api/services/session";
import { authenticator } from "~/api/services/auth.server";
import {
  getCarrierInvoices,
  updateInvoice,
} from "~/api/services/invoice.service";
import { ClipboardDocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Form } from "@remix-run/react";

interface OutletContext {
  theme: "light" | "dark";
  loads: any[];
  bids: any[];
  invoices: any[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);
  const carrierProfile = session.get("carrier");

  if (!user) {
    return redirect("/logout/");
  }

  try {
    // const response = await getCarrierInvoices(user.token, carrierProfile.id);
    return json({
      // invoices: Array.isArray(response) ? response : [],
      carrierProfile,
      token: user.token,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return json({ carrierProfile, token: user.token });
  }
};

export default function CarrierInvoices() {
  const { theme, loads, invoices } = useOutletContext<OutletContext>();
  const { token } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const initialInvoices = invoices || [];
  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    card: theme === "dark" ? "bg-gray-700" : "bg-white",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
    modal: theme === "dark" ? "bg-gray-800" : "bg-white",
  };

  // Handle empty state
  if (!initialInvoices || initialInvoices.length === 0) {
    return (
      <div className={`w-full ${themeClasses.container} p-4`}>
        <h1 className="text-2xl font-bold mb-6"> Invoices </h1>
        <div className="flex flex-col items-center justify-center py-12">
          <ClipboardDocumentIcon className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2"> No Invoices Yet </h3>
          <p className={`${themeClasses.subtext} text-center max-w-md mb-6`}>
            You haven't created any invoices yet. Invoices will appear here
            after you complete deliveries and generate invoices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${themeClasses.container} p-4`}>
      <h1 className="text-2xl font-bold mb-6"> Invoices </h1>

      {/* List of Invoices */}
      <div className="grid gap-4">
        {initialInvoices.map((invoice: Invoice) => (
          <button
            key={invoice.id}
            onClick={() =>
              navigate(`/carriers/dashboard/invoice/view/${invoice.id}`)
            }
            className={`w-full text-left ${themeClasses.card} p-4 rounded-lg shadow hover:shadow-lg transition-shadow border ${themeClasses.border}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold"> {invoice.invoiceNumber} </h3>
                <p className={themeClasses.subtext}>
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  ETB {invoice.totalAmount.toLocaleString()}
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
                {" "}
                Load ID: {invoice.loadId}{" "}
              </p>
              <p className={themeClasses.subtext}>
                Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
