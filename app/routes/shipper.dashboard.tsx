import { useState } from "react";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  NavLink,
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
import SidebarShipper from "~/components/sidebarShipper";
import ShipperOverview from "~/components/shipperOverview";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Shipper dashboard",
      description: "Dashboard for shippers",
    },
  ];
};
export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

// const userData: LoginResponse = {
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZTJmMzJhZC1jNzc4LTQ3OWEtYjcyMi04OGU0MjdjM2I2ZmQiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IlRldyIsImVtYWlsIjoidGFuZ29nYXRkZXQ3NkBnbWFpbC5jb20iLCJuYW1laWQiOiJhZTJmMzJhZC1jNzc4LTQ3OWEtYjcyMi04OGU0MjdjM2I2ZmQiLCJqdGkiOiI5ZDVkNDk2My1hNTk2LTQ5ZWQtOWJkNi03NzEyNjVhZGI1NjAiLCJuYmYiOjE3MDgyOTk1NTQsImV4cCI6MTcwODMwMzE1OSwiaWF0IjoxNzA4Mjk5NTU5LCJpc3MiOiJhZnJvaW5ub3ZhdGUuY29tIiwiYXVkIjoiYXBwLmxvYWRib2FyZC5hZnJvaW5ub3ZhdGUuY29tIn0.Ad-RhvuqqxT2CjdHReocKwmSDWpMISIPVbcFHhaAK7s",
//     "tokenType": "Bearer",
//     "refreshToken": "eyJhbGci",
//     "expiresIn": 3600,
//     "user": {
//       "id": "17a86392-4f6b-4662-9ba0-01d6970cf267",
//       "userName": "tangotew@gmail.com",
//       "email": "tangotew@gmail.com",
//       "firstName": "Tango",
//       "lastName": "Tew",
//       "roles": [
//           "owner_operator"
//       ]
//   }
// };

//protect this route with authentication
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  // check if the sessoon is already set
  let response: any = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login/",
    // successRedirect: "/dashboard/shipper/", //for testing locally
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

  // return json(userData)
  const error = session.get("_auth_error");
  return json<any>({ error });
};

export default function ShipperDashboard() {
  const loaderData: any = useLoaderData();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const location = useLocation();

  const isLoadOperationsActive =
    location.pathname.startsWith("/dashboard/loads/");

  var roles: string[] = [""];

  if (loaderData?.user?.roles) {
    const user = loaderData.user;
    roles = user.roles.map((role: string) => role.toLowerCase());
  }

  console.log("roles", roles);
  // Determine the active section based on the URL
  const activeSection = location.pathname.split("/")[2] || "home";
  // Check if user has 'support', 'admin' or any role containing 'shipper'
  const hasAccess =
    roles.includes("support") ||
    roles.includes("admin") ||
    roles.some((role) => role.includes("carrier"));
  const shipperAccess =
    roles.includes("shipper") ||
    roles.includes("admin") ||
    roles.some((role) => role.includes("owner_operator")) ||
    roles.some((role) => role.includes("dispatcher")) ||
    roles.some((role) => role.includes("company_driver")) ||
    roles.some((role) => role.includes("fleet_owner"));

  // check if the user is authorized to access this page
  if (!shipperAccess && !hasAccess) {
    console.log("No access");
    return (
      <AccessDenied
        returnUrl="/"
        message="You do not have an access to the shipper dashboard"
      />
    );
  } else if (hasAccess && !shipperAccess) {
    console.log("redirecting to carrier dashboard");
    return redirect("/dashboard/");
  } else {
    return (
      <>
        <header className="w-full flex justify-between items-center py-4 px-8 bg-gray-100 border-b-2 border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="text-black hover:text-black mr-4 text-4xl"
            >
              {/* Replace with an appropriate icon or text */}
              &#9776;
            </button>
            <NavLink
              to="/shipper/dashboard/"
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
              to="/shipper/dashboard/view/"
              className={() =>
                "text-black font-semibold " +
                (isLoadOperationsActive
                  ? "border-b-2 border-blue-400"
                  : "text-gray-500 hover:text-black")
              }
            >
              Load Operations
            </NavLink>
          </div>
          <Link
            to="/shipper/dashboard/help"
            className="text-gray-500 hover:text-black px-4 py-2 rounded hover:border-b-2 hover:border-blue-400"
          >
            Help
          </Link>
        </header>
        <div className="flex">
          <div className="">
            {sidebarOpen && <SidebarShipper activeSection={activeSection} />}
          </div>
          <main className="w-full flex justify-center content-center p-5 shadow-lg">
            {location.pathname === "/shipper/dashboard/" && <ShipperOverview />}
            <Outlet />
          </main>
        </div>
      </>
    );
  }
}
