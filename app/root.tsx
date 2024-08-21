import {
  type LinksFunction,
  type LoaderFunction,
  json,
  type MetaFunction,
} from "@remix-run/node";
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
} from "@remix-run/react";
import rootStyle from "./tailwindcss.css";
import { commitSession, getSession } from "./api/services/session";
import Header from "./components/headers";
import { authenticator } from "./api/services/auth.server";
import { ErrorBoundary } from "./components/errorBoundary";

export const meta: MetaFunction = () => {
  return [
    {
      title: "AfroInnovate | Home",
      description: "Home page for AfroInnovate LoadBoard.",
    },
  ];
};

export const links: LinksFunction = () => [
  ...(rootStyle ? [{ rel: "stylesheet", href: rootStyle }] : []),
];

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);

    const session_expiration: any = process.env.SESSION_EXPIRATION;
    const EXPIRES_IN = parseInt(session_expiration) * 1000;
    if (isNaN(EXPIRES_IN)) {
      throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
    }

    if (!user) {
      return "/";
    }

    const expires = new Date(Date.now() + EXPIRES_IN);
    session.set(authenticator.sessionKey, user);
    await commitSession(session, { expires });

    return json({ user });
  } catch (e: any) {
    if (JSON.parse(e).data.status === 401) {
      return "/";
    }
    throw e;
  }
};

export default function App() {
  const loaderData: any = useLoaderData();
  const location = useLocation();
  let user = loaderData?.user;
  if (loaderData === "/" || location.pathname === "/") {
    user = null;
  } else {
    user = loaderData?.user;
  }

  return (
    <html lang="en" className="h-full bg-gray-900">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full text-white">
        <div className="min-h-screen flex flex-col">
          <Header user={user} />
          <main className="flex-grow">
            <Outlet />
          </main>
          <footer className="bg-gray-800 text-gray-300 py-6 fixed bottom-0 right-0 left-0">
            <div className="container mx-auto text-center">
              <nav className="flex justify-center space-x-4">
                <Link to="/features" className="hover:text-orange-400">
                  Features
                </Link>
                <Link to="/how-it-works" className="hover:text-orange-400">
                  How It Works
                </Link>
                <Link to="/pricing" className="hover:text-orange-400">
                  Pricing
                </Link>
                <Link to="/contact" className="hover:text-orange-400">
                  Contacts
                </Link>
              </nav>
              <p className="mt-4">
                © 2023 AfroInnovate LoadBoard. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

<ErrorBoundary />;
