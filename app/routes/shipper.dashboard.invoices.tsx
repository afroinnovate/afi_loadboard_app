import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { authenticator } from "~/api/services/auth.server";
import { getSession } from "~/api/services/session";
import { useState } from "react";
import {
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);

  // TODO: Add API call to fetch invoices
  const invoices = []; // Placeholder for invoice data

  return json({ invoices });
};

export default function Invoices() {
  const { invoices } = useLoaderData<typeof loader>();
  const { theme } = useOutletContext<{ theme: "light" | "dark" }>();
  const [filterStatus, setFilterStatus] = useState("all");

  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900",
    header: theme === "dark" ? "text-white" : "text-gray-900",
    card: theme === "dark" ? "bg-gray-800" : "bg-white",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    button: {
      primary:
        theme === "dark"
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "bg-blue-500 hover:bg-blue-600 text-white",
      secondary:
        theme === "dark"
          ? "bg-gray-600 hover:bg-gray-700 text-white"
          : "bg-gray-500 hover:bg-gray-600 text-white",
    },
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${themeClasses.container}`}>
      <h1 className={`text-2xl font-bold mb-6 ${themeClasses.header}`}>
        Invoices
      </h1>

      <div className="mb-4 flex justify-between items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`p-2 rounded border ${themeClasses.border}`}
        >
          <option value="all">All Invoices</option>
          <option value="generated">Generated</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className={`${themeClasses.card} border ${themeClasses.border} rounded-lg p-4`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Invoice #{invoice.number}</h3>
                <p className="text-sm">Load: {invoice.loadId}</p>
                <p className="text-sm">Amount: ${invoice.amount}</p>
              </div>
              <button
                className={`${themeClasses.button.primary} px-4 py-2 rounded-lg flex items-center`}
              >
                <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                Download Invoice
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
