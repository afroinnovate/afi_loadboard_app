export interface Invoice {
  id: string;
  loadId: number;
  number: string;
  amount: number;
  status: "generated" | "pending";
  createdAt: string;
  pdfUrl?: string;

  // Additional fields that might be useful
  shipperId: string;
  carrierId?: string;
  loadDetails?: {
    origin: string;
    destination: string;
    pickupDate: string;
    deliveryDate: string;
    commodity: string;
    weight: number;
  };
} 