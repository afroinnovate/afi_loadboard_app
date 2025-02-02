import { useOutletContext, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { Invoice } from "~/api/models/invoice";
import { getSession } from "~/api/services/session";
import { authenticator } from "~/api/services/auth.server";
import {
  getCarrierInvoices,
  updateInvoice,
} from "~/api/services/invoice.service";
import { ClipboardDocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Form } from "@remix-run/react";

interface OutletContext {
  theme: "light" | "dark";
  loads: any[];
  bids: any[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);
  const carrierProfile = session.get("carrier");

  if (!user) {
    return redirect("/logout/");
  }

  try {
    const response = await getCarrierInvoices(user.token, carrierProfile.id);
    return json({
      invoices: Array.isArray(response) ? response : [],
      carrierProfile,
      token: user.token,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return json({ invoices: [], carrierProfile, token: user.token });
  }
};

export default function CarrierInvoices() {
  const { theme, loads } = useOutletContext<OutletContext>();
  const { invoices: initialInvoices, token } = useLoaderData<typeof loader>();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    card: theme === "dark" ? "bg-gray-700" : "bg-white",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
    modal: theme === "dark" ? "bg-gray-800" : "bg-white",
  };

  // Handle empty state
  if (!initialInvoices || initialInvoices.length === 0) {
    return (
      <div className={`w-full ${themeClasses.container} p-4`}>
        <h1 className="text-2xl font-bold mb-6"> Invoices </h1>
        <div className="flex flex-col items-center justify-center py-12">
          <ClipboardDocumentIcon className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2"> No Invoices Yet </h3>
          <p className={`${themeClasses.subtext} text-center max-w-md mb-6`}>
            You haven't created any invoices yet. Invoices will appear here
            after you complete deliveries and generate invoices.
          </p>
        </div>
      </div>
    );
  }

  const InvoiceDetailModal = () => {
    if (!selectedInvoice) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [editedPaymentMethod, setEditedPaymentMethod] = useState(
      selectedInvoice.paymentMethod || {
        paymentType: "",
        bankName: "",
        bankAccount: "",
        accountHolderName: "",
      }
    );

    // Find the load details from the loads array
    const loadDetails = loads.find(
      (load) => load.loadId === selectedInvoice.loadId
    );

    const handlePaymentMethodUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await updateInvoice(token, selectedInvoice.id.toString(), {
          paymentMethod: editedPaymentMethod,
        });
        setIsEditing(false);
        // Refresh the invoice list or update the selected invoice
      } catch (error) {
        console.error("Failed to update payment method:", error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className={`${themeClasses.modal} w-full max-w-3xl rounded-lg shadow-xl p-6 m-4 max-h-[90vh] overflow-y-auto`}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold"> Invoice Details </h2>
            <button
              onClick={() => setSelectedInvoice(null)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Invoice Content */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className={`${themeClasses.card} p-4 rounded-lg`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={themeClasses.subtext}> Invoice Number </p>
                  <p className="font-medium">
                    {" "}
                    {selectedInvoice.invoiceNumber}{" "}
                  </p>
                </div>
                <div>
                  <p className={themeClasses.subtext}> Status </p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm ${
                      selectedInvoice.status === "paid"
                        ? "bg-green-500 text-white"
                        : selectedInvoice.status === "pending"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {selectedInvoice.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className={themeClasses.subtext}> Issue Date </p>
                  <p>
                    {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className={themeClasses.subtext}> Due Date </p>
                  <p>
                    {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Load Information */}
            <div className={`${themeClasses.card} p-4 rounded-lg`}>
              <h3 className="font-semibold mb-4"> Load Details </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={themeClasses.subtext}> Load ID </p>
                  <p> {selectedInvoice.loadId} </p>
                </div>
                {loadDetails && (
                  <>
                    <div>
                      <p className={themeClasses.subtext}> Origin </p>
                      <p> {loadDetails.origin} </p>
                    </div>
                    <div>
                      <p className={themeClasses.subtext}> Destination </p>
                      <p> {loadDetails.destination} </p>
                    </div>
                    <div>
                      <p className={themeClasses.subtext}> Commodity </p>
                      <p> {loadDetails.commodity} </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Amount Details */}
            <div className={`${themeClasses.card} p-4 rounded-lg`}>
              <h3 className="font-semibold mb-4"> Payment Details </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p>Amount Due: </p>
                  <p> ETB {selectedInvoice.amountDue.toLocaleString()} </p>
                </div>
                <div className="flex justify-between">
                  <p>VAT: </p>
                  <p> ETB {selectedInvoice.totalVat.toLocaleString()} </p>
                </div>
                <div className="flex justify-between">
                  <p>Withholding: </p>
                  <p> ETB {selectedInvoice.withholding.toLocaleString()} </p>
                </div>
                <div className="flex justify-between">
                  <p>Service Fees: </p>
                  <p> ETB {selectedInvoice.serviceFees.toLocaleString()} </p>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <p>Total Amount: </p>
                  <p> ETB {selectedInvoice.totalAmount.toLocaleString()} </p>
                </div>
              </div>
            </div>

            {/* Updated Payment Method Section */}
            <div className={`${themeClasses.card} p-4 rounded-lg`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold"> Payment Method </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 py-1 rounded ${
                    isEditing ? "bg-gray-500" : "bg-blue-500"
                  } text-white text-sm`}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>
              </div>

              {isEditing ? (
                <Form
                  onSubmit={handlePaymentMethodUpdate}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div>
                      <label className={`block ${themeClasses.subtext} mb-1`}>
                        Payment Type
                      </label>
                      <select
                        value={editedPaymentMethod.paymentType}
                        onChange={(e) =>
                          setEditedPaymentMethod({
                            ...editedPaymentMethod,
                            paymentType: e.target.value,
                          })
                        }
                        className="w-full p-2 rounded border bg-transparent"
                      >
                        <option value=""> Select Payment Type </option>
                        <option value="bank"> Bank Transfer </option>
                        <option value="mobile_money"> Mobile Money </option>
                      </select>
                    </div>

                    {editedPaymentMethod.paymentType === "bank" ? (
                      <>
                        <div>
                          <label
                            className={`block ${themeClasses.subtext} mb-1`}
                          >
                            Bank Name
                          </label>
                          <select
                            value={editedPaymentMethod.bankName}
                            onChange={(e) =>
                              setEditedPaymentMethod({
                                ...editedPaymentMethod,
                                bankName: e.target.value,
                              })
                            }
                            className="w-full p-2 rounded border bg-transparent"
                          >
                            <option value=""> Select Bank </option>
                            <option value="Commercial Bank of Ethiopia">
                              Commercial Bank of Ethiopia
                            </option>
                            <option value="Dashen Bank"> Dashen Bank </option>
                            <option value="Awash Bank"> Awash Bank </option>
                            <option value="Bank of Abyssinia">
                              Bank of Abyssinia
                            </option>
                          </select>
                        </div>

                        <div>
                          <label
                            className={`block ${themeClasses.subtext} mb-1`}
                          >
                            Account Number
                          </label>
                          <input
                            type="text"
                            value={editedPaymentMethod.bankAccount}
                            onChange={(e) =>
                              setEditedPaymentMethod({
                                ...editedPaymentMethod,
                                bankAccount: e.target.value,
                              })
                            }
                            className="w-full p-2 rounded border bg-transparent"
                          />
                        </div>
                      </>
                    ) : (
                      editedPaymentMethod.paymentType === "mobile_money" && (
                        <>
                          <div>
                            <label
                              className={`block ${themeClasses.subtext} mb-1`}
                            >
                              Mobile Money Provider
                            </label>
                            <select
                              value={editedPaymentMethod.bankName}
                              onChange={(e) =>
                                setEditedPaymentMethod({
                                  ...editedPaymentMethod,
                                  bankName: e.target.value,
                                })
                              }
                              className="w-full p-2 rounded border bg-transparent"
                            >
                              <option value=""> Select Provider </option>
                              <option value="TeleBirr"> TeleBirr </option>
                              <option value="CBEBirr"> CBEBirr </option>
                              <option value="HelloCash"> HelloCash </option>
                              <option value="AmolePay"> AmolePay </option>
                            </select>
                          </div>

                          <div>
                            <label
                              className={`block ${themeClasses.subtext} mb-1`}
                            >
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={editedPaymentMethod.phoneNumber}
                              onChange={(e) =>
                                setEditedPaymentMethod({
                                  ...editedPaymentMethod,
                                  phoneNumber: e.target.value,
                                })
                              }
                              placeholder="+251"
                              className="w-full p-2 rounded border bg-transparent"
                            />
                          </div>

                          <div>
                            <label
                              className={`block ${themeClasses.subtext} mb-1`}
                            >
                              Account Holder Name
                            </label>
                            <input
                              type="text"
                              value={editedPaymentMethod.accountHolderName}
                              onChange={(e) =>
                                setEditedPaymentMethod({
                                  ...editedPaymentMethod,
                                  accountHolderName: e.target.value,
                                })
                              }
                              className="w-full p-2 rounded border bg-transparent"
                            />
                          </div>
                        </>
                      )
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Save Changes
                  </button>
                </Form>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={themeClasses.subtext}> Payment Type </p>
                    <p>
                      {" "}
                      {editedPaymentMethod.paymentType || "Not specified"}{" "}
                    </p>
                  </div>
                  {editedPaymentMethod.paymentType === "bank" ? (
                    <>
                      <div>
                        <p className={themeClasses.subtext}> Bank Name </p>
                        <p>
                          {" "}
                          {editedPaymentMethod.bankName || "Not specified"}{" "}
                        </p>
                      </div>
                      <div>
                        <p className={themeClasses.subtext}> Account Number </p>
                        <p>
                          {editedPaymentMethod.bankAccount || "Not specified"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className={themeClasses.subtext}>
                          Mobile Money Provider
                        </p>
                        <p>
                          {" "}
                          {editedPaymentMethod.bankName || "Not specified"}{" "}
                        </p>
                      </div>
                      <div>
                        <p className={themeClasses.subtext}> Phone Number </p>
                        <p>
                          {editedPaymentMethod.phoneNumber || "Not specified"}
                        </p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className={themeClasses.subtext}> Account Holder </p>
                    <p>
                      {editedPaymentMethod.accountHolderName || "Not specified"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${themeClasses.container} p-4`}>
      <h1 className="text-2xl font-bold mb-6"> Invoices </h1>

      {/* List of Invoices */}
      <div className="grid gap-4">
        {initialInvoices.map((invoice: Invoice) => (
          <button
            key={invoice.id}
            onClick={() => setSelectedInvoice(invoice)}
            className={`w-full text-left ${themeClasses.card} p-4 rounded-lg shadow hover:shadow-lg transition-shadow border ${themeClasses.border}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold"> {invoice.invoiceNumber} </h3>
                <p className={themeClasses.subtext}>
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  ETB {invoice.totalAmount.toLocaleString()}
                </p>
                <span
                  className={`inline-block px-2 py-1 rounded text-sm ${
                    invoice.status === "paid"
                      ? "bg-green-500 text-white"
                      : invoice.status === "pending"
                      ? "bg-yellow-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {invoice.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <p className={themeClasses.subtext}>
                {" "}
                Load ID: {invoice.loadId}{" "}
              </p>
              <p className={themeClasses.subtext}>
                Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal />
    </div>
  );
}
