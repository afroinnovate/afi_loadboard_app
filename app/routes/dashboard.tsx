import { useState } from "react";
import {
  Outlet,
  useLoaderData,
  useLocation,
  NavLink,
  useNavigate,
  useRouteError,
  isRouteErrorResponse,
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
import { checkUserRole } from "~/components/checkroles";
import { redirectUser } from "~/components/redirectUser";
import ErrorDisplay from "~/components/ErrorDisplay";

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

//protect this route with authentication
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);

    const session_expiration: any = process.env.SESSION_EXPIRATION;
    const EXPIRES_IN = parseInt(session_expiration) * 1000; // Convert seconds to milliseconds
    if (isNaN(EXPIRES_IN)) {
      throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
    }

    if (!user) {
      return redirect("/login/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    const expires = new Date(Date.now() + EXPIRES_IN);

    // Redirect to the appropriate dashboard based on the user role
    const shipperDashboard = await redirectUser(user?.user);
    if (!shipperDashboard) {
      return redirect("/carriers/dashboard/", {
        headers: {
          "Set-Cookie": await commitSession(session, { expires }),
        },
      });
    }

    return json(user, {
      headers: {
        "Set-Cookie": await commitSession(session, { expires }),
      },
    });
  } catch (error: any) {
    if (JSON.parse(error).data.status == 401) {
      return redirect("/login/");
    }
    throw error;
  }
};

export default function Dashboard() {
  const loaderData: any = useLoaderData();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const location = useLocation();

  const isLoadOperationsActive =
    location.pathname.startsWith("/dashboard/loads/");

  var user: {} = {};

  if (loaderData?.user) {
    user = loaderData.user;
  }

  // Determine the active section based on the URL
  const activeSection = location.pathname.split("/")[2] || "home";

  // User roles and permission checks
  const [
    shipperAccess,
    shipperHasAccess,
    adminAccess,
    carrierAccess,
    carrierHasAccess,
  ] = checkUserRole(user?.roles);

  if (
    !shipperHasAccess &&
    !shipperAccess &&
    !carrierHasAccess &&
    !adminAccess &&
    !carrierAccess
  ) {
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
          <button
            onClick={toggleSidebar}
            className="text-black hover:text-black mr-4 text-4xl"
          >
            {/* Replace with an appropriate icon or text */}
            &#9776;
          </button>
          <NavLink
            to="/dashboard/"
            end
            className={({ isActive }) =>
              "text-black font-semibold " +
              (isActive
                ? "border-b-2 border-blue-400"
                : "text-gray-400 hover:text-black")
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/dashboard/loads/view/"
            className={() =>
              "text-black font-semibold " +
              (isLoadOperationsActive
                ? "border-b-2 border-blue-400"
                : "text-gray-500 hover:text-black")
            }
          >
            Load Operations
          </NavLink>

          <h2
            className="font-bold text-xl flex justify-center items-center mx-auto text-green-800"
            style={{
              animation: "bounce 2s ease-in-out 2",
            }}
          >
            Welcome to Shipper Dashboard!!! Let's Keep them Moving...
          </h2>
        </div>
      </header>
      <div className="flex">
        <div className="hidden lg:flex">
          {sidebarOpen && <Sidebar activeSection={activeSection} />}
        </div>
        <main className="w-full flex justify-center content-center p-3 shadow-lg">
          {location.pathname === "/dashboard/" && <Overview />}
          <Outlet />
        </main>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  const errorResponse: any = useRouteError();
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
