import { type PaymentMethod } from "./paymentMethod";

export type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

export interface InvoiceParty {
  id: string;
  name: string;
  companyName: string;
  address: string;
  taxId: string;
  email: string;
}

export interface LoadDetails {
  id: number;
  origin: string;
  destination: string;
  deliveryDate: string;
  commodity: string;
  weight: number;
  statusChangeDate?: string;
}

export interface InvoiceCharges {
  baseRate: number;
  serviceFee: number;
  tax: number;
  total: number;
  additionalCharges?: {
    description: string;
    amount: number;
  }[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  loadId: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  carrierId: string;
  amountDue: number;
  totalAmount: number;
  totalVat: number;
  withholding: number;
  serviceFees: number;
  createdAt: string;
  note: string;
  transactionId: string;
  transactionDate: string;
  transactionStatus: string;
  paymentMethod: PaymentMethod;
}

export interface InvoiceRequest {
  loadId: number;
  carrierId: string;
  shipperId: string;
  baseRate: number;
  serviceFee: number;
  tax: number;
  total: number;
  note?: string;
  paymentMethod?: PaymentMethod;
}