import React, { useState } from "react";
import { Invoice } from "../../api/models/invoice";
import { Theme } from "../../styles/theme";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { PaymentSection } from "./PaymentSection";
import { InvoiceDetailsSection } from "./InvoiceDetailsSection";
import { ServiceFeesSection } from "./ServiceFeesSection";
import { updateInvoice, deleteInvoice } from "../../api/services/invoice.service";

interface ShipperInvoiceViewProps {
  invoice: Invoice;
  theme: Theme;
  token: string;
  onApprove: (invoiceId: string) => void;
  onDispute: (invoiceId: string) => void;
}

export function ShipperInvoiceView({
  invoice,
  theme,
  token,
  onApprove,
  onDispute,
}: ShipperInvoiceViewProps) {
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [taxAgreement, setTaxAgreement] = useState(false);
  const [paymentAgreement, setPaymentAgreement] = useState(false);

  const handleApprove = async () => {
    if (taxAgreement && paymentAgreement) {
      try {
        await updateInvoice(token, invoice.id, {
          status: "approved",
        });
        onApprove(invoice.id);
        setShowPaymentSection(true);
      } catch (error) {
        console.error("Failed to approve invoice:", error);
        // Handle error (show notification, etc.)
      }
    }
  };

  const handleDispute = async () => {
    if (window.confirm("Are you sure you want to dispute this invoice?")) {
      try {
        await updateInvoice(token, invoice.id, {
          status: "disputed",
        });
        onDispute(invoice.id);
      } catch (error) {
        console.error("Failed to dispute invoice:", error);
        // Handle error
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(token, invoice.id);
        // Redirect or handle successful deletion
      } catch (error) {
        console.error("Failed to delete invoice:", error);
        // Handle error
      }
    }
  };

  return (
    <div className={`${themeClasses.container} p-4`}>
      {/* Invoice Details Section */}
      <InvoiceDetailsSection invoice={invoice} theme={theme} readOnly={true} />

      {/* Service Fees Breakdown */}
      <ServiceFeesSection
        fees={invoice.serviceFees}
        finalAmounts={invoice.finalAmounts}
        theme={theme}
      />

      {/* Approval Section */}
      {!invoice.status === "pending" && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Invoice Approval</h3>
          <div className="space-y-2">
            <Checkbox
              label="I agree to the tax calculations and deductions"
              checked={taxAgreement}
              onChange={(e) => setTaxAgreement(e.target.checked)}
            />
            <Checkbox
              label="I agree to the payment terms and service fees"
              checked={paymentAgreement}
              onChange={(e) => setPaymentAgreement(e.target.checked)}
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleApprove}
                disabled={!taxAgreement || !paymentAgreement}
              >
                Approve Invoice
              </Button>
              <Button variant="secondary" onClick={handleDispute}>
                Dispute Invoice
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Section */}
      {showPaymentSection && invoice.status === "approved" && (
        <PaymentSection invoice={invoice} theme={theme} token={token} />
      )}
    </div>
  );
}
