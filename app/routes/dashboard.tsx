import { useEffect, useState } from 'react';
import { Link, Outlet, useLoaderData, useLocation, NavLink, useNavigate, useRouteError, isRouteErrorResponse } from "@remix-run/react";
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
import ErrorDisplay from '~/components/ErrorDisplay';

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
//   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YzEzNGVmMC1lZmY4LTQ2NmUtOTU1ZS1lMTk1NzAwZDg2OTYiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IldhciIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiN2MxMzRlZjAtZWZmOC00NjZlLTk1NWUtZTE5NTcwMGQ4Njk2IiwianRpIjoiYmJmNmZhOTEtOTljYy00NzAxLWJkZWUtNWRkMWY3MWJhZTdmIiwibmJmIjoxNzE1ODYwMTMwLCJleHAiOjE3MTU4NjM3MzUsImlhdCI6MTcxNTg2MDEzNSwiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.m24wLWyItr-658y3ewUgh1rex8hOjvbxM_MCDeodp9s",
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
const session_expires = process.env.SESSION_EXPIRATION;
const EXPIRES_IN = Number(session_expires) * 1000; // Convert seconds to milliseconds

if (isNaN(EXPIRES_IN)) {
  throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);

    if (!user) {
      return redirect("/login/");
    }

    // Refresh the session expiration time to make sure the session is alive long as the user is active.
    // const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day expiration
    const expires = new Date(Date.now() + EXPIRES_IN);

    if (user) {
      const [
        shipperAccess,
        shipperHasAccess,
        adminAccess,
        carrierAccess,
        carrierHasAccess,
      ] = checkUserRole(user.user.roles);

      if (
        user.user.roles &&
        !user.roles !== shipperAccess &&
        !user.roles !== shipperHasAccess
      ) {
        return redirect("/carriers/dashboard/", {
          headers: {
            "Set-Cookie": await commitSession(session, { expires }),
          },
        });
      }
    }

    return json(user, {
      headers: {
        "Set-Cookie": await commitSession(session, { expires }),
      },
    });
  } catch (error) {
    console.error("Error during authentication", error);
    throw error
  }
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
            
            <h2 className="font-bold text-xl flex justify-center items-center mx-auto text-green-800"
              style={{
                animation: 'bounce 2s ease-in-out 2',
              }}>
              Welcome to Shipper Dashboard!!! Let's Keep them Moving...
            </h2>
          </div>
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