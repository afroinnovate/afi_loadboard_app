import { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  NavLink,
  useNavigate,
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
  //   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxN2E4NjM5Mi00ZjZiLTQ2NjItOWJhMC0wMWQ2OTcwY2YyNjciLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IlRldyIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiMTdhODYzOTItNGY2Yi00NjYyLTliYTAtMDFkNjk3MGNmMjY3IiwianRpIjoiMzQxY2EzMjYtMzdiNS00NTRhLTkwMWEtZDBkNTFlZTU1MzM0IiwibmJmIjoxNzEwNjE0NzkyLCJleHAiOjE3MTA2MTgzOTcsImlhdCI6MTcxMDYxNDc5NywiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.NThAHoItJRv6NhQcIlI2W2MY5AMOmCy1SITOCtYh660",
  //   "tokenType": "Bearer",
  //   "refreshToken": "eyJhbGci",
  //   "expiresIn": 3600,
  //   "user": {
    //       "id": "17a86392-4f6b-4662-9ba0-01d6970cf267",
    //       "userName": "tangotew@gmail.com",
    //       "email": "tangotew@gmail.com",
    //       "firstName": "Tango",
//       "lastName": "Tew",
//       "roles": [
//         "owner_operator"
//       ]
// }
// };

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
  const shipperHasAccess =
    roles.includes("support") ||
    roles.includes("admin") ||
    roles.some((role) => role.includes("carrier")
  );
  const carrierAccess =
    roles.includes("shipper") ||
    roles.includes("admin") ||
    roles.some((role) => role.includes("owner_operator")) ||
    roles.some((role) => role.includes("dispatcher")) ||
    roles.some((role) => role.includes("company_driver")) ||
    roles.some((role) => role.includes("fleet_owner")
  );
  
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
  
  // check if the user is authorized to access this page
  if (!carrierAccess && !shipperHasAccess) {
    console.log("No access");
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have an access to the carrier dashboard"
      />
    );
  } else if (shipperHasAccess && !carrierAccess) {
    useEffect(() => {
      if (shipperHasAccess && !carrierAccess) {
          console.log("redirecting to carrier dashboard");
          navigate('/dashboard');
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
