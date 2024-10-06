import { useState } from "react";
import {
  Outlet,
  useLoaderData,
  useLocation,
  NavLink,
  // Removed unused import
  // useRouteError,
  useOutletContext,
} from "@remix-run/react";
import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import customStyles from "../styles/global.css";
import { authenticator } from "../api/services/auth.server";
import { commitSession, getSession } from "../api/services/session";
import Sidebar from "../components/sidebar";
import Overview from "../components/overview";
import AccessDenied from "~/components/accessdenied";
import { getUserInfo } from "~/api/services/user.service";
import { type ShipperUser } from "../api/models/shipperUser";
import { getLoadsByShipperId } from "~/api/services/load.service";
import ErrorDisplay from "~/components/ErrorDisplay";
import { GetBidByLoadId, GetBidByLoadIdandCarrierId } from "~/api/services/bid.service";
// Removed unused import
// import { GetBidsByCarrierId } from "~/api/services/bid.service";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Shipper's dashboard",
      description: "Dashboard for Shippers",
    },
  ];
};
export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

interface OutletContext {
  theme: "light" | "dark";
  timezone: string;
}

interface BidObject {
  load: any;
  bids: [];
}

//protect this route with authentication
export const loader: LoaderFunction = async ({ request }) => {
  
  const mapRoles = {
    0: "independent_shipper",
    1: "corporate_shipper",
    2: "govt_shipper"
  };
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user: any = session.get(authenticator.sessionKey);
    if (!user) {
      return redirect("/logout/");
    }

    const session_expiration: any = process.env.SESSION_EXPIRATION;
    const EXPIRES_IN = parseInt(session_expiration) * 1000; // Convert seconds to milliseconds
    if (isNaN(EXPIRES_IN)) {
      throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
    }

    const expires = new Date(Date.now() + EXPIRES_IN);

    if (user?.user.userType === "carrier") {
      return redirect("/carriers/dashboard/");
    }

    // hydrate session user with shipper data
    var userBusinessInfo: any = await getUserInfo(user?.user.id, user?.token);

    if (userBusinessInfo && userBusinessInfo.userType === "shipper") {
      const shipperUser: ShipperUser = {
        id: user?.user.id,
        token: user.token,
        user: {
          firstName: userBusinessInfo.firstName,
          middleName: userBusinessInfo.middleName,
          lastName: userBusinessInfo.lastName,
          email: userBusinessInfo.email,
          phone: userBusinessInfo.phone,
          userType: userBusinessInfo.userType,
          businessProfile: {
            companyName: userBusinessInfo.businessProfile.companyName,
            businessType: userBusinessInfo.businessProfile.businessType,
            businessRegistrationNumber:
              userBusinessInfo.businessProfile.businessRegistrationNumber,
            shipperRole: mapRoles[userBusinessInfo.businessProfile.shipperRole as keyof typeof mapRoles],
            idCardOrDriverLicenceNumber:
              userBusinessInfo.businessProfile.idCardOrDriverLicenceNumber,
          },
          roles: user?.user.roles,
          confirmed: user?.user.confirmed,
          status: user?.user.status,
        },
      };
      session.set("shipper", shipperUser);
    } else {
      const shipperProfile = {
        id: user?.user.id,
        token: user.token,
        user: {
          firstName: user?.user.firstName,
          middleName: user?.user.middleName,
          lastName: user?.user.lastName,
          email: user?.user.email,
          phone: user?.user.phoneNumber,
          userType: user?.user.userType,
          businessProfile: {
            companyName: "",
            motorCarrierNumber: "",
            dotNumber: "",
            equipmentType: "",
            availableCapacity: 0,
            idCardOrDriverLicenceNumber: "",
            insuranceName: "",
            businessType: "",
            carrierRole: null,
            shipperRole: null,
            businessRegistrationNumber: "",
            carrierVehicles: [],
          },
          roles: user?.user.roles,
          confirmed: user?.user.confirmed,
          status: user?.user.status,
        },
      };
      session.set("shipper", shipperProfile);
    }

    // Set the session for the auth user
    session.set(authenticator.sessionKey, user);
    const shipperUser = session.get("shipper");

    const loads = await getLoadsByShipperId(shipperUser.token, shipperUser.id);
    // Explicitly type the bids array
    let bidsDict: BidObject[] = [];
    for (const load of loads) {
      if (load && load.loadId) {
        try {
          // Ensure load.id is passed as a string
          const bids = await GetBidByLoadId(load.loadId, shipperUser.token);
          if (bids.length > 0) {
            bidsDict.push({ load: load, bids: bids });
          }
        } catch (error) {
          console.error(`Error fetching bid for load ${load.loadId}:`, error);
        }
      } else {
        console.error(`Invalid load data:`, load);
      }
    }
    return json(
      { user: shipperUser, loads, bidsDict },
      {
        headers: {
          "Set-Cookie": await commitSession(session, { expires }),
        },
      }
    );
  } catch (error: any) {
    console.log("Shipper Dashboard login Error", error.data);
    let errorMessage = "An unexpected error occurred";
    if (error.message !== undefined) {
      errorMessage = error.message;
    }
    if (error.data !== undefined && error.data.message) {
      errorMessage = error.data.message;
    }
    if(JSON.parse(error).data && JSON.parse(error).data.status == 401) {
      return redirect("/logout/");
    }
    // Instead of throwing, return a json response with the error
    return json(
      { error: errorMessage },
      { status: 500 }
    );
  }
};

