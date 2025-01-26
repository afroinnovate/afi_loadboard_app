import { useState } from "react";
import type { Invoice } from "~/api/models/invoice";
import type { PaymentMethod } from "~/api/models/PaymentMethod";
import {
  PrinterIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FEES_AND_TAXES, calculateCarrierDeductions } from "~/utils/constants";

interface CarrierInvoiceDetailProps {
  loadData: {
    id: number;
    origin: string;
    destination: string;
    weight: number;
    commodity: string;
    offerAmount: number;
    estimatedDistance: number;
    createdBy: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      businessProfile: {
        companyName: string;
        address: string;
        taxId: string;
      };
    };
  };
  userInfo: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    businessProfile: {
      companyName: string;
      address: string;
      businessRegistrationNumber: string;
    };
  };
  theme: "light" | "dark";
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
}

export function CarrierInvoiceDetail({
  loadData,
  userInfo,
  theme,
  onClose,
  onSave,
}: CarrierInvoiceDetailProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    method: "bank_transfer",
    type: "bank",
    bankName: "",
    bankAccount: "",
    accountHolderName: "",
    phoneNumber: "",
    cardMethod: "",
    cardType: "",
    lastFourDigits: "",
    billingAddress: "",
  });

  const [taxInfoConfirmed, setTaxInfoConfirmed] = useState(false);
  const [serviceFeesConfirmed, setServiceFeesConfirmed] = useState(false);
  const [carrierInfoConfirmed, setCarrierInfoConfirmed] = useState(false);

  const baseAmount = loadData?.offerAmount || 0;
  const deductions = calculateCarrierDeductions(baseAmount);

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod((prev) => ({
      ...prev,
      method,
      type: method === "bank_transfer" ? "bank" : "mobile",
    }));
  };

  const handleSaveInvoice = () => {
    const invoice: Invoice = {
      loadId: loadData.id,
      number: `INV-${Date.now()}`, // Generate invoice number
      amount: baseAmount,
      status: "pending",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      shipperId: loadData.createdBy.id,
      totalAmount: deductions.finalAmount,
      totalVat: deductions.vat,
      withHolding: deductions.withholding,
      serviceFees: deductions.serviceFee,
      notes: "",
      transactionId: "", // Will be filled when payment is processed
      paymentMethod,
    };

    onSave(invoice);
  };

  const themeClasses = {
    modal:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    label: theme === "dark" ? "text-gray-300" : "text-gray-700",
    input:
      theme === "dark"
        ? "bg-gray-700 border-gray-600 text-white"
        : "bg-white border-gray-300 text-gray-900",
    select:
      theme === "dark"
        ? "bg-gray-700 border-gray-600 text-white"
        : "bg-white border-gray-300 text-gray-900",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.modal} w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Generate Invoice</h2>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <PrinterIcon className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowDownTrayIcon className="w-6 h-6" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6 space-y-6">
          {/* From (Carrier) Section */}
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-3">From (Carrier)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${themeClasses.label}`}
                >
                  Company Name
                </label>
                <input
                  type="text"
                  value={userInfo.businessProfile.companyName}
                  readOnly
                  className={`w-full p-2 rounded border ${themeClasses.input} bg-gray-100`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${themeClasses.label}`}
                >
                  Tax ID
                </label>
                <input
                  type="text"
                  value={userInfo.businessProfile.businessRegistrationNumber}
                  readOnly
                  className={`w-full p-2 rounded border ${themeClasses.input} bg-gray-100`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${themeClasses.label}`}
                >
                  Contact Person
                </label>
                <input
                  type="text"
                  value={`${userInfo.firstName} ${userInfo.lastName}`}
                  readOnly
                  className={`w-full p-2 rounded border ${themeClasses.input} bg-gray-100`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${themeClasses.label}`}
                >
                  Contact Info
                </label>
                <input
                  type="text"
                  value={`${userInfo.phone} | ${userInfo.email}`}
                  readOnly
                  className={`w-full p-2 rounded border ${themeClasses.input} bg-gray-100`}
                />
              </div>
            </div>
          </div>

          {/* Load Details Section */}
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-3">Load Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${themeClasses.label}`}
                >
                  Route
                </label>
                <input
                  type="text"
                  value={`${loadData.origin} → ${loadData.destination}`}
                  readOnly
                  className={`w-full p-2 rounded border ${themeClasses.input} bg-gray-100`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${themeClasses.label}`}
                >
                  Distance
                </label>
                <input
                  type="text"
                  value={`${loadData.estimatedDistance} km`}
                  readOnly
                  className={`w-full p-2 rounded border ${themeClasses.input} bg-gray-100`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${themeClasses.label}`}
                >
                  Commodity
                </label>
                <input
                  type="text"
                  value={loadData.commodity}
                  readOnly
                  className={`w-full p-2 rounded border ${themeClasses.input} bg-gray-100`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${themeClasses.label}`}
                >
                  Weight
                </label>
                <input
                  type="text"
                  value={`${loadData.weight} kg`}
                  readOnly
                  className={`w-full p-2 rounded border ${themeClasses.input} bg-gray-100`}
                />
              </div>
            </div>
          </div>

          {/* To (Shipper) Section */}
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-3">To (Shipper)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${themeClasses.label}`}
                >
                  Company Name
                </label>
                <input
                  type="text"
                  value={loadData.createdBy.businessProfile.companyName}
                  readOnly
                  className={`w-full p-2 rounded border ${themeClasses.input} bg-gray-100`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${themeClasses.label}`}
                >
                  Tax ID
                </label>
                <input
                  type="text"
                  value={loadData.createdBy.businessProfile.taxId}
                  readOnly
                  className={`w-full p-2 rounded border ${themeClasses.input} bg-gray-100`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${themeClasses.label}`}
                >
                  Contact Person
                </label>
                <input
                  type="text"
                  value={`${loadData.createdBy.firstName} ${loadData.createdBy.lastName}`}
                  readOnly
                  className={`w-full p-2 rounded border ${themeClasses.input} bg-gray-100`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${themeClasses.label}`}
                >
                  Contact Info
                </label>
                <input
                  type="text"
                  value={`${loadData.createdBy.phone} | ${loadData.createdBy.email}`}
                  readOnly
                  className={`w-full p-2 rounded border ${themeClasses.input} bg-gray-100`}
                />
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className={`${themeClasses.section} p-4 rounded`}>
            <h3 className="font-semibold mb-4">Payment Method</h3>
            <div className="space-y-4">
              <select
                value={paymentMethod.method}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                className={`w-full p-2 rounded ${themeClasses.input}`}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
              </select>

              {paymentMethod.method === "bank_transfer" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={paymentMethod.bankName}
                    onChange={(e) =>
                      setPaymentMethod((prev) => ({
                        ...prev,
                        bankName: e.target.value,
                      }))
                    }
                    className={`w-full p-2 rounded ${themeClasses.input}`}
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={paymentMethod.bankAccount}
                    onChange={(e) =>
                      setPaymentMethod((prev) => ({
                        ...prev,
                        bankAccount: e.target.value,
                      }))
                    }
                    className={`w-full p-2 rounded ${themeClasses.input}`}
                  />
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={paymentMethod.accountHolderName}
                    onChange={(e) =>
                      setPaymentMethod((prev) => ({
                        ...prev,
                        accountHolderName: e.target.value,
                      }))
                    }
                    className={`w-full p-2 rounded ${themeClasses.input}`}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={paymentMethod.phoneNumber}
                    onChange={(e) =>
                      setPaymentMethod((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className={`w-full p-2 rounded ${themeClasses.input}`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Charges Section */}
          <div className={`${themeClasses.section} p-4 rounded`}>
            <h3 className="font-semibold mb-4">Payment Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <p>Base Amount</p>
                <p>ETB {baseAmount.toLocaleString()}</p>
              </div>

              {/* Deductions */}
              <div className="border-t border-b py-2 my-2">
                <h4 className="font-medium text-red-500 mb-2">Deductions:</h4>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between text-red-500">
                    <p>
                      Service Fee ({FEES_AND_TAXES.SERVICE_FEE_RATE * 100}%)
                    </p>
                    <p>- ETB {deductions.serviceFee.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <p>VAT ({FEES_AND_TAXES.VAT_RATE * 100}%)</p>
                    <p>- ETB {deductions.vat.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <p>
                      Withholding ({FEES_AND_TAXES.WITHHOLDING_TAX_RATE * 100}%)
                    </p>
                    <p>- ETB {deductions.withholding.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Final Amount */}
              <div className="flex justify-between font-bold text-lg pt-2">
                <p>Final Amount</p>
                <p>ETB {deductions.finalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Confirmations */}
          <div className="space-y-4">
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={carrierInfoConfirmed}
                onChange={(e) => setCarrierInfoConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I confirm that my payment information is correct
              </span>
            </label>

            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={taxInfoConfirmed}
                onChange={(e) => setTaxInfoConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I understand and agree to the tax deductions
              </span>
            </label>

            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={serviceFeesConfirmed}
                onChange={(e) => setServiceFeesConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I agree to the platform service fee
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveInvoice}
              disabled={
                !carrierInfoConfirmed ||
                !taxInfoConfirmed ||
                !serviceFeesConfirmed
              }
              className={`px-4 py-2 rounded ${
                carrierInfoConfirmed && taxInfoConfirmed && serviceFeesConfirmed
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
