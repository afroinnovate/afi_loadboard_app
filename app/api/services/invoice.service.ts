import type { Invoice, InvoiceRequest } from "../models/invoice";
import { calculateCarrierDeductions } from "~/utils/constants";

const baseUrl = "https://api.frieght.afroinnovate.com/api/";
// const baseUrl = "http://localhost:7070/api/";

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
      console.log(error);
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return [];
    }

    if (response.status !== 200) {
      const errorData = await response.json().catch(() => null);
      throw {
        status: response.status,
        data: errorData || { message: "Failed to fetch shipper invoices" }
      };
    }

    const data = await response.json();
    return data as Invoice[];
  } catch (error: any) {
    throw JSON.stringify({
      data: {
        message: error.data?.message || "Failed to fetch shipper invoices",
        status: error.status || 500
      }
    });
  }
}

export async function updateInvoice(token: string, invoiceId: string, updates: Partial<Invoice>) {
  console.log("Updating invoice:", updates);
  try {
    const response = await fetch(`${baseUrl}invoices/${invoiceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    console.log("Response:", response);

    if (response.status !== 204) {
      const errorData = await response.json().catch(() => null);
      console.log("Error data:", errorData);
      throw {
        status: response.status,
        data: {
          message: errorData?.message || "Failed to update invoice",
          status: response.status
        }
      };
    }

    // Fetch the updated invoice after successful update
    const updatedResponse = await fetch(`${baseUrl}invoices/${invoiceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!updatedResponse.ok) {
      throw new Error("Failed to fetch updated invoice");
    }

    const updatedInvoice = await updatedResponse.json();
    return updatedInvoice as Invoice;

  } catch (error: any) {
    console.error("Invoice update error:", error);
    throw JSON.stringify({
      status: error.status || 500,
      data: {
        message: error.data?.message || "Failed to update invoice",
        status: error.status || 500
      }
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
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`
      }
    });

    // Handle 404 - No invoices found
    if (response.status === 404) {
      return [];
    }

    // Handle unauthorized
    if (response.status === 401) {
      throw JSON.stringify({
        data: {
          message: "Unauthorized access. Please login again.",
          status: 401
        }
      });
    }

    // Handle other non-200 responses
    if (!response.ok) {
      throw JSON.stringify({
        data: {
          message: "Failed to fetch carrier invoices",
          status: response.status
        }
      });
    }

    const data = await response.json();

    // Ensure we return an array
    if (!data) return [];

    // If data is already an array, return it
    if (Array.isArray(data)) return data;

    // If data has an invoices property that's an array, return that
    if (data.invoices && Array.isArray(data.invoices)) return data.invoices;

    // If we get here, something unexpected happened
    console.warn('Unexpected response format from carrier invoices:', data);
    return [];

  } catch (error: any) {
    console.error("Error fetching carrier invoices:", error);

    // If the error is already formatted correctly, just rethrow it
    if (typeof error === 'string') {
      throw error;
    }

    // Handle network errors
    if (error.name === 'TypeError' || error.code === 'ECONNREFUSED') {
      throw JSON.stringify({
        data: {
          message: "Unable to connect to the server. Please check your connection.",
          status: 503
        }
      });
    }

    // Handle any other errors
    throw JSON.stringify({
      data: {
        message: "Failed to fetch carrier invoices",
        status: 500
      }
    });
  }
}

export async function getInvoiceByLoadId(token: string, loadId: number) {
  try {
    console.log("Fetching invoice for load:", loadId);
    const response = await fetch(`${baseUrl}invoices/load/${loadId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response status:", response.status);
    if (response.status !== 200) {
      const errorData = await response.json().catch(() => null);
      console.log("Error data:", errorData);
      throw { status: response.status, data: errorData };
    }

    const data = await response.json();
    if (!data) {
      throw new Error("No invoice data received");
    }
    return data as Invoice;
  } catch (error: any) {
    console.error("Error fetching invoice by load:", error);

    // Check for network/connection errors
    if (error.code === 'ECONNREFUSED' || error.type === 'system') {
      throw JSON.stringify({
        data: {
          message: "Service is currently unavailable. Please contact support at support@afroinnovate.com",
          status: 503,
          isServiceDown: true
        },
      });
    }

    // Handle other errors
    switch (error.status) {
      case 404:
        throw JSON.stringify({
          data: {
            message: "No invoice found for this load. Please ensure the load exists and try again.",
            status: 404,
          },
        });
      case 400:
        throw JSON.stringify({
          data: {
            message: "Invalid request. Please check the load details and try again.",
            status: 400,
          },
        });
      case 401:
        throw JSON.stringify({
          data: {
            message: "Your session has expired. Please login again.",
            status: 401,
          },
        });
      default:
        throw JSON.stringify({
          data: {
            message: `Unable to fetch invoice details. ${error.message || 'Please try again later.'}`,
            status: error.status || 500,
          },
        });
    }
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