import { type PaymentMethod } from "./paymentMethod";

export type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id: number;
  invoiceNumber: string;
  loadId: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  shipperId: string;
  amountDue: number;
  totalAmount: number;
  totalVat: number;
  withholding: number;
  serviceFees: number;
  createdAt: string;
  note: string;
  transactionId: string;
  paymentMethod: PaymentMethod;
}

export interface InvoiceRequest {
  loadId: number;
  issueDate: string;
  dueDate: string;
  status: string;
  shipperId: string;
  amountDue: number;
  totalAmount: number;
  totalVat: number;
  withholding: number;
  serviceFees: number;
  note: string;
  transactionId: string;
  paymentMethod: PaymentMethod;
}