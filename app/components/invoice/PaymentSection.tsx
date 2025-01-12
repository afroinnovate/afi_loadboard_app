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
        "bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 text-white disabled:bg-gray-700 disabled:cursor-not-allowed",
      edit: "text-orange-400 hover:text-orange-300 font-bold",
      save: "text-orange-400 hover:text-orange-300 font-bold",
    },
    checkbox:
      theme === "dark"
        ? "h-4 w-4 border-gray-300 rounded text-orange-500 focus:ring-orange-500"
        : "h-4 w-4 border-gray-300 rounded text-orange-500 focus:ring-orange-500",
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
              className={`flex items-center ${themeClasses.button.edit}`}
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </button>
          ) : (
            <button
              onClick={handlePaymentInfoSave}
              className={`flex items-center ${themeClasses.button.save}`}
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
              className={`w-full p-2 rounded border ${themeClasses.border} ${themeClasses.text} bg-transparent`}
            >
              <option value="bank">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
            </select>

            {paymentInfo.preferredMethod === "bank" ? (
              <div className="space-y-2">
                <select
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
                  className={`w-full p-2 rounded border ${themeClasses.border} ${themeClasses.text} bg-transparent`}
                >
                  <option value="">Select Bank</option>
                  <option value="Commercial Bank of Ethiopia">
                    Commercial Bank of Ethiopia
                  </option>
                  <option value="Dashen Bank">Dashen Bank</option>
                  <option value="Awash Bank">Awash Bank</option>
                  <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                  {/* Add other Ethiopian banks as needed */}
                </select>
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
                  className={`w-full p-2 rounded border ${themeClasses.border} ${themeClasses.text} bg-transparent`}
                />
                <input
                  type="text"
                  placeholder="Account Holder Name"
                  value={paymentInfo.bankDetails?.accountHolderName || ""}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      bankDetails: {
                        ...paymentInfo.bankDetails!,
                        accountHolderName: e.target.value,
                      },
                    })
                  }
                  className={`w-full p-2 rounded border ${themeClasses.border} ${themeClasses.text} bg-transparent`}
                />
                <input
                  type="text"
                  placeholder="Routing Number (Optional)"
                  value={paymentInfo.bankDetails?.routingNumber || ""}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      bankDetails: {
                        ...paymentInfo.bankDetails!,
                        routingNumber: e.target.value,
                      },
                    })
                  }
                  className={`w-full p-2 rounded border ${themeClasses.border} ${themeClasses.text} bg-transparent`}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={paymentInfo.mobileMoneyDetails?.provider || ""}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      mobileMoneyDetails: {
                        ...paymentInfo.mobileMoneyDetails!,
                        provider: e.target.value as
                          | "TeleBirr"
                          | "CBEBirr"
                          | "HelloCash"
                          | "AmolePay",
                      },
                    })
                  }
                  className={`w-full p-2 rounded border ${themeClasses.border} ${themeClasses.text} bg-transparent`}
                >
                  <option value="">Select Provider</option>
                  <option value="TeleBirr">TeleBirr</option>
                  <option value="CBEBirr">CBEBirr</option>
                  <option value="HelloCash">HelloCash</option>
                  <option value="AmolePay">AmolePay</option>
                </select>
                <input
                  type="tel"
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
                  className={`w-full p-2 rounded border ${themeClasses.border} ${themeClasses.text} bg-transparent`}
                />
                <input
                  type="text"
                  placeholder="Account Name"
                  value={paymentInfo.mobileMoneyDetails?.accountName || ""}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      mobileMoneyDetails: {
                        ...paymentInfo.mobileMoneyDetails!,
                        accountName: e.target.value,
                      },
                    })
                  }
                  className={`w-full p-2 rounded border ${themeClasses.border} ${themeClasses.text} bg-transparent`}
                />
                <input
                  type="text"
                  placeholder="Account Number (if applicable)"
                  value={paymentInfo.mobileMoneyDetails?.accountNumber || ""}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      mobileMoneyDetails: {
                        ...paymentInfo.mobileMoneyDetails!,
                        accountNumber: e.target.value,
                      },
                    })
                  }
                  className={`w-full p-2 rounded border ${themeClasses.border} ${themeClasses.text} bg-transparent`}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className={themeClasses.text}>
              Payment Method:{" "}
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
                <p className={themeClasses.subtext}>
                  Account Holder: {paymentInfo.bankDetails?.accountHolderName}
                </p>
                {paymentInfo.bankDetails?.routingNumber && (
                  <p className={themeClasses.subtext}>
                    Routing Number: {paymentInfo.bankDetails.routingNumber}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className={themeClasses.subtext}>
                  Provider: {paymentInfo.mobileMoneyDetails?.provider}
                </p>
                <p className={themeClasses.subtext}>
                  Phone: {paymentInfo.mobileMoneyDetails?.phoneNumber}
                </p>
                <p className={themeClasses.subtext}>
                  Account Name: {paymentInfo.mobileMoneyDetails?.accountName}
                </p>
                {paymentInfo.mobileMoneyDetails?.accountNumber && (
                  <p className={themeClasses.subtext}>
                    Account Number:{" "}
                    {paymentInfo.mobileMoneyDetails.accountNumber}
                  </p>
                )}
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
            className={themeClasses.checkbox}
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
            className={themeClasses.checkbox}
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
            className={themeClasses.checkbox}
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
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors duration-300 flex items-center justify-center
          ${isPaymentEnabled ? themeClasses.button.primary : ""}`}
      >
        Pay ETB {invoice.charges.total.toLocaleString()}
      </button>
    </div>
  );
}
