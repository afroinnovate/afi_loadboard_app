import { useState } from 'react';
import { Link, Outlet, useLoaderData, useLocation, NavLink } from "@remix-run/react";
import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import customStyles from "../styles/global.css";
import { authenticator } from "../api/services/auth.server";
import { getSession } from "../api/services/session";
import Sidebar from "../components/sidebar";
import Overview from '../components/overview';
import AccessDenied from '~/components/accessdenied';

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Carrier dashboard",
      description: "Sign up for a new account",
    },
  ];
};
export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

//protect this route with authentication
export const loader: LoaderFunction = async ({ request }) => {
  //check if the sessoon is already set
  let user = await authenticator.isAuthenticated(request, {
    // failureRedirect: "/login/",
    successRedirect: "/dashboard/",
  });
  console.log("I came to the dashboard page");
  if (user) {
    return json(user);
  }
  // if not check the session
  const session = await getSession(request.headers.get("Cookie"));

  const error = session.get("_auth_error");
  console.log("logging error", error);
  return json<any>({ error });
};

export default function Dashboard() {
  // const loaderData: any  = useLoaderData();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen); 
  const location = useLocation();
  
  const isLoadOperationsActive = location.pathname.startsWith('/dashboard/loads/');

  const loaderData = {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMjhlODJhYy1lZDFhLTQ3YTYtODAyNy05YTZmYzBhMGVmYjkiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IlRldyIsImVtYWlsIjoidGFuZ29nYXRkZXQ3NkBnbWFpbC5jb20iLCJuYW1laWQiOiIyMjhlODJhYy1lZDFhLTQ3YTYtODAyNy05YTZmYzBhMGVmYjkiLCJqdGkiOiJlMGI3MWVkYS0zYTIxLTRiNjgtYTY1ZC0wMTQxNzM1ZjZjOGYiLCJuYmYiOjE3MDY2MjM2NTIsImV4cCI6MTcwNjYyNzI1NywiaWF0IjoxNzA2NjIzNjU3LCJpc3MiOiJhZnJvaW5ub3ZhdGUuY29tIiwiYXVkIjoiYXBwLmxvYWRib2FyZC5hZnJvaW5ub3ZhdGUuY29tIn0.cZy-ARWMkcy84xcOqQTKEz4gNA4-TouNHXhArMcf-oQ",
    "isLockedOut": true,
    "requiresTwoFactor": false,
    "user": {
        "id": "228e82ac-ed1a-47a6-8027-9a6fc0a0efb9",
        "userName": "tangogatdet76@gmail.com",
        "email": "tangogatdet76@gmail.com",
        "firstName": "Tango",
        "lastName": "Tew",
        "roles": [
            "support",
            "owner_operator"
        ]
    }
}
  
  var roles: string[] = [""];
  // console.log("dashboard logging loader data", loaderData.user);
  
  if (loaderData?.user?.roles) {
    const user = loaderData.user;
    roles = user.roles.map((role: string) => role.toLowerCase());
  }

  // Check if user has 'support', 'admin' or any role containing 'carrier'
  const hasAccess = roles.includes('support') || roles.includes('admin') || roles.some(role => role.includes('carrier'));
  // check if the user is authorized to access this page
  if (!hasAccess) {
   return <AccessDenied returnUrl = "/"/>
  }else {
    return (
      <>
        <header className="w-full flex justify-between items-center py-4 px-8 bg-gray-100 border-b-2 border-gray-200">
          <div className="flex items-center space-x-4">
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
          <div className="">
            {sidebarOpen && <Sidebar />}
          </div>
          <main className='w-full flex justify-center content-center p-5 shadow-lg overscroll-y-auto'>
            { location.pathname === '/dashboard/' && <Overview /> }
            <Outlet />
          </main>
        </div>
      </>
    );
  }
}
