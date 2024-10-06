export const checkUserRole = (roles: string[], finegrainedRole: string): boolean[] => {
  if (!roles) {
    return [false, false, false, false, false];
  }

  const shipperAccess = roles.includes("shipper");
  const shipperHasAccess =
    finegrainedRole === "independent_shipper" ||
    finegrainedRole === "corporate_shipper" ||
    finegrainedRole === "govt_shipper";
  const adminAccess = roles.includes("admin");
  // check if the user is carrier
  const carrierAccess = roles.includes("carrier") || roles.includes("admin");
  // check the carrier has their finegrained role
  let carrierHasAccess =
    (finegrainedRole === "ownerOperator") ||
    (finegrainedRole === "dispatcher") ||
    (finegrainedRole === "fleetOwner");
  return [shipperAccess, shipperHasAccess, adminAccess, carrierAccess, carrierHasAccess];
};