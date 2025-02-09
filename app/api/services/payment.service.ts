import { type PaymentMethod } from "../models/paymentMethod";
import type { Invoice } from "~/api/models/invoice";
import { json } from '@remix-run/node';

const baseUrl = "https://api.frieght.afroinnovate.com/api/";
// const baseUrl = "http://localhost:7070/api/";

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
  try {
    // Create payment request body
    const paymentData = {
      invoiceId: invoice.id,
      amount: invoice.totalAmount,
      paymentMethod: invoice.paymentMethod,
      currency: "ETB",
      description: `Payment for invoice ${invoice.invoiceNumber}`,
    };

    // Simulate loading delay (1 second)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // comment out real api call and mock the success response
    const response = {
      status: 200,
      json: () => Promise.resolve({
        ...paymentData,
        transactionId: `TR-${invoice.id}-${invoice.invoiceNumber}`,
        timestamp: new Date().toISOString(),
        referenceNumber: `REF-${Date.now()}`,
      }),
    };

    if (response.status !== 200) {
      throw response;
    }

    const result = await response.json();

    return {
      transactionId: result.transactionId || `TR-${invoice.id}-${invoice.invoiceNumber}`,
      paymentDate: result.timestamp || new Date().toISOString(),
      status: 'paid',
      gatewayReference: result.referenceNumber,
    };

  } catch (error) {
    console.error("Payment processing failed:", error);
    throw error;
  }
}

export async function updatePaymentMethod(token: string, paymentMethodId: string, paymentMethod: PaymentMethod) {
  try {
    const response = await fetch(`${baseUrl}payment-methods/${paymentMethodId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentMethod),
    });

    // 204 means success with no content
    if (response.status === 204) {
      // Return the payment method we sent since 204 has no response body
      return paymentMethod;
    }

    if (response.status !== 200) {
      throw response;
    }

    const data = await response.json();
    return data as PaymentMethod;
  } catch (error: any) {
    throw JSON.stringify({
      data: {
        message: "Failed to update payment method",
        status: error.status || 500,
      },
    });
  }
} 