
export interface CarrierUser {
  id: string;
  token: string;
  user: {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phone: string;
    userType: string;
    dotNumber: string;
    motorCarrierNumber: string;
    equipmentType: string;
    availableCapacity: number;
    companyName: string;
    vehicleTypes: string[];
    carrierRole: number;
    roles: string[];
    confirmed: boolean;
    status: boolean;
  } 
}