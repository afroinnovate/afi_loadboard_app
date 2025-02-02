import type { Invoice, InvoiceRequest } from "../models/invoice";
import { calculateCarrierDeductions } from "~/utils/constants";

// const baseUrl = "https://api.frieght.afroinnovate.com/api/";
const baseUrl = "http://localhost:7070/api/";

const defaultPaymentMethod = {
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
};

export async function generateInvoice(token: string, invoice: InvoiceRequest) {
  console.log("Generating invoice:", invoice);
  try {
    const response = await fetch(`${baseUrl}invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(invoice),
    });

    if (response.status === 201) {
      return await response.json();
    }

    if (response.status !== 201) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate invoice");
    }
  } catch (error: any) {
    console.error("Error in generateInvoice:", error);
    switch (error.status) {
      case 400:
        throw JSON.stringify({
          data: {
            message: "Invalid request",
            status: 400,
          },
        });
      default:  
        throw JSON.stringify({
          data: {
            message: "Failed to generate invoice",
            status: error.status || 500,
          },
        });
    }
  }
}

export async function getInvoices(token: string) {
  try {
    const response = await fetch(`${baseUrl}invoices`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      throw response;
    }

    if (response.status !== 200 && response.status === 404) {
      return {
        invoices: [],
        message: "No invoices found"
      };
    }

    const data = await response.json();
    return data as Invoice[];
  } catch (error: any) {
    console.error("Error in getInvoices:", error);
    switch (error.status) {
      case 404:
        throw JSON.stringify({
          data: {
            message: "No invoices found",
            status: 404,
          },
        });
      default:
        throw JSON.stringify({
          data: {
            message: "Failed to fetch invoices",
            status: error.status || 500,
          },
        });
    }
  }
}

export async function getInvoiceById(token: string, invoiceId: string) {
  try {
    const response = await fetch(`${baseUrl}invoices/${invoiceId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      throw response;
    }

    const data = await response.json();
    return data as Invoice;
  } catch (error: any) {
    switch (error.status) {
      case 404:
        throw JSON.stringify({
          data: {
            message: "Invoice not found",
            status: 404,
          },
        });
      default:
        throw JSON.stringify({
          data: {
            message: "Failed to fetch invoice",
            status: error.status || 500,
          },
        });
    }
  }
}

export async function generateInvoiceAfterDelivery(token: string, loadId: number) {
  try {
    const response = await fetch(`${baseUrl}invoices/generate-after-delivery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ loadId }),
    });

    if (response.status !== 201) {
      throw response;
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    switch (error.status) {
      case 404:
        throw JSON.stringify({
          data: {
            message: "Load not found",
            status: 404,
          },
        });
      case 400:
        throw JSON.stringify({
          data: {
            message: "Invalid request - Load not in delivered status",
            status: 400,
          },
        });
      default:
        throw JSON.stringify({
          data: {
            message: "An error occurred",
            status: 500,
          },
        });
    }
  }
}

export async function createInvoice(token: string, invoice: Omit<Invoice, 'id'>) {
  try {
    const response = await fetch(`${baseUrl}invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(invoice),
    });

    if (response.status !== 201) {
      throw response;
    }

    const data = await response.json();
    return data as Invoice;
  } catch (error: any) {
    throw JSON.stringify({
      data: {
        message: "Failed to create invoice",
        status: error.status || 500,
      },
    });
  }
}

export async function getShipperInvoices(token: string, shipperId: string) {
  try {
    const response = await fetch(`${baseUrl}invoices/shipper/${shipperId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      throw response;
    }

    const data = await response.json();
    return data as Invoice[];
  } catch (error: any) {
    // ... existing error handling ...
  }
}

export async function updateInvoice(token: string, invoiceId: string, updates: Partial<Invoice>) {
  try {
    const response = await fetch(`${baseUrl}invoices/${invoiceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (response.status !== 200) {
      throw response;
    }

    const data = await response.json();
    return data as Invoice;
  } catch (error: any) {
    throw JSON.stringify({
      data: {
        message: "Failed to update invoice",
        status: error.status || 500,
      },
    });
  }
}

export async function deleteInvoice(token: string, invoiceId: string) {
  try {
    const response = await fetch(`${baseUrl}invoices/${invoiceId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      throw response;
    }

    return true;
  } catch (error: any) {
    throw JSON.stringify({
      data: {
        message: "Failed to delete invoice",
        status: error.status || 500,
      },
    });
  }
}

export async function getCarrierInvoices(token: string, carrierId: string) {
  try {
    const response = await fetch(`${baseUrl}invoices/carrier/${carrierId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return { invoices: [], message: "No invoices found" };
    }

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error fetching carrier invoices:", error);
    throw error;
  }
}

export async function getInvoiceByLoadId(token: string, loadId: number): Promise<Invoice | null> {
  try {
    const response = await fetch(`${baseUrl}invoices/load/${loadId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log("Response:", response);
    if (response.status !== 200) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch invoice');
    }

    const data = await response.json();
    console.log("Data:", data);
    if (!data) {
      return null;
    }

    return data;
  } catch (error: any) {
    console.error("Error fetching invoice by load:", error);
    throw error;
  }
}

export async function getInvoiceByNumber(token: string, invoiceNumber: string) {
  try {
    const response = await fetch(`${baseUrl}invoices/number/${invoiceNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error fetching invoice by number:", error);
    throw error;
  }
}

export async function generateInvoiceFromLoad(token: string, loadId: number, carrierId: string) {
  try {
    // First, fetch load details
    const loadResponse = await fetch(`${baseUrl}loads/${loadId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const loadData = await loadResponse.json();

    // Calculate all fees and taxes
    const baseAmount = loadData.agreedRate || loadData.rate;
    const {
      serviceFee,
      vat,
      withholding,
      finalAmount
    } = calculateCarrierDeductions(baseAmount);

    // Generate invoice number (you might want to get this from the backend)
    const invoiceNumber = `INV-${loadId}-${Date.now()}`;

    // Create invoice object
    const invoice: Omit<Invoice, 'id'> = {
      loadId,
      number: invoiceNumber,
      amount: baseAmount,
      status: "pending",
      issueDate: new Date().toISOString(),
      // TODO: Change due date to starting now
      dueDate: new Date(Date.now()).toISOString(), // 30 days from now
      shipperId: loadData.shipperId,
      totalAmount: finalAmount,
      totalVat: vat,
      withHolding: withholding,
      serviceFees: serviceFee,
      notes: "",
      transactionId: "", // Will be filled when paid
      paymentMethod: defaultPaymentMethod, // Use the default payment method
    };

    // Create the invoice in the database
    const response = await fetch(`${baseUrl}invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(invoice),
    });

    if (response.status !== 201) {
      throw response;
    }

    const data = await response.json();
    return data as Invoice;
  } catch (error: any) {
    throw JSON.stringify({
      data: {
        message: "Failed to generate invoice",
        status: error.status || 500,
      },
    });
  }
} 