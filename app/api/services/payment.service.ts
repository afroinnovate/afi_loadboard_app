import { type PaymentMethod } from "../models/paymentMethod";

const baseUrl = "https://api.frieght.afroinnovate.com/";

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

export async function getPaymentMethods(token: string, shipperId: string) {
  try {
    const response = await fetch(`${baseUrl}payment-methods/${shipperId}`, {
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