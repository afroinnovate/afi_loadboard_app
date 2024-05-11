import { GetBid, PlaceBid, UpdateBid } from "./bid.service";

export async function manageBidProcess(user: any, loadId: number, formData: FormData) {
  const bid = await GetBid(user.token, Number(loadId));
  let bidRequest = formatBidRequest(user, bid, formData);
  if (bid) {
    const response = await UpdateBid(user.token, bid.id, bidRequest);
    return handleBidResponse(response, bidRequest.bidAmount);
  } else {
    const response = await PlaceBid(bidRequest, user.token);
    return handleBidResponse(response, bidRequest.bidAmount);
  }
}

export function formatBidRequest(user: any, existingBid: any, formData: FormData) {
  const bidAmount = Number(formData.get("bidAmount"));
  if (existingBid) {
    return { ...existingBid, bidAmount, updatedAt: new Date().toISOString() };
  }
  return {
    loadId: Number(formData.get("loadId")),
    carrierId: user.id,
    bidAmount,
    bidStatus: 0, // assuming status codes need to be defined
    updatedAt: new Date().toISOString()
  };
}

export function handleBidResponse(response: any, bidAmount: number) {
  if (!response || response.error) {
    return { "message": "bidNotPlaced", "amount": bidAmount };
  }
  return { "message": "bidPlaced", "amount": bidAmount };
}