export interface Receipt {
  receiptNumber: string;
  invoiceNumber: string;
  transactionId: string;
  paidAmount: number;
  paidAt: string;
  paymentMethod: string;
  taxes: {
    VAT: number;
    withholding: number;
  };
  payer: {
    name: string;
    companyName: string;
    taxId: string;
  };
  recipient: {
    name: string;
    companyName: string;
    taxId: string;
  };
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  mobileMoneyInfo?: {
    provider: string;
    phoneNumber: string;
    accountName: string;
  };
} 