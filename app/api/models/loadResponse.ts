type Load = {
    id: number;
    userId: string;
    origin: string;
    destination: string;
    pickupDate: string;
    deliveryDate: string;
    commodity: string;
    weight: number;
    offerAmount: number;
    loadDetails: string;
    loadStatus: string;
}

export type LoadResponse = Load[];
