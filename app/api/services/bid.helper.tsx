import { GetBidByLoadIdandCarrierId, PlaceBid, UpdateBid } from "./bid.service";

export async function manageBidProcess(user: any, loadId: number, formData: FormData) {
  try{
    const bidResponse = await GetBidByLoadIdandCarrierId(user.token, Number(loadId), user.user.id);
    let bidRequest = formatBidRequest(user, bidResponse, formData);

    if (bidResponse && bidResponse.carrierId === user.user.id) {
      console.log('updating bid')
      const response = await UpdateBid(user.token, bidResponse.id, bidRequest);
      return handleBidResponse(response, bidRequest.bidAmount);
    } else {
      console.log("Creating a new bid with request: ", bidRequest)
      const response = await PlaceBid(bidRequest, user.token);
      return handleBidResponse(response, bidRequest.bidAmount);
    }
  }catch(error: any){
    throw JSON.stringify({
      data: {
        message: error.statusText,
        status: error.status
      }
    })
  }
}

export function formatBidRequest(user: any, existingBid: any, formData: FormData) {
  const bidAmount = Number(formData.get("bidAmount"));

  if (existingBid) {
    return { ...existingBid, bidAmount, updatedAt: new Date().toISOString() };
  }
  return {
    loadId: Number(formData.get("loadId")),
    carrierId: user.userId,
    bidAmount,
    bidStatus: 0, // assuming status codes need to be defined
    biddingTime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      phone: user.phone,
      userType: user.userType,
      dotNumber: user.dotNumber,
      motorCarrierNumber: user.motorCarrierNumber,
      equipmentType: user.equipmentType,
      availableCapacity: user.availableCapacity,
      companyName: user.companyName,
      carrierRole: user.carrierRole
    }
  };
}

export function handleBidResponse(response: any, bidAmount: number) {
  if (response.error) {
    return { "message": "bidNotPlaced", "amount": bidAmount };
  }
  return { "message": "bidPlaced", "amount": bidAmount };
}