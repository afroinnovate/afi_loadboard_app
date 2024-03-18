export type LoadRequest = {
    userId: string;
    shipperUserId: string;
    origin: string;
    destination: string;
    pickupDate: string;
    deliveryDate: string;
    commodity: string;
    weight: number;
    offerAmount: number;
    loadDetails: string;
    loadStatus: string;
    modifiedBy: string;
    modified: string;
    created: string;
}

