export const checkUserRole = (roles: string[]): boolean[] => {
  if (!roles) {
    return [false, false, false, false, false];
  }
  const shipperAccess = roles.includes("shipper");
  const shipperHasAccess = (
    roles.includes("indepedent_shipper") || 
    roles.includes("corporate_shipper") ||
    roles.includes("gov_shipper")
  )
  const adminAccess = roles.includes("admin");
  const carrierAccess = roles.includes("carrier") || roles.includes("admin");
  const carrierHasAccess =
    roles.includes("owner_operator") ||
    roles.includes("dispatcher") ||
    roles.includes("company_driver") ||
    roles.includes("fleet_owner");

  return [shipperAccess, shipperHasAccess, adminAccess, carrierAccess, carrierHasAccess];
};