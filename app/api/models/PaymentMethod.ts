export interface PaymentMethod {
  method: string;
  type: string;
  bankName: string;
  bankAccount: string;
  accountHolderName: string;
  phoneNumber: string;
  cardMethod: string;
  cardType: string;
  lastFourDigits: string;
  billingAddress: string;
}