import { type PaymentMethod } from "../models/paymentMethod";
import type { Invoice } from "~/api/models/invoice";
import { json } from '@remix-run/node';

const baseUrl = "https://api.frieght.afroinnovate.com/api/";

export async function savePaymentMethod(token: string, paymentMethod: PaymentMethod) {
  try {
    const response = await fetch(`${baseUrl}payment-methods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentMethod),
    });

    console.log(response)

    if (response.status !== 201) {
      throw response;
    }

    const data = await response.json();
    return data as PaymentMethod;
  } catch (error: any) {
    throw JSON.stringify({
      data: {
        message: "Failed to save payment method",
        status: error.status || 500,
      },
    });
  }
}

export async function getPaymentMethods(token: string, carrierId: string) {
  try {
    const response = await fetch(`${baseUrl}payment-methods/${carrierId}`, {
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
    return data as PaymentMethod[];
  } catch (error: any) {
    throw JSON.stringify({
      data: {
        message: "Failed to fetch payment methods",
        status: error.status || 500,
      },
    });
  }
}

export async function deletePaymentMethod(token: string, paymentMethodId: string) {
  try {
    const response = await fetch(`${baseUrl}payment-methods/${paymentMethodId}`, {
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
        message: "Failed to delete payment method",
        status: error.status || 500,
      },
    });
  }
}

export async function processPayment(token: string, invoice: Invoice) {
  const transactionId = `TR-${invoice.id}-${invoice.invoiceNumber}`;
  invoice.transactionId = transactionId;
  invoice.status = "paid";
  console.log("invoice ", invoice);

  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create payment request body
    const paymentData = {
      ...invoice,
      status: "paid",
      transactionId,
      paymentDate: new Date().toISOString()
    };

    // In real implementation, this would be an API call to your payment gateway
    // const response = await fetch(`${baseUrl}payments`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`,
    //   },
    //   body: JSON.stringify(paymentData),
    // });

    // Mock successful payment response
    const updatedInvoice: Invoice = {
      ...invoice,
      ...paymentData
    };

    // If the response.status of update works
    // if (response.status === 200) {
    //   return {
    //     ...updatedInvoice,
    //     message: "Payment processed successfully! Your receipt has been generated.",
    //   };
    // }

    // In real implementation, make API call to update invoice status
    // await updateInvoiceStatus(token, invoice.id, updatedInvoice);

    return {
      ...updatedInvoice,
      message: "Payment processed successfully! Your receipt has been generated."
    };
  } catch (error) {
    console.error("Payment processing failed:", error);
    throw new Error("Payment processing failed");
  }
} 