
export interface User {    
    // firstName: number;
    // middleName: string;
    // lastName: string;
    // dob: Date;
    email: string;
    // username: string;
    password: string;
    // verifyPassword: string;
    phone: string;
}

export interface UserResponse {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phone: string;
    userType: string;
    businessProfile: {
        companyName: string;
        motorCarrierNumber: string;
        dotNumber: string;
        equipmentType: string;
        availableCapacity: number;
        idCardOrDriverLicenceNumber: string;
        insuranceName: string;
        businessType: string;
        carrierRole: number;
        shipperRole: number;
        businessRegistrationNumber: string;
        vehicleTypes: string[];
    },
}