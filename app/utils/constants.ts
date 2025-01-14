export const FEES_AND_TAXES = {
  // Platform fees
  SERVICE_FEE_RATE: 0.01, // 1% platform service fee for carriers
  SHIPPER_SERVICE_FEE_RATE: 0.02, // 2% platform service fee for shippers

  // Government taxes
  VAT_RATE: 0.15, // 15% VAT
  WITHHOLDING_TAX_RATE: 0.02, // 2% Withholding tax

  // Additional charges (paid by shipper)
  LOADING_FEE_RATE: 0.05, // 5% of base rate
  INSURANCE_RATE: 0.03, // 3% of base rate
} as const;

// Calculate carrier deductions
export const calculateCarrierDeductions = (baseRate: number) => {
  const serviceFee = baseRate * FEES_AND_TAXES.SERVICE_FEE_RATE;
  const vat = baseRate * FEES_AND_TAXES.VAT_RATE;
  const withholding = baseRate * FEES_AND_TAXES.WITHHOLDING_TAX_RATE;

  return {
    serviceFee,
    vat,
    withholding,
    totalDeductions: serviceFee + vat + withholding,
    finalAmount: baseRate - (serviceFee + vat + withholding)
  };
};

// Calculate shipper additions
export const calculateShipperCharges = (baseRate: number) => {
  const loadingFee = baseRate * FEES_AND_TAXES.LOADING_FEE_RATE;
  const insurance = baseRate * FEES_AND_TAXES.INSURANCE_RATE;

  return {
    loadingFee,
    insurance,
    totalAdditions: loadingFee + insurance,
    finalAmount: baseRate + loadingFee + insurance
  };
}; 