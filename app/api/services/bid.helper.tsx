import { GetBidByLoadIdandCarrierId, PlaceBid, UpdateBid } from "./bid.service";

export async function manageBidProcess(user: any, loadId: number, bidAmount: Number, bidStatus: Number = 0) {
  try {
    const userId = user.id ? user.id : user.user.userId;
    const bidResponse = await GetBidByLoadIdandCarrierId(
      Number(loadId),
      userId,
      user.token
    );
    let bidRequest: any = formatBidRequest(user, bidResponse, bidAmount, loadId, bidStatus);
    if (bidResponse !== null && bidResponse.carrierId === user.userId) {
      const response = await UpdateBid(user.token, bidResponse.id, bidRequest);
      return handleBidResponse(response, Number(bidRequest.bidAmount));
    } else {
      const response = await PlaceBid(bidRequest, user.token);
      return handleBidResponse(response, bidRequest.bidAmount);
    }
  } catch (error: any) {
    console.log("manage bid placement error: ", error)
    throw JSON.stringify({
      data: {
        message: error.statusText,
        status: error.status
      }
    })
  }
}

export function formatBidRequest(user: any, existingBid: any, bidAmount: Number, loadId: Number, bidStatus: Number = 0) {
  if (existingBid) {
    return {
      bidAmount,
      bidStatus: bidStatus,
      updatedBy: user.id,
    };
  }

   // Get the first vehicle from the carrierVehicles array
  const vehicle = user.user.businessProfile.carrierVehicles[0] || {};
  const mapCarrierRole = (role: string | number) => {
    switch (role) {
      case "ownerOperator":
        return 0;
      case "fleetOwner":
        return 1;
      case "dispatcher":
        return 2;
      default:
        return 0;
    }
  };
  const carrierRole = mapCarrierRole(user.user.businessProfile?.carrierRole);

  return {
    loadId: loadId,
    carrierId: user.id,
    bidAmount,
    bidStatus: 0, // assuming status codes need to be defined
    biddingTime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: {
      userId: user.id,
      email: user.user.email,
      firstName: user.user.firstName,
      middleName: user.user.middleName,
      lastName: user.user.lastName,
      phone: user.user.phone,
      userType: user.user.userType,
      dotNumber: user.user.businessProfile.dotNumber,
      motorCarrierNumber: user.user.businessProfile.motorCarrierNumber,
      equipmentType: user.user.businessProfile.equipmentType,
      availableCapacity: user.user.businessProfile.availableCapacity,
      companyName: user.user.businessProfile.companyName,
      carrierRole: carrierRole,
      name: vehicle.name,
      description: vehicle.description,
      imageUrl: vehicle.imageUrl,
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      hasInsurance: vehicle.hasInsurance,
      hasRegistration: vehicle.hasRegistration,
      hasInspection: vehicle.hasInspection,
      quantity: 1, // Assuming quantity is always 1, adjust if needed
    },
  };
}

export function handleBidResponse(response: any, bidAmount: number) {
  if (response.error) {
    return { "message": "bidNotPlaced", "amount": bidAmount };
  }
  return { "message": "bidPlaced/Updated", "amount": bidAmount, "Status": response.bidStatus };
}
