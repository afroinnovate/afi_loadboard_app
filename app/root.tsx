import React, { useState, useEffect } from "react";
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

    let timeZone = session.get("timeZone") || "UTC";
    const url = new URL(request.url);
    const timeZoneParam = url.searchParams.get("timeZone");

    if (timeZoneParam && timeZoneParam !== timeZone) {
      timeZone = timeZoneParam;
      session.set("timeZone", timeZone);
    }

    return json({ user, timeZone });
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
  const [theme, setTheme] = useState('light'); // Default to light theme
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  let timezone = loaderData?.timeZone;
  let user = loaderData?.user;
  if (loaderData === "/" || location.pathname === "/") {
    user = null;
  } else {
    user = loaderData?.user;
  }

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (documentHeight - (scrollPosition + windowHeight) < 100) {
        setIsFooterVisible(true);
      } else {
        setIsFooterVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const themeClasses = {
    html: theme === "dark" ? "bg-gray-900" : "bg-white", // Changed from bg-green-50 to bg-white
    body: theme === "dark" ? "text-white" : "text-gray-900", // Changed text color to gray-900 for better contrast
    footer:
      theme === "dark"
        ? "bg-gray-800 text-gray-300"
        : "bg-gray-100 text-gray-800", // Changed footer background to gray-100
    link: theme === "dark" ? "hover:text-orange-400" : "hover:text-green-600",
  };

  return (
    <html lang="en" className={`h-full ${themeClasses.html}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={`h-full ${themeClasses.body}`}>
        <div className="max-h-screen flex flex-col">
          <Header user={user} theme={theme} toggleTheme={toggleTheme} timezone={timezone} />
          <main className="flex-grow">
            <Outlet context={{ theme, timezone, toggleTheme }} />
          </main>
          <footer
            className={`${
              themeClasses.footer
            } py-6 fixed bottom-0 right-0 left-0 transition-transform duration-300 ease-in-out ${
              isFooterVisible ? "translate-y-0" : "translate-y-full"
            } hidden md:block`}
            onMouseEnter={() => setIsFooterVisible(true)}
            onMouseLeave={() => setIsFooterVisible(false)}
          >
            <div className="container mx-auto text-center">
              <nav className="flex justify-center space-x-4">
                <Link to="/features" className={themeClasses.link}>
                  Features
                </Link>
                <Link to="/how-it-works" className={themeClasses.link}>
                  How It Works
                </Link>
                <Link to="/pricing" className={themeClasses.link}>
                  Pricing
                </Link>
                <Link to="/contact" className={themeClasses.link}>
                  Contacts
                </Link>
              </nav>
              <p className="mt-4">
                © 2024 AfroInnovate LoadBoard. All rights reserved.
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