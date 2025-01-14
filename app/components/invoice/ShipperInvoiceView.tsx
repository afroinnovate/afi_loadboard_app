import React, { useState } from "react";
import { Invoice } from "../../api/models/invoice";
import { Theme } from "../../styles/theme";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { PaymentSection } from "./PaymentSection";
import { InvoiceDetailsSection } from "./InvoiceDetailsSection";
import { ServiceFeesSection } from "./ServiceFeesSection";

interface ShipperInvoiceViewProps {
  invoice: Invoice;
  theme: Theme;
  onApprove: (invoiceId: string) => void;
  onDispute: (invoiceId: string) => void;
}

export function ShipperInvoiceView({
  invoice,
  theme,
  onApprove,
  onDispute,
}: ShipperInvoiceViewProps) {
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [taxAgreement, setTaxAgreement] = useState(false);
  const [paymentAgreement, setPaymentAgreement] = useState(false);

  const handleApprove = () => {
    if (taxAgreement && paymentAgreement) {
      onApprove(invoice.id);
      setShowPaymentSection(true);
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
      {!invoice.approvalStatus.shipperApproved && (
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
              <Button variant="secondary" onClick={() => onDispute(invoice.id)}>
                Dispute Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Section */}
      {showPaymentSection && invoice.approvalStatus.shipperApproved && (
        <PaymentSection invoice={invoice} theme={theme} />
      )}
    </div>
  );
}
