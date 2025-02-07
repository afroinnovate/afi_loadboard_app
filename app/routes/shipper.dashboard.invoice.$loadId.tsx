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
import {
  getInvoiceByLoadId,
  updateInvoice,
} from "~/api/services/invoice.service";
import { getSession, commitSession } from "~/api/services/session";
import { authenticator } from "~/api/services/auth.server";
import { ShipperInvoiceDetail } from "~/components/invoice/ShipperInvoiceDetail";
import type { Invoice } from "~/api/models/invoice";
import type { OutletContext } from "~/routes/shipper.dashboard";
import { processPayment } from "~/api/services/payment.service";
import { useState, useEffect } from "react";
import Popup from "~/components/popup";

interface LoaderData {
  invoice: Invoice | null;
  currentUser: any;
  error?: string;
  isServiceDown?: boolean;
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
  } catch (error: any) {
    console.error("Error fetching data:", error);
    const errorData = typeof error === "string" ? JSON.parse(error) : error;

    return json({
      invoice: null,
      currentUser: user,
      error: errorData?.data?.message || "Failed to fetch invoice details",
      isServiceDown: errorData?.data?.isServiceDown,
    });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);

    if (!user) {
      return json(
        { success: false, error: "Not authenticated. Please login again." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const buttonType = formData.get("_action");

    switch (buttonType) {
      case "Pay":
        const invoiceData = JSON.parse(formData.get("invoice") as string);

        try {
          // Process payment through payment gateway
          const paymentResult = await processPayment(user.token, invoiceData);

          // If payment successful, update invoice
          if (paymentResult) {
            try {
              const updatedInvoice = await updateInvoice(
                user.token,
                invoiceData.id.toString(),
                {
                  // All IDs for validation
                  id: invoiceData.id,
                  invoiceNumber: invoiceData.invoiceNumber,
                  carrierId: invoiceData.carrierId,
                  loadId: invoiceData.loadId,
                  paymentMethodId: invoiceData.paymentMethodId,

                  // All mutable fields
                  status: "Completed",
                  transactionId: paymentResult.transactionId,
                  transactionDate: paymentResult.paymentDate,
                  transactionStatus: "success",
                  note: `Payment processed successfully via ${invoiceData.paymentMethod.paymentType}`,
                  amountDue: invoiceData.amountDue,
                  totalAmount: invoiceData.totalAmount,
                  totalVat: invoiceData.totalVat,
                  withholding: invoiceData.withholding,
                  serviceFees: invoiceData.serviceFees,
                  carrierName: invoiceData.carrierName,
                  carrierEmail: invoiceData.carrierEmail,
                  carrierPhone: invoiceData.carrierPhone,
                  carrierBusinessName: invoiceData.carrierBusinessName,
                }
              );

              return json({
                success: true,
                message:
                  "Payment processed successfully! Your receipt has been generated.",
                invoice: updatedInvoice,
              });
            } catch (updateError: any) {
              console.error("Invoice update error:", updateError);
              const errorData =
                typeof updateError === "string"
                  ? JSON.parse(updateError)
                  : updateError;

              if (errorData?.status === 400) {
                return json({
                  success: false,
                  error:
                    "Unable to update invoice status. The payment was processed but the invoice update failed. Our team has been notified and will resolve this shortly.",
                  showWarning: true,
                });
              }

              return json({
                success: false,
                error:
                  errorData?.data?.message || "Failed to update invoice status",
                showWarning: true,
              });
            }
          }
        } catch (paymentError: any) {
          // Payment failed
          await updateInvoice(user.token, invoiceData.id.toString(), {
            status: "failed",
            note: `Payment failed: ${paymentError.message || "Unknown error"}`,
            transactionDate: new Date().toISOString(),
          });

          return json(
            {
              success: false,
              error: `Payment processing failed: ${
                paymentError.message || "Unknown error"
              }. Please try again or use a different payment method.`,
            },
            { status: 400 }
          );
        }
        break;

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
    const errorMessage = error.message || "An unexpected error occurred";
    console.error("Invoice action error:", error);
    return json(
      {
        success: false,
        error: `Failed to process request: ${errorMessage}. Please try again or contact support if the issue persists.`,
      },
      { status: 500 }
    );
  }
};

export default function InvoiceLoadView() {
  const { invoice, currentUser, error, isServiceDown } =
    useLoaderData<LoaderData>();
  const location = useLocation();
  const { loads = [], theme } = useOutletContext<OutletContext>();
  const actionData = useActionData();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle successful payment first
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

  // Handle errors
  if (actionData?.error) {
    return (
      <Popup
        title={actionData.showWarning ? "Warning" : "Error"}
        message={actionData.error}
        type={actionData.showWarning ? "warning" : "error"}
        theme={theme}
        actionValue="close"
      />
    );
  }

  // Get load details from outlet context or invoice
  const loadId = Number(location.pathname.split("/").pop());
  const loadDetails =
    loads?.find((load) => load.loadId === loadId) || invoice?.load;

  // Only show error if there's an actual error or no invoice
  if (error || !invoice) {
    const errorMessage =
      error ||
      (!invoice ? "Invoice not found" : "Failed to load invoice details");

    return (
      <Popup
        title={isServiceDown ? "Service Unavailable" : "Warning"}
        message={`${errorMessage}${
          isServiceDown ? ". Our team has been notified." : ""
        }`}
        type={isServiceDown ? "error" : "warning"}
        theme={theme}
        buttonText={isServiceDown ? "Contact Support" : "Close"}
        actionValue={isServiceDown ? "support" : "close"}
      />
    );
  }

  // Proceed with rendering
  return (
    <div className="container mx-auto px-4 py-8">
      <ShipperInvoiceDetail
        invoice={invoice}
        load={loadDetails}
        currentUser={currentUser}
        theme={theme}
        onClose={() => navigate(-1)}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    </div>
  );
}
