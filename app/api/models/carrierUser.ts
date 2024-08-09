export interface CarrierVehicle {
  id: number;
  vehicleTypeId: number;
  name: string;
  description: string;
  imageUrl: string;
  vin: string;
  licensePlate: string;
  make: string;
  model: string;
  year: string;
  color: string;
  hasInsurance: boolean;
  hasRegistration: boolean;
  hasInspection: boolean;
}

interface BusinessProfile {
  companyName: string;
  motorCarrierNumber: string;
  dotNumber: string;
  equipmentType: string;
  availableCapacity: number;
  idCardOrDriverLicenceNumber: string | null;
  insuranceName: string | null;
  businessType: string | null;
  carrierRole: string | null;
  shipperRole: number | null;
  businessRegistrationNumber: string | null;
  carrierVehicles: CarrierVehicle[]; // Include carrier vehicles array
}

export interface UserBusinessProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
  userType: string;
  roles: string[];
  confirmed: boolean;
  status: string;
  businessProfile: BusinessProfile; // Link to the BusinessProfile interface
}
