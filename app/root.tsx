
import { type LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useMatches
} from "@remix-run/react";
import rootStyle from './tailwindcss.css';
import Header from "./components/headers";

export const links: LinksFunction = () => [
  ...(rootStyle ? [{ rel: "stylesheet", href: rootStyle }, ] : []),
];

export default function App() {
  let user: any = {};
  const matches = useMatches();

  // Find the parent route match containing the user and token
  const parentMatch = matches.find(match => match.pathname === '/dashboard');
  const parentData: any = parentMatch?.data;
  user = parentData?.user;

  if (!user) {
    user={}
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
        <Header user={user.user} />
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


