import { type PaymentMethod } from "./paymentMethod";

export type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id: number;
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
  paymentMethod: PaymentMethod;
}

export interface InvoiceRequest {
  id: number;
  invoiceNumber: string;
  loadId: number;
  issueDate: string;
  dueDate: string;
  status: string;
  carrierId: string;
  amountDue: number;
  totalAmount: number;
  totalVat: number;
  withholding: number;
  serviceFees: number;
  createdAt: string;
  note: string;
  transactionId: string;
  paymentMethod: {
    paymentType: string;
    carrierId: string;
    bankName: string;
    bankAccount: string;
    accountHolderName: string;
    phoneNumber: string;
    cardMethod: string;
    cardType: string;
    lastFourDigits: string;
    billingAddress: string;
  };
}