
import { json, type LinksFunction, type LoaderFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useLoaderData,
} from "@remix-run/react";
import rootStyle from './tailwindcss.css';
import Header from "./components/headers";
import { authenticator } from "./api/services/auth.server";
import { getSession } from "./api/services/session";
// import { authenticator } from "./api/services/auth.server";

export const links: LinksFunction = () => [
  ...(rootStyle ? [{ rel: "stylesheet", href: rootStyle }, ] : []),
];

export const loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request, {
  });
  console.log("user-data: ", user);
  if (user) {
    return json(user.user);
  }
  // if not check the session
  const session = await getSession(request.headers.get("Cookie"));

  const error = session.get("_auth_error");
  console.log("logging error", error);
  return json<any>({ error });
};

export default function App() {
  const { user }  = useLoaderData();
  console.log("loader: ", user);
  // const user  = request.user;
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header user={user} />
        {/* <div className="h-12 w-screen bg-gray-400 font-serif leading-1 p-8 ">
          <nav className="header">
            <Link to="/" className="nav-link">AFI Load Board</Link>
            <div>
              <Link to="/signup/" className="nav-link sign-up-button hover:bg-blue-700 hover:shadow-2xl hover:scale-50">Sign Up</Link>
            </div>
          </nav>
        </div> */}
        {/* Setup the Content Section into a grid of 3 columns */}
        <div className="">
          {/* <div className="col-span-1 col-start-0 col-end-1 bg-gray-100">
            <span />
          </div> */}
          <div className="">
            <ScrollRestoration />
            <Outlet />
          </div>
          {/* <div className="col-span-1 col-start-4 col-end-5 fill-slate-600 bg-gray-100">
            <span />
          </div> */}
        </div>
        <Scripts />
        <LiveReload />
      </body>
      <footer className="footer bg-gray-400">
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


