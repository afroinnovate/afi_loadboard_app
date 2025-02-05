import {
  json,
  LoaderFunction,
  redirect,
  ActionFunction,
} from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useLocation,
  useOutletContext,
  useSubmit,
  useActionData,
} from "@remix-run/react";
import { getInvoiceByLoadId } from "~/api/services/invoice.service";
import { getSession, commitSession } from '~/api/services/session';
import { authenticator } from "~/api/services/auth.server";
import { ShipperInvoiceDetail } from "~/components/invoice/ShipperInvoiceDetail";
import { Alert } from "~/components/Alert";
import type { Invoice } from "~/api/models/invoice";
import type { Load } from "~/api/models/load";
import type { OutletContext } from "~/routes/shipper.dashboard";
import { processPayment } from "~/api/services/payment.service";
import { useState, useEffect } from "react";
import { Receipt } from "~/components/invoice/Receipt";
import Popup from "~/components/popup";

interface LoaderData {
  invoice: Invoice | null;
  currentUser: any;
  error?: string;
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
      currentUser: user,
      error: "Load ID is required",
    });
  }

  try {
    const invoice = await getInvoiceByLoadId(user.token, Number(params.loadId));
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Get shipper info from session
    const shipperInfo = {
      firstName: user.user.firstName,
      middleName: user.user.middleName,
      lastName: user.user.lastName,
      email: user.user.email,
      phone: user.user.phoneNumber,
    };

    return json({
      invoice,
      currentUser: shipperInfo,
    });
  } catch (error) {
    console.error("Error fetching invoice data:", error);
    return json({
      invoice: null,
      currentUser: user,
      error: "Failed to fetch invoice details",
    });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);

    if (!user) {
      return json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const buttonType = formData.get("_action");

    switch (buttonType) {
      case "Pay":
        const invoiceData = JSON.parse(formData.get("invoice") as string);
        const updatedInvoice = await processPayment(user.token, invoiceData);
        return json({
          success: true,
          message:
            "Payment processed successfully! Your receipt has been generated.",
          invoice: updatedInvoice,
        });

      case "showReceipt":
        return redirect(`/shipper/dashboard/receipt/${params.loadId}`, {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        });

      case "close":
        return redirect("/shipper/dashboard/loads/view");

      default:
        return json(
          {
            success: false,
            error: "Invalid action type",
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return json(
      {
        success: false,
        error: error.message || "Payment failed. Please try again.",
      },
      { status: 500 }
    );
  }
};

export default function InvoiceLoadView() {
  const { invoice, currentUser, error } = useLoaderData<LoaderData>();
  const location = useLocation();
  const navigate = useNavigate();
  const loadDetails = location.state?.loadDetails;
  const { theme } = useOutletContext<OutletContext>();
  const actionData = useActionData();

  if (actionData?.success) {
    return (
      <Popup
        title="Success"
        message={actionData.message}
        type="success"
        theme={theme}
        buttonText="Show Receipt"
        actionValue="showReceipt"
      />
    );
  }

  if (error || !invoice || !loadDetails) {
    return (
      <Popup
        title="Warning"
        message={error || "Failed to load invoice details. Please try again."}
        type="warning"
        theme={theme}
        buttonText="Close"
        actionValue="close"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {actionData?.error && (
        <Popup
          title="Error"
          message={actionData.error}
          type="error"
          theme={theme}
          actionValue="close"
        />
      )}
      <ShipperInvoiceDetail
        invoice={invoice}
        load={loadDetails}
        currentUser={currentUser}
        theme={theme}
      />
    </div>
  );
}
