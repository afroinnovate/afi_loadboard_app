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
    failureRedirect: "/login/",
  });
  console.log("I came to the dashboard page");
  if (user) {
    return json(user.user);
  }
  // if not check the session
  const session = await getSession(request.headers.get("Cookie"));

  const error = session.get("_auth_error");
  console.log("logging error", error);
  return json<any>({ error });
};

export default function Dashboard() {
  const loaderData: any  = useLoaderData();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen); 
  const location = useLocation();
  
  const isLoadOperationsActive = location.pathname.startsWith('/dashboard/loads/');
  const user = loaderData.user;
  // const user: any = {
  //   "id": "228e82ac-ed1a-47a6-8027-9a6fc0a0efb9",
  //   "userName": "tangogatdet76@gmail.com",
  //   "email": "tangogatdet76@gmail.com",
  //   "firstName": "Tango",
  //   "lastName": "Tew",
  //   "roles": [
  //       "OWNER_OPERATOR",
  //       "owner_operator"
  //   ]
  // }

  const roles = user.roles.map((role: string) => role.toLowerCase());

  // Check if user has 'support', 'admin' or any role containing 'carrier'
  const hasAccess = roles.includes('support') || roles.includes('admin') || roles.some(role => role.includes('carrier'));


  console.log("dashboard logging loader data", user);
  if (!hasAccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-lg sm:px-10 max-w-2xl">
          <h1 className="text-center text-2xl font-extrabold text-red-700 py-4">
            Access Denied!
          </h1>
          <p className="text-center text-gray-700 mb-4 italic">
            You do not have access to carrier dashboard.
          </p>
          <div className="flex justify-center">
            <Link to="/" className="primary-action">
              Go Back Home 
            </Link>
          </div>
        </div>
      </div>
    );
  }else {
    return (
      <>
        <header className="flex justify-between items-center py-4 px-8 bg-gray-100 border-b-2 border-gray-200">
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
          {sidebarOpen && <Sidebar />}
          <main className='flex-1 justify-center content-center p-5 shadow-lg'>
            { location.pathname === '/dashboard/' && (
              <Overview />
            )}
            <Outlet />
          </main>
        </div>
      </>
    );
  }
}
