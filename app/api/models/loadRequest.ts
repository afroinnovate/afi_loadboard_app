export type LoadRequest = {
    shipperUserId: string;
    origin: string;
    destination: string;
    pickupDate: string;
    deliveryDate: string;
    commodity: string;
    estimatedDistance: number;
    weight: number;
    offerAmount: number;
    loadDetails: string;
    loadStatus: string;
    createdAt: string;
    createdBy: {
        userId: string;
        email: string;
        firstName: string;
        middleName: string;
        lastName: string;
        phone: string;
        userType: string;
        businessType: string;
        businessRegistrationNumber: string;
        companyName: string;
        idCardOrDriverLicenceNumber: string;
        shipperRole: number;
    };
};