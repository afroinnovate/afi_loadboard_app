
export interface ShipperUser {
  id: string
  token: string;
  user: {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phone: string;
    userType: string;
    businessProfile: {
      companyName: string;
      businessType: string;
      businessRegistrationNumber: string;
      shipperRole: number;
    },
    roles: string[];
    confirmed: boolean;
    status: boolean;
  }
}