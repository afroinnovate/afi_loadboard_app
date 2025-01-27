import { json, redirect } from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  useOutletContext,
  useNavigate,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { CarrierInvoiceDetail } from "~/components/invoice/CarrierInvoiceDetail";
import { getSession } from "~/api/services/session";
import { authenticator } from "~/api/services/auth.server";
import { generateInvoice } from "~/api/services/invoice.service";
import {
  savePaymentMethod,
  getPaymentMethods,
} from "~/api/services/payment.service";
import type {
  InvoiceRequest,
  Invoice,
  InvoiceStatus,
} from "~/api/models/invoice";
import type { Load } from "~/api/models/load";
import type { Shipper } from "~/api/models/shipper";
import type { Carrier } from "~/api/models/carrier";

interface OutletContext {
  loads: Load[];
  bids: any[];
  theme: "light" | "dark";
}

export const loader: LoaderFunction = async ({ request, params }) => {
  console.log("Loader triggered");
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);
  const carrierProfile = session.get("carrier");

  if (!user) {
    return redirect("/logout/");
  }

  if (user?.user.userType !== "carrier") {
    return redirect("/shipper/dashboard/");
  }

  let savedPaymentMethod = null;
  try {
    // Get any saved payment method from the user profile if exists
    const paymentMethods = await getPaymentMethods(
      user.token,
      carrierProfile.id
    );
    // Use the first payment method if any exists
    savedPaymentMethod =
      paymentMethods && paymentMethods.length > 0 ? paymentMethods[0] : null;
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    // Don't throw error, just continue without saved payment method
  }

  return json({
    carrierProfile,
    loadId: params.loadId,
    token: user.token,
    savedPaymentMethod,
  });
};

export const action: ActionFunction = async ({ request }) => {
  console.log("Action triggered");
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);

  if (!user) {
    return redirect("/logout/");
  }

  const formData = await request.formData();
  const _action = formData.get("_action");
  console.log("Action type:", _action);

  try {
    switch (_action) {
      case "publish_invoice": {
        // Get invoice data from form
        const invoiceRequest = {
          loadId: Number(formData.get("loadId")),
          issueDate: new Date().toISOString(),
          dueDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "pending",
          shipperId: formData.get("shipperId") as string,
          totalAmount: Number(formData.get("amountDue")), // This is the original load amount
          amountDue: Number(formData.get("totalAmount")), // This is the final amount after deductions
          totalVat: Number(formData.get("totalVat")),
          withholding: Number(formData.get("withholding")),
          serviceFees: Number(formData.get("serviceFees")),
          note: (formData.get("note") as string) || "",
          transactionId: "",
          paymentMethod: JSON.parse(formData.get("paymentMethod") as string),
        };

        console.log("Publishing invoice:", invoiceRequest);
        const invoice = await generateInvoice(user.token, invoiceRequest);
        return json({ success: true, invoice });
      }

      case "save-payment": {
        const paymentMethod = JSON.parse(
          formData.get("paymentMethod") as string
        );
        console.log("Saving payment method:", paymentMethod);
        const savedPayment = await savePaymentMethod(user.token, paymentMethod);
        return json({ success: true, paymentMethod: savedPayment });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Action error:", error);
    return json(
      {
        error:
          error.message || "An error occurred while processing your request",
      },
      { status: 400 }
    );
  }
};

export default function CarrierInvoicePage() {
  const { carrierProfile, loadId, token, savedPaymentMethod } =
    useLoaderData<typeof loader>();
  const { loads, theme } = useOutletContext<OutletContext>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  // Find the load from the preloaded loads
  const load = loads.find((l) => l.loadId.toString() === loadId);
  console.log("load", load);

  if (!load) {
    return <div>Load not found</div>;
  }

  // Prepare invoice info
  const invoiceInfo = {
    load,
    shipper: {
      id: load.createdBy.userId,
      name: load.createdBy.firstName + " " + load.createdBy.lastName,
      companyName: load.createdBy.businessProfile.companyName,
      address: load.createdBy.businessProfile.address,
      taxId: load.createdBy.businessProfile.businessRegistrationNumber,
      email: load.createdBy.email,
    },
    carrier: {
      id: carrierProfile.id,
      name: `${carrierProfile.user.firstName} ${carrierProfile.user.lastName}`,
      companyName: carrierProfile.user.businessProfile.companyName,
      address: carrierProfile.user.businessProfile.address,
      taxId: carrierProfile.user.businessProfile.businessRegistrationNumber,
      email: carrierProfile.user.email,
    },
    invoice: {
      id: "",
      loadId: load.loadId,
      number: `INV-${load.loadId}-${Date.now()}`,
      amount: load.offerAmount,
      status: "pending" as InvoiceStatus,
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      shipperId: load.createdBy.userId,
      totalAmount: 0,
      totalVat: 0,
      withHolding: 0,
      serviceFees: 0,
      notes: "",
      transactionId: "",
      paymentMethod: savedPaymentMethod || {
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

  const handleSuccess = () => {
    setTimeout(() => {
      navigate("/carriers/dashboard/invoices");
    }, 2000);
  };

  return (
    <CarrierInvoiceDetail
      invoiceInfo={invoiceInfo}
      token={token}
      theme={theme}
      actionData={actionData}
      onSuccess={handleSuccess}
    />
  );
}
