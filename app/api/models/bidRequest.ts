export type BidRequest = {
    loadId: number;
    carrierId: number;
    bidAmount: number;
    bidStatus: number;
    biddingTime: string;
    updatedBy: string;
    updatedAt: string;
}

export type BidUpdateRequest = {
    bidStatus: number;
    updatedBy: string;
    bidAmount: number;
}

