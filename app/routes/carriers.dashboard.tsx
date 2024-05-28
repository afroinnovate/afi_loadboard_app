import { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  NavLink,
  useNavigate,
  useCatch,
  useRouteError,
  Form,
  isRouteErrorResponse,
} from "@remix-run/react";

import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import customStyles from "../styles/global.css";
import { authenticator } from "../api/services/auth.server";
import { commitSession, getSession } from "../api/services/session";
import AccessDenied from "~/components/accessdenied";
import SidebarCarrier from "~/components/sidebarCarrier";
import CarrierOverview from "~/components/carrierOverview";
import { checkUserRole } from "~/components/checkroles";
import ErrorDisplay from "~/components/ErrorDisplay";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Carrier dashboard",
      description: "Dashboard for carrierss",
    },
  ];
};
export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

const userData: LoginResponse = {
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YzEzNGVmMC1lZmY4LTQ2NmUtOTU1ZS1lMTk1NzAwZDg2OTYiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IldhciIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiN2MxMzRlZjAtZWZmOC00NjZlLTk1NWUtZTE5NTcwMGQ4Njk2IiwianRpIjoiYmJmNmZhOTEtOTljYy00NzAxLWJkZWUtNWRkMWY3MWJhZTdmIiwibmJmIjoxNzE1ODYwMTMwLCJleHAiOjE3MTU4NjM3MzUsImlhdCI6MTcxNTg2MDEzNSwiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.m24wLWyItr-658y3ewUgh1rex8hOjvbxM_MCDeodp9s",
  tokenType: "Bearer",
  refreshToken: "eyJhbGci",
  expiresIn: 3600,
  user: {
    id: "7c134ef0-eff8-466e-955e-e195700d8696",
    userName: "tangotew@gmail.com",
    email: "tangotew@gmail.com",
    firstName: "Tango",
    lastName: "War",
    roles: ["carrier"],
    phoneNumber: "+15806471212",
  },
};

// protect this route with authentication
export const loader: LoaderFunction = async ({ request }) => {
  try {
  //   const session = await getSession(request.headers.get("Cookie"));

  //   // check if the sessoon is already set
  //   let response: any = await authenticator.isAuthenticated(request, {
  //     failureRedirect: "/login/",
  //     // successRedirect: "/carriers/dashboard/", //for testing locally
  //   });

  //   if (response) {
  //     // Store the token in the session
  //     session.set("user", response);

  //     return json(response, {
  //       headers: {
  //         "Set-Cookie": await commitSession(session),
  //       },
  //     });
  //   }

    return json(userData);

    // const error = session.get("_auth_error");
    // throw error;
  } catch (error: any) {
    // if it's not 401, throw the error
    throw error;
  }
};

export default function CarrierDashboard() {
  const loaderData: any = useLoaderData();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const location = useLocation();
  const navigate = useNavigate();

  const user = loaderData?.user.user;
  console.log("User", user);
  const isLoadOperationsActive = location.pathname.startsWith(
    "/carriers/dashboard/view/"
  );
  const roles: string[] =
    loaderData?.user?.roles.map((role: string) => role.toLowerCase()) || [];
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Determine the active section based on the URL
  const activeSection = location.pathname.split("/")[2] || "home";
  // Check if user has 'support', 'admin' or any role containing 'carrier'
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [
    shipperAccess,
    shipperHasAccess,
    adminAccess,
    carrierAccess,
    carrierHasAccess,
  ] = checkUserRole(roles);

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
    if (
      (shipperHasAccess || shipperAccess) &&
      !carrierHasAccess &&
      !carrierAccess
    ) {
      navigate("/dashboard/");
    }
    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, [
    carrierAccess,
    carrierHasAccess,
    navigate,
    shipperAccess,
    shipperHasAccess,
  ]); // Empty dependency array ensures this runs once on mount

  // Navigate away if unauthorized
  useEffect(() => {
    if (
      (shipperHasAccess || shipperAccess) &&
      !carrierHasAccess &&
      !carrierAccess
    ) {
      navigate("/dashboard/");
    }
  }, [
    shipperHasAccess,
    carrierHasAccess,
    shipperAccess,
    carrierAccess,
    navigate,
  ]);

  // check if the user is authorized to access this page
  if (!carrierAccess && !shipperAccess && !adminAccess) {
    console.log("No access");
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have an access to the carrier dashboard"
      />
    );
  }
  // If the carrier logged in
  return (
    <>
      {/* Desktop view on setup  */}
      <header className="hidden lg:flex justify-between items-center py-4 px-8 bg-gray-100 border-b-2 border-gray-200 lg:w-auto md:w-auto">
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
        <h2 className="font-bold text-xl flex justify-center items-center mx-auto text-green-800"
          style={{
            animation: 'bounce 2s ease-in-out 2',
          }}>
          Welcome to Carrier Dashboard Another day to keep the economy moving
        </h2>
      </header>

      <div className="flex">
        <div className="">
          {sidebarOpen && <SidebarCarrier activeSection={activeSection} />}
        </div>
        <main className="w-full flex justify-center content-center p-5 shadow-lg">
          {location.pathname === "/carriers/dashboard/" && <CarrierOverview />}
          <Outlet />
        </main>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  const errorResponse: any = useRouteError();
  console.log("Error response", errorResponse);
  if (isRouteErrorResponse(errorResponse)) {
    // const jsonError = JSON.parse(errorResponse);
    const error = {
      message: errorResponse.data.message,
      status: errorResponse.data.status,
    };

    return <ErrorDisplay error={error} />;
  }
  return (
    <div className="flex content-center bg-red-800 text-white">
      <h1>Uh oh ...</h1>
      <p>Something went wrong.</p>
      <pre>{errorResponse}</pre>
    </div>
  );
}
