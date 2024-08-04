import { checkUserRole } from "./checkroles";
const session_expiration: any = process.env.SESSION_EXPIRATION;

const EXPIRES_IN = parseInt(session_expiration) * 1000; // Convert seconds to milliseconds

if (isNaN(EXPIRES_IN)) {
  throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
}

export const redirectUser = async (user: any) => {
  let shipperDashboard = true;

  const [
    shipperAccess,
    shipperHasAccess,
    adminAccess,
    carrierAccess,
    carrierHasAccess,
  ] = checkUserRole(user.roles);
  
  // if the login user has shipper roles, redirect to the shipper dashboard
  if (
    user.roles &&
    ((!carrierAccess && !carrierHasAccess) ||
      adminAccess)
  ) {
    console.log("redirecting to shipper dashboard");
    return shipperDashboard;
  }

  // if the login user has carrier roles, redirect to the carrier dashboard
  if (
    user.roles &&
    (
      (!shipperAccess && !shipperHasAccess) ||
      adminAccess)
  ) {
    shipperDashboard = false;
    return shipperDashboard;
  }
}