
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "@remix-run/react";
import rootStyle from './tailwindcss.css';

export const links: LinksFunction = () => [
  ...(rootStyle ? [{ rel: "stylesheet", href: rootStyle }, ] : []),
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="h-12 w-screen bg-gray-400 font-serif leading-1 p-8 ">
          <nav className="header">
            <Link to="/" className="nav-link">AFI Load Board</Link>
            <div>
              <Link to="/features" className="nav-link">Features</Link>
              <Link to="/how-it-works" className="nav-link">How It Works</Link>
              <Link to="/pricing" className="nav-link">Pricing</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
              <Link to="/signup/carrier" className="nav-link sign-up-button hover:bg-blue-700 hover:shadow-2xl hover:scale-50">Sign Up</Link>
            </div>
          </nav>
        </div>
        {/* Setup the Content Section into a grid of 3 columns */}
        <div className="grid grid-col-6 gap-4">
          <div className="col-span-1 col-start-0 col-end-1 bg-gray-100">
            <span />
          </div>
          <div className="col-span-2 col-start-1 col-end-4 shadow-sm py-10 bg-gray-200">
            <ScrollRestoration />
            <Outlet />
          </div>
          <div className="col-span-1 col-start-4 col-end-5 fill-slate-600 bg-gray-100">
            <span />
          </div>
        </div>
        <Scripts />
        <LiveReload />
      </body>
      <footer className="footer">
        <p>© 2023 AfroInnovate LoadBoard. All rights reserved.</p>
      </footer>
    </html>
  );
}
