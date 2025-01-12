export interface Invoice {
  id: string;
  invoiceNumber: string;
  loadId: string;
  issuedDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  shipper: {
    name: string;
    companyName: string;
    address: string;
    taxId: string;
    email: string;
  };
  carrier: {
    name: string;
    companyName: string;
    address: string;
    taxId: string;
    email: string;
  };
  load: {
    origin: string;
    destination: string;
    deliveryDate: string;
    commodity: string;
    weight: number;
  };
  charges: {
    baseRate: number;
    additionalServices: {
      description: string;
      amount: number;
    }[];
    subtotal: number;
    taxes: {
      VAT: number;
      withholding: number;
    };
    total: number;
  };
  paymentTerms: string;
  notes: string;
}

export const mockInvoices: Invoice[] = [
  {
    id: "INV-2024-001",
    invoiceNumber: "INV/2024/001",
    loadId: "LOAD-001",
    issuedDate: "2024-03-15",
    dueDate: "2024-04-14",
    status: "pending",
    shipper: {
      name: "John Doe",
      companyName: "ABC Logistics Ltd",
      address: "123 Business Ave, Addis Ababa",
      taxId: "TAX123456",
      email: "billing@abclogistics.com"
    },
    carrier: {
      name: "Sarah Smith",
      companyName: "FastTrack Transport",
      address: "456 Carrier Road, Addis Ababa",
      taxId: "TAX789012",
      email: "accounts@fasttrack.com"
    },
    load: {
      origin: "Addis Ababa",
      destination: "Dire Dawa",
      deliveryDate: "2024-03-14",
      commodity: "Electronics",
      weight: 5000
    },
    charges: {
      baseRate: 25000,
      additionalServices: [
        { description: "Loading Fee", amount: 1000 },
        { description: "Insurance", amount: 1500 }
      ],
      subtotal: 27500,
      taxes: {
        VAT: 4125, // 15% VAT
        withholding: 550  // 2% Withholding tax
      },
      total: 31075
    },
    paymentTerms: "Net 30",
    notes: "Please include invoice number in payment reference"
  },
  // Add more mock invoices...
]; 