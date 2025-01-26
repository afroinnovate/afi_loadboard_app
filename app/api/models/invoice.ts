import { type PaymentMethod } from "./PaymentMethod";

export interface Invoice {
  // id: string;
  loadId: number;
  number: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
  issueDate: string;
  dueDate: string;
  shipperId: string;
  totalAmount: number;
  totalVat: number;
  withHolding: number;
  serviceFees: number;
  notes: string;
  transactionId: string;
  paymentMethod: PaymentMethod;
}