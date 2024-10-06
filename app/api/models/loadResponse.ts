export interface Load {
    loadId: number;
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
    createdBy: object;
}

export type LoadResponse = Load[];
