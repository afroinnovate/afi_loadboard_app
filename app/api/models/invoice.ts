export interface Invoice {
  id: string;
  loadId: number;
  number: string;
  amount: number;
  status: "pending_approval" | "approved" | "paid" | "disputed";
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
  serviceFees: {
    total: number;
    shipperFee: number;  // 2% of total
    carrierFee: number;  // 1% of total
  };
  finalAmounts: {
    shipperTotal: number;  // amount + shipperFee
    carrierReceives: number;  // amount - carrierFee
  };
  approvalStatus: {
    shipperApproved: boolean;
    carrierApproved: boolean;
  };
  paymentDetails?: {
    method: "bank" | "mobile_money";
    bankDetails?: BankDetails;
    mobileMoneyDetails?: MobileMoneyDetails;
  };
  disputeMessages?: Message[];
} 