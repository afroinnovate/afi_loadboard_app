import { useEffect, useState } from 'react';
import { Link, Outlet, useLoaderData, useLocation, NavLink, useNavigate } from "@remix-run/react";
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
import Overview from '../components/overview';
import AccessDenied from '~/components/accessdenied';
import { LoginResponse } from '~/api/models/loginResponse';
import { checkUserRole } from '~/components/checkroles';

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

// const userData: LoginResponse = {
//   token:
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YzEzNGVmMC1lZmY4LTQ2NmUtOTU1ZS1lMTk1NzAwZDg2OTYiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IldhciIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiN2MxMzRlZjAtZWZmOC00NjZlLTk1NWUtZTE5NTcwMGQ4Njk2IiwianRpIjoiZTliMzZiNzktZGY5My00MTdlLWE4MmQtMDZiODk4MTYzOTliIiwibmJmIjoxNzE1MzQyMzE2LCJleHAiOjE3MTUzNDU5MjEsImlhdCI6MTcxNTM0MjMyMSwiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.1l-Ci6yjw3AEaupZi4-MnyGj22mqNacd6W4jCFafQjo",
//   tokenType: "Bearer",
//   refreshToken: "eyJhbGci",
//   expiresIn: 3600,
//   user: {
//     id: "7c134ef0-eff8-466e-955e-e195700d812321",
//     userName: "tangogatdet76@gmail.com",
//     email: "tangogatdet76@gmail.com",
//     firstName: "Pal",
//     lastName: "Kuoth",
//     roles: ["shipper"],
//     phoneNumber: "+15806471212",
//   },
// };

//protect this route with authentication
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  // check if the sessoon is already set
  let response: any = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login/",
  // successRedirect: "/dashboard/", //for testing locally
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

export default function Dashboard() {
  const loaderData: any  = useLoaderData();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen); 
  const location = useLocation();
  const navigate = useNavigate();
  
  const isLoadOperationsActive = location.pathname.startsWith('/dashboard/loads/');
  
  var user: {} = {};

  if (loaderData?.user) {
    user = loaderData.user;
  }

  // Determine the active section based on the URL
  const activeSection = location.pathname.split('/')[2] || 'home';
  
  // User roles and permission checks
  const [shipperAccess, shipperHasAccess, adminAccess, carrierAccess, carrierHasAccess] = checkUserRole(user?.roles);

  console.log("Carrier Access: ", carrierAccess);

  // Navigate away if unauthorized
  useEffect(() => {
    console.log("Checking user access...");
    if ((carrierHasAccess || carrierAccess) && (!shipperHasAccess && !shipperAccess)) {
      console.log("Navigating to the dashboard");
      navigate("/carriers/dashboard/");
    } 
  }, [shipperHasAccess, carrierHasAccess, shipperAccess, carrierAccess, navigate]);

  if (!shipperHasAccess && !shipperAccess && !carrierHasAccess && !adminAccess && !carrierAccess) {
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have access to the shipper dashboard."
      />
    );
  } 
  
  return (
      <>
        {/* Desktop view setup */}
        <header className="hidden lg:flex w-full justify-between items-center py-4 px-8 bg-gray-100 border-b-2 border-gray-200">
          <div className="items-center space-x-4">
            <button onClick={toggleSidebar} className="text-black hover:text-black mr-4 text-4xl">
              {/* Replace with an appropriate icon or text */}
              &#9776;
            </button>
            <NavLink
              to="/dashboard/"
              end
              className={({ isActive }) =>
                "text-black font-semibold " + (isActive ? "border-b-2 border-blue-400" : "text-gray-400 hover:text-black")
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/dashboard/loads/view/"
              className={() =>
                "text-black font-semibold " + (isLoadOperationsActive ? "border-b-2 border-blue-400" : "text-gray-500 hover:text-black")
              }
            >
              Load Operations
            </NavLink>

          </div>
          <Link to="/dashboard/help" className="text-gray-500 hover:text-black px-4 py-2 rounded hover:border-b-2 hover:border-blue-400">
            Help
          </Link>
        </header>
        <div className="flex">
          <div className="hidden lg:flex">
            {sidebarOpen && <Sidebar activeSection={activeSection} />}
          </div>
          <main className='w-full flex justify-center content-center p-3 shadow-lg'>
            { location.pathname === '/dashboard/' && <Overview /> }
            <Outlet />
          </main>
        </div>
      </>
    );
}
