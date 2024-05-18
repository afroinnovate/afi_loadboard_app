
import { type LinksFunction, type LoaderFunction, json, type MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useLoaderData,
  useLocation,
  useRouteError,
} from "@remix-run/react";
import rootStyle from './tailwindcss.css';
import Header from "./components/headers";
import ErrorDisplay from "./components/ErrorDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { getSession } from "./api/services/session";

const userData = {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YzEzNGVmMC1lZmY4LTQ2NmUtOTU1ZS1lMTk1NzAwZDg2OTYiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IldhciIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiN2MxMzRlZjAtZWZmOC00NjZlLTk1NWUtZTE5NTcwMGQ4Njk2IiwianRpIjoiYmJmNmZhOTEtOTljYy00NzAxLWJkZWUtNWRkMWY3MWJhZTdmIiwibmJmIjoxNzE1ODYwMTMwLCJleHAiOjE3MTU4NjM3MzUsImlhdCI6MTcxNTg2MDEzNSwiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.m24wLWyItr-658y3ewUgh1rex8hOjvbxM_MCDeodp9s",
  "tokenType": "Bearer",
  "refreshToken": "eyJhbGci",
  "expiresIn": 3600,
  "user": {
    "id": "7c134ef0-eff8-466e-955e-e195700d8696",
    "userName": "tangotew@gmail.com",
    "email": "tangotew@gmail.com",
    "firstName": "Tango",
    "lastName": "War",
    "roles": [
        "carrier"
    ],
    "phoneNumber": "+15806471212"
  }
};

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Home",
      description: "Home page for Loadboard.",
    },
  ];
};

export const links: LinksFunction = () => [
  ...(rootStyle ? [{ rel: "stylesheet", href: rootStyle }, ] : []),
];


export const loader: LoaderFunction = async ({ request }) => {
  try{
    // var session = await getSession(request.headers.get("Cookie"));
    // const user = session.get("user");
    const user: any = userData;
    if (!user) {
      throw JSON.stringify({
          data: {
            message: "Unauthorized",
            status: 401,
          },
        })
    }
    return json({ user });
  } catch (e: any) {
    if(JSON.parse(e).data.status === 401){
      return "/";
    }
    throw e;
  }
}

export default function App() {  
  const loaderData: any = useLoaderData();
  const locations = useLocation();
  let user = null;
  if(loaderData === "/" || locations.pathname === "/"){
    user = null;
  }else{
    user = loaderData?.user;
  }
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <header className="top-0 left-0 right-0 z-10 bg-gray-100 border-b-2 border-gray-200">
        <Header user={ user } />
      </header>
      <body>
        <div className="">
          <Outlet />
          <ScrollRestoration />
          <Scripts />
        </div>
        <Scripts />
        <LiveReload />
      </body>
      <footer className="footer bg-gray-400 shadow-inner">
        <div className="flex justify-center items-center">
          <nav className="flex space-x-4 mt-0">
            <Link to="/features" className="footer-link underline hover:text-blue-600">Features</Link>
            <Link to="/how-it-works" className="footer-link underline hover:text-blue-600">How It Works</Link>
            <Link to="/pricing" className="footer-link underline hover:text-blue-600">Pricing</Link>
            <Link to="/contact" className="footer-link underline hover:text-blue-600">Contacts</Link>
          </nav>
        </div>
        <p className="text-center mt-6">
          © 2023 AfroInnovate LoadBoard. All rights reserved.
        </p>
      </footer>
    </html>
  );
}

export function ErrorBoundary() {
  const errorResponse: any = useRouteError();
  const handleReload = () => {
    window.location.reload();
  };

  let error = null;

  if (typeof errorResponse === "string") {
    const parsedError = JSON.parse(errorResponse);
    error = {
      message: parsedError.data.message,
      status: parsedError.data.status,
    };
  }

  return (
    <div className="flex content-center inset-0 bg-gray-800 bg-opacity-75 justify-center items-center z-50">
      <div className="bg-white p-8 flex content-center rounded-lg max-w-md w-full mx-4 shadow-lg text-center animate-bounce animate_fadeInDown">
        {error?.message && error?.status ? (
          <ErrorDisplay error={error} />
        ) : (
          <>
            <strong className="font-bold text-red-500 text-lg">Oops!</strong>
            <p className="text-red-700 mt-2 text-sm">
              Something went wrong. Please try again or visit later.
            </p>
            <div className="mt-4">
              <button
                onClick={handleReload}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faRedo} className="mr-2" />
                Try Again
              </button>
            </div>
          </>
          )} 
      </div>
    </div>
  );
}

