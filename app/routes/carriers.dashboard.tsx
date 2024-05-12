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
import { LoginResponse } from "~/api/models/loginResponse";
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

// const userData: LoginResponse = {
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YzEzNGVmMC1lZmY4LTQ2NmUtOTU1ZS1lMTk1NzAwZDg2OTYiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IldhciIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiN2MxMzRlZjAtZWZmOC00NjZlLTk1NWUtZTE5NTcwMGQ4Njk2IiwianRpIjoiZTliMzZiNzktZGY5My00MTdlLWE4MmQtMDZiODk4MTYzOTliIiwibmJmIjoxNzE1MzQyMzE2LCJleHAiOjE3MTUzNDU5MjEsImlhdCI6MTcxNTM0MjMyMSwiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.1l-Ci6yjw3AEaupZi4-MnyGj22mqNacd6W4jCFafQjo",
//   "tokenType": "Bearer",
//   "refreshToken": "eyJhbGci",
//   "expiresIn": 3600,
//   "user": {
//     "id": "7c134ef0-eff8-466e-955e-e195700d8696",
//     "userName": "tangotew@gmail.com",
//     "email": "tangotew@gmail.com",
//     "firstName": "Tango",
//     "lastName": "War",
//     "roles": [
//         "carrier"
//     ],
//     "phoneNumber": "+15806471212"
//   }
// }

//protect this route with authentication
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  // check if the sessoon is already set
  let response: any = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login/",
  // successRedirect: "/carriers/dashboard/", //for testing locally
  });

  if (response) {
    // Store the token in the session
    session.set("user", response);
        
    return json(response, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // return json(userData);

  const error = session.get("_auth_error");
  return json<any>({ error });
};

export default function CarrierDashboard() {
  const loaderData: any = useLoaderData();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const location = useLocation();
  const navigate = useNavigate();

  const isLoadOperationsActive = location.pathname.startsWith("/dashboard/loads/");

  var roles: string[] = [""];

  if (loaderData?.user?.roles) {
    const user = loaderData.user;
    roles = user.roles.map((role: string) => role.toLowerCase());
  }

  // Determine the active section based on the URL
  const activeSection = location.pathname.split("/")[2] || "home";
  // Check if user has 'support', 'admin' or any role containing 'carrier'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
 
  const [shipperAccess, shipperHasAccess, adminAccess, carrierAccess, carrierHasAccess] = checkUserRole(roles);

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
    if ((shipperHasAccess || shipperAccess) && (!carrierHasAccess && !carrierAccess)) {
      navigate("/dashboard/");
    } 
    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);

  }, [carrierAccess, carrierHasAccess, navigate, shipperAccess, shipperHasAccess]); // Empty dependency array ensures this runs once on mount
  
  // check if the user is authorized to access this page
  if (!carrierAccess && !shipperAccess && !adminAccess) {
    console.log("No access");
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have an access to the carrier dashboard"
      />
    );
  } else if (shipperAccess && !carrierAccess) {
    useEffect(() => {
      if (adminAccess && !carrierAccess) {
          console.log("redirecting to shipper dashboard");
          navigate('/dashboard/');
      }
  }, []);
    // return redirect("/dashboard/");
  } else { 
    // If the carrier logged in 
    return (
      <>
        {/* Desktop view on setup  */}
        
        <header className="hidden lg:flex justify-between items-center py-4 px-8 bg-gray-100 border-b-2 border-gray-200 lg:w-auto md:w-auto">
          { !isMenuOpen && (
            <header className="w-full lg:hidden flex justify-between items-center py-4 px-8 bg-gray-100 border-b-2 border-gray-200">
              <div className="flex items-center space-x-4">
                <NavLink
                  to="/carriers/dashboard/"
                  end
                  className={({ isActive }) =>
                    "text-black font-semibold " +
                    (isActive
                      ? "border-b-2 border-blue-400 sm:text-4xl"
                      : "text-gray-400 hover:text-black sm:text")
                  }
                >
                  Home
                </NavLink>

                <NavLink
                  to="/carriers/dashboard/view/"
                  className={() =>
                    "text-black font-semibold " +
                    (isLoadOperationsActive
                      ? "border-b-2 border-blue-400 sm:text-4xl"
                      : "text-gray-500 hover:text-black sm:text")
                  }
                >
                  Load Operations
                </NavLink>
              </div>
              <Link
                to="/carriers/dashboard/help"
                className="text-gray-500 hover:text-black px-4 py-2 rounded hover:border-b-2 hover:border-blue-400 sm:text-4xl"
              >
                Help
              </Link>
            </header>
          )}
    
          <div className="flex items-center space-x-4 ">
            <button
              onClick={toggleSidebar}
              className="text-black hover:text-black text-3xl sm:text-4xl"
            >
              {/* Replace with an appropriate icon or text */}
              &#9776;
            </button>

            <NavLink
              to="/carriers/dashboard/"
              end
              className={({ isActive }) =>
                "text-black font-semibold " +
                (isActive
                  ? "border-b-2 border-blue-400 sm:text-4xl"
                  : "text-gray-400 hover:text-black sm:text-4xl")
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/carriers/dashboard/view/"
              className={() =>
                "text-black font-semibold " +
                (isLoadOperationsActive
                  ? "border-b-2 border-blue-400 sm:text-4xl"
                  : "text-gray-500 hover:text-black sm:text-4xl")
              }
            >
              Load Operations
            </NavLink>
          </div>
          <Link                                                                                                                                                                                        
            to="/carriers/dashboard/help"
            className="text-gray-500 hover:text-black px-4 py-2 rounded hover:border-b-2 hover:border-blue-400 sm:text-4xl"
          >
            Help
          </Link>
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
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorDisplay error={error} />;
}