import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useLocation } from "@remix-run/react";
import { getInvoiceByLoadId } from "~/api/services/invoice.service";
import { getSession } from "~/api/services/session";
import { authenticator } from "~/api/services/auth.server";
import { ShipperInvoiceDetail } from "~/components/invoice/ShipperInvoiceDetail";
import { Alert } from "~/components/Alert";
import { useState } from "react";
import type { Invoice } from "~/api/models/invoice";

interface LoaderData {
  invoice: Invoice | null;
  error?: string;
  user: any;
  loadDetails?: any;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);

  if (!user) {
    return redirect("/login");
  }

  if (!params.loadId) {
    return json({
      invoice: null,
      error: "Load ID is required",
      user,
    });
  }

  try {
    const invoice = await getInvoiceByLoadId(user.token, Number(params.loadId));
    console.log("Invoice:", invoice);
    return json({ invoice, user });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return json({
      invoice: null,
      error: "Invoice not found",
      user,
    });
  }
};

export default function InvoiceLoadView() {
  const { invoice, error, user } = useLoaderData<LoaderData>();
  const location = useLocation();
  const navigate = useNavigate();
  const loadDetails = location.state?.loadDetails;

  if (error || !invoice) {
    return (
      <Alert
        message={
          error ||
          "No invoice found for this load. Please wait for the carrier to generate one."
        }
        type="warning"
        theme="light"
        onClose={() => navigate("/shipper/dashboard/loads/view")}
        autoClose={false}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ShipperInvoiceDetail
        invoice={invoice}
        loadDetails={loadDetails}
        theme="light"
        onClose={() => navigate("/shipper/dashboard/loads/view")}
      />
    </div>
  );
}
