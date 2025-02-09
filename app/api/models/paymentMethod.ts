export interface PaymentMethod {
  paymentMethodId: string;
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
}