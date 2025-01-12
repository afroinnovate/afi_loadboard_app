import { useState } from "react";
import type { Invoice, PaymentInfo } from "~/api/mocks/invoiceData";
import { PencilIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface PaymentSectionProps {
  invoice: Invoice;
  theme: "light" | "dark";
  onPaymentInfoUpdate: (updatedInfo: PaymentInfo) => void;
  onPaymentSubmit: () => void;
}

export function PaymentSection({
  invoice,
  theme,
  onPaymentInfoUpdate,
  onPaymentSubmit,
}: PaymentSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [carrierInfoConfirmed, setCarrierInfoConfirmed] = useState(
    invoice.paymentStatus.carrierInfoConfirmed
  );
  const [taxInfoConfirmed, setTaxInfoConfirmed] = useState(
    invoice.paymentStatus.taxInfoConfirmed
  );
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(
    invoice.paymentStatus.disclaimerAccepted
  );
  const [paymentInfo, setPaymentInfo] = useState(invoice.carrier.paymentInfo);

  const themeClasses = {
    container: theme === "dark" ? "bg-gray-800" : "bg-white",
    card: theme === "dark" ? "bg-gray-700" : "bg-gray-50",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    button: {
      primary:
        theme === "dark"
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "bg-blue-500 hover:bg-blue-600 text-white",
      secondary:
        theme === "dark"
          ? "border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
          : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    },
  };

  const handlePaymentInfoEdit = () => {
    setIsEditing(true);
  };

  const handlePaymentInfoSave = () => {
    setIsEditing(false);
    onPaymentInfoUpdate(paymentInfo);
  };

  const isPaymentEnabled =
    carrierInfoConfirmed && taxInfoConfirmed && disclaimerAccepted;

  return (
    <div
      className={`${themeClasses.container} p-6 rounded-lg border ${themeClasses.border} mt-6`}
    >
      <h3 className={`text-xl font-semibold ${themeClasses.text} mb-4`}>
        Payment Details
      </h3>

      {/* Payment Information Display/Edit */}
      <div className={`${themeClasses.card} p-4 rounded-lg mb-4`}>
        <div className="flex justify-between items-start mb-4">
          <h4 className={`font-medium ${themeClasses.text}`}>
            Carrier Payment Information
          </h4>
          {!isEditing ? (
            <button
              onClick={handlePaymentInfoEdit}
              className="flex items-center text-blue-500 hover:text-blue-600"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </button>
          ) : (
            <button
              onClick={handlePaymentInfoSave}
              className="flex items-center text-green-500 hover:text-green-600"
            >
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Save
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <select
              value={paymentInfo.preferredMethod}
              onChange={(e) =>
                setPaymentInfo({
                  ...paymentInfo,
                  preferredMethod: e.target.value as "bank" | "mobile_money",
                })
              }
              className="w-full p-2 rounded border"
            >
              <option value="bank">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
            </select>

            {paymentInfo.preferredMethod === "bank" ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={paymentInfo.bankDetails?.bankName || ""}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      bankDetails: {
                        ...paymentInfo.bankDetails!,
                        bankName: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 rounded border"
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={paymentInfo.bankDetails?.accountNumber || ""}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      bankDetails: {
                        ...paymentInfo.bankDetails!,
                        accountNumber: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 rounded border"
                />
                {/* Add other bank fields */}
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={paymentInfo.mobileMoneyDetails?.provider}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      mobileMoneyDetails: {
                        ...paymentInfo.mobileMoneyDetails!,
                        provider: e.target.value as "MPesa" | "TeleBirr",
                      },
                    })
                  }
                  className="w-full p-2 rounded border"
                >
                  <option value="MPesa">MPesa</option>
                  <option value="TeleBirr">TeleBirr</option>
                </select>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={paymentInfo.mobileMoneyDetails?.phoneNumber || ""}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      mobileMoneyDetails: {
                        ...paymentInfo.mobileMoneyDetails!,
                        phoneNumber: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 rounded border"
                />
                {/* Add other mobile money fields */}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className={themeClasses.text}>
              Method:{" "}
              {paymentInfo.preferredMethod === "bank"
                ? "Bank Transfer"
                : "Mobile Money"}
            </p>
            {paymentInfo.preferredMethod === "bank" ? (
              <>
                <p className={themeClasses.subtext}>
                  Bank: {paymentInfo.bankDetails?.bankName}
                </p>
                <p className={themeClasses.subtext}>
                  Account: {paymentInfo.bankDetails?.accountNumber}
                </p>
              </>
            ) : (
              <>
                <p className={themeClasses.subtext}>
                  Provider: {paymentInfo.mobileMoneyDetails?.provider}
                </p>
                <p className={themeClasses.subtext}>
                  Phone: {paymentInfo.mobileMoneyDetails?.phoneNumber}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Checkboxes */}
      <div className="space-y-4 mb-6">
        <label className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={carrierInfoConfirmed}
            onChange={(e) => setCarrierInfoConfirmed(e.target.checked)}
            className="mt-1"
          />
          <span className={`${themeClasses.text} text-sm`}>
            I confirm that the carrier payment information is correct and
            verified
          </span>
        </label>

        <label className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={taxInfoConfirmed}
            onChange={(e) => setTaxInfoConfirmed(e.target.checked)}
            className="mt-1"
          />
          <span className={`${themeClasses.text} text-sm`}>
            I confirm that ETB {invoice.charges.taxes.VAT.toLocaleString()}{" "}
            (VAT) and ETB {invoice.charges.taxes.withholding.toLocaleString()}{" "}
            (Withholding Tax) will be automatically deducted and paid to the
            government
          </span>
        </label>

        <label className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={disclaimerAccepted}
            onChange={(e) => setDisclaimerAccepted(e.target.checked)}
            className="mt-1"
          />
          <span className={`${themeClasses.text} text-sm`}>
            I understand that this payment is final and cannot be reversed once
            processed
          </span>
        </label>
      </div>

      {/* Payment Button */}
      <button
        onClick={onPaymentSubmit}
        disabled={!isPaymentEnabled}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200
          ${
            isPaymentEnabled
              ? themeClasses.button.primary
              : "bg-gray-400 cursor-not-allowed"
          }`}
      >
        Pay ETB {invoice.charges.total.toLocaleString()}
      </button>
    </div>
  );
}
