import { useEffect, useState } from "react";
import {
  Outlet,
  useLoaderData,
  useLocation,
  NavLink,
} from "@remix-run/react";
import { ErrorBoundary } from "~/components/errorBoundary";

import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import customStyles from "../styles/global.css";
import { authenticator } from "../api/services/auth.server";
import { commitSession, getSession } from "../api/services/session";
import AccessDenied from "~/components/accessdenied";
import SidebarCarrier from "~/components/sidebarCarrier";
import CarrierOverview from "~/components/carrierOverview";
import { redirectUser } from "~/components/redirectUser";
import { getUserInfo } from "~/api/services/user.service";
import type {
  CarrierVehicle,
} from "../api/models/carrierUser";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Afroinnovate | Loadboard | Carrier dashboard",
      description: "Dashboard for carriers",
    },
  ];
};
export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

export const loader: LoaderFunction = async ({ request }) => {
  try {
    // Check if we're still logged in
    const session = await getSession(request.headers.get("Cookie"));
    let user = session.get(authenticator.sessionKey);

    if (!user) {
      return redirect("/logout/");
    }

    const session_expiration: any = process.env.SESSION_EXPIRATION;
    const EXPIRES_IN = parseInt(session_expiration) * 1000; // Convert seconds to milliseconds

    if (isNaN(EXPIRES_IN)) {
      throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
    }

    const expires = new Date(Date.now() + EXPIRES_IN);

    // Redirect user to the appropriate dashboard
    if (user?.user.userType === "shipper") {
      return redirect("/shippers/dashboard/");
    }

    var userBusinessInfo: any = await getUserInfo(user?.user.id, user?.token);
    if (userBusinessInfo && userBusinessInfo.userType === "carrier") {
      const carrierUser: any = {
        id: user?.user.id,
        token: user.token,
        user: {
          email: user?.user.email,
          firstName: userBusinessInfo.firstName,
          middleName: userBusinessInfo.middleName,
          lastName: userBusinessInfo.lastName,
          phone: userBusinessInfo.phone,
          userType: userBusinessInfo.userType,
          businessProfile: {
            companyName: userBusinessInfo.businessProfile.companyName,
            motorCarrierNumber: userBusinessInfo.businessProfile.motorCarrierNumber,
            dotNumber: userBusinessInfo.businessProfile.dotNumber,
            equipmentType: userBusinessInfo.businessProfile.equipmentType,
            availableCapacity: userBusinessInfo.businessProfile.availableCapacity,
            idCardOrDriverLicenceNumber: userBusinessInfo.businessProfile.idCardOrDriverLicenceNumber,
            insuranceName: userBusinessInfo.businessProfile.insuranceName,
            businessType: userBusinessInfo.businessProfile.businessType,
            carrierRole: userBusinessInfo.businessProfile.carrierRole,
            shipperRole: null,
            businessRegistrationNumber: userBusinessInfo.businessProfile.businessRegistrationNumber,
            carrierVehicles: userBusinessInfo.businessProfile.carrierVehicles,
          },
        }
      };
      session.set("carrier", carrierUser);
    } else {
      const carrierProfile = {
        id: user?.user.id,
        token: user.token,
        user: {
          email: user?.user.email,
          firstName: user?.user.firstName,
          middleName: user?.user.middleName,
          lastName: user?.user.lastName,
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
        },
      };
      session.set("carrier", carrierProfile);
    }

    session.set(authenticator.sessionKey, user);
    var carrierProfile = session.get("carrier");

    return json(
      { user: carrierProfile },
      {
        headers: {
          "Set-Cookie": await commitSession(session, { expires }),
        },
      }
    );
  } catch (error: any) {
    console.error("carrier dashboard action error: ", JSON.parse(error  ));
    if (JSON.parse(error).data.status == 401) {
      return redirect("/logout/");
    }
    throw error;
  }
};

export default function CarrierDashboard() {
  const loaderData: any = useLoaderData();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const location = useLocation();

  const isLoadOperationsActive = location.pathname.startsWith(
    "/carriers/dashboard/view/"
  );

  // Determine the active section based on the URL
  const activeSection = location.pathname.split("/")[2] || "home";
  // Check if user has 'support', 'admin' or any role containing 'carrier'
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    // Set the sidebar state based on window width after component mounts
    const handleResize = () => setSidebarOpen(window.innerWidth > 768);
    // Call handleResize immediately to set the initial state based on current window size
    handleResize();
    // Add event listener to adjust sidebar visibility on window resize
    window.addEventListener("resize", handleResize);
    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array ensures this runs once on mount

  // User roles and permission checks
  if (loaderData.user.user.userType !== "carrier") {
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have access to the Carrier dashboard."
      />
    );
  }

  // If the carrier logged in
  return (
    <>
      {/* Desktop view on setup  */}
      <header className="hidden lg:flex justify-between items-center py-4 px-8 bg-gray-100 border-b-2 border-gray-200 fixed top-16 left-0 right-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="text-black hover:text-black text-xl"
          >
            &#9776;
          </button>

          <NavLink
            to="/carriers/dashboard/"
            end
            className={({ isActive }) =>
              "text-black font-semibold " +
              (isActive
                ? "border-b-2 border-blue-400 text-lg"
                : "text-gray-400 hover:text-black text-lg")
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/carriers/dashboard/view/"
            className={() =>
              "text-black font-semibold " +
              (isLoadOperationsActive
                ? "border-b-2 border-blue-400 text-lg"
                : "text-gray-500 hover:text-black text-lg")
            }
          >
            Load Operations
          </NavLink>
        </div>
        <h2
          className="font-bold text-xl flex justify-center items-center mx-auto text-green-800"
          style={{
            animation: "bounce 2s ease-in-out 2",
          }}
        >
          Welcome to Carrier Dashboard Another day to keep the economy moving
        </h2>
      </header>

      <div className="flex pt-16 mt-14">
        <div className="top-40">
          {sidebarOpen && <SidebarCarrier activeSection={activeSection} />}
        </div>
        <main className="w-full flex justify-center content-center p-5 shadow-lg overflow-y-auto">
          {location.pathname === "/carriers/dashboard/" && <CarrierOverview />}
          <Outlet />
        </main>
      </div>
    </>
  );
}

<ErrorBoundary />;