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

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Carrier dashboard",
      description: "Dashboard for carriers",
    },
  ];
};
export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

// const userData: LoginResponse = {
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxN2E4NjM5Mi00ZjZiLTQ2NjItOWJhMC0wMWQ2OTcwY2YyNjciLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IlRldyIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiMTdhODYzOTItNGY2Yi00NjYyLTliYTAtMDFkNjk3MGNmMjY3IiwianRpIjoiYmMzYjFjZDgtYTYyZi00YzZkLTlkM2UtNGY1ZTgxMWI5MjEzIiwibmJmIjoxNzA5OTU3MDg0LCJleHAiOjE3MDk5NjA2ODksImlhdCI6MTcwOTk1NzA4OSwiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.c_ZmgpbIsoFLczmLPVhv6tlE6WNvHIV7w-XpAGzeO8M",
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
//           // "owner_operator"
//           "carrier"
//       ]
//   }
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
  
  var roles: string[] = [""];

  if (loaderData?.user?.roles) {
    const user = loaderData.user;
    roles = user.roles.map((role: string) => role.toLowerCase());
  }

  // Determine the active section based on the URL
  const activeSection = location.pathname.split('/')[2] || 'home';
  // Check if user has 'support', 'admin' or any role containing 'carrier'
  const hasAccess = roles.includes('support') || roles.includes('admin') || roles.some(role => role.includes('carrier'));
  const shipperAccess = roles.includes('shipper') || roles.includes('admin') || roles.includes('owner_operator') 
                        roles.includes('dispatcher') || 
                        roles.includes('company_driver') ||
                        roles.includes('fleet_owner');

  // check if the user is authorized to access this page
  if (!hasAccess && !shipperAccess) {
   return <AccessDenied returnUrl = "/" message="You do not have an access to the carrier dashboard"/>
  }else if(shipperAccess){
    console.log('redirecting to shipper dashboard');
    useEffect(() => {
      
          console.log("redirecting to carrier dashboard");
          navigate('/shipper/dashboard/');
      
  }, []);
    // return redirect('/shipper/dashboard/');
  }else {
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
}
