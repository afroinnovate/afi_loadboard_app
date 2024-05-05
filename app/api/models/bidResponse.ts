export interface BidResponse {
    id: number;
    loadId: number;
    carrierId: number;
    bidAmount: number;
    bidStatus: number;
    biddingTime: string;
    updatedBy: string;
    updatedAt: string;
    carrier: {
        id: number;
        companyName: string;
        dotNumber: string;
        email: string;
        phoneNumber: string;
    };
}

