import type { Invoice } from "../models/invoice";

const baseUrl = "https://api.frieght.afroinnovate.com/";

export async function generateInvoice(token: string, loadId: number) {
  try {
    const response = await fetch(`${baseUrl}invoices/generate`, {
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
    return data as Invoice;
  } catch (error: any) {
    switch (error.status) {
      case 404:
        throw JSON.stringify({
          data: {
            message: "Load not found",
            status: 404,
          },
        });
      // ... existing code ...
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

    const data = await response.json();
    return data as Invoice[];
  } catch (error: any) {
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