export default function Dashboard() {
  const { user, loads, bidsDict, error } = useLoaderData<{
    user: ShipperUser;
    loads: any;
    bidsDict: BidObject[];
    error?: { message: string; status: number };
  }>();
  const { theme, timezone } = useOutletContext<OutletContext>();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const isLoadOperationsActive =
    location.pathname.startsWith("/dashboard/loads/");

  // Determine the active section based on the URL
  const activeSection = location.pathname.split("/")[2] || "home";

  // User roles and permission checks
  if (user.user.userType !== "shipper") {
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have access to the shipper dashboard."
      />
    );
  }

  const themeClasses = {
    header: theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200",
    headerText: theme === "dark" ? "text-white" : "text-black",
    headerHover: theme === "dark" ? "hover:text-gray-300" : "hover:text-gray-600",
    activeLink: theme === "dark" ? "border-blue-400" : "border-blue-600",
    inactiveLink: theme === "dark" ? "text-gray-400" : "text-gray-500",
    welcomeText: theme === "dark" ? "text-green-400" : "text-green-800",
    main: theme === "dark" ? "bg-gray-900" : "bg-white",
  };

  return (
    <>
      {/* Desktop view setup */}
      <header className={`hidden lg:flex justify-between items-center py-4 px-8 border-b-2 fixed top-16 left-0 right-0 ${themeClasses.header}`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className={`${themeClasses.headerText} ${themeClasses.headerHover} mr-4 text-4xl`}
          >
            &#9776;
          </button>

          <NavLink
            to="/shipper/dashboard/"
            end
            className={({ isActive }) =>
              `${themeClasses.headerText} font-semibold ` +
              (isActive
                ? `border-b-2 ${themeClasses.activeLink}`
                : `${themeClasses.inactiveLink} ${themeClasses.headerHover}`)
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/shipper/dashboard/loads/view/"
            className={() =>
              `${themeClasses.headerText} font-semibold ` +
              (isLoadOperationsActive
                ? `border-b-2 ${themeClasses.activeLink}`
                : `${themeClasses.inactiveLink} ${themeClasses.headerHover}`)
            }
          >
            Load Operations
          </NavLink>

          <h2
            className={`font-bold text-xl flex justify-center items-center mx-auto ${themeClasses.welcomeText}`}
            style={{
              animation: "bounce 2s ease-in-out 2",
            }}
          >
            Welcome to Shipper Dashboard!!! Let's Keep them Moving...
          </h2>
        </div>
      </header>
      <div className="flex pt-16 mt-20">
        <div className="hidden lg:flex top-30">
          {sidebarOpen && <Sidebar activeSection={activeSection} />}
        </div>
        <main className={`w-full flex justify-center content-center p-3 shadow-lg mt-20 ${themeClasses.main}`}>
          {location.pathname === "/shipper/dashboard/" && <Overview />}
          <Outlet context={{ loads, bidsDict, theme, timezone }} />
        </main>
      </div>
    </>
  );
}