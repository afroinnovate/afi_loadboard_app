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
import { FaEnvelope, FaPhone, FaTwitter, FaFacebook, FaLinkedin } from 'react-icons/fa';

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
  const [theme, setTheme] = useState('dark'); // Default to light theme
  const [isFooterVisible, setIsFooterVisible] = useState(true);

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
    html: theme === "dark" ? "bg-gray-900" : "bg-white",
    body: theme === "dark" ? "text-white" : "text-gray-900",
    footer:
      theme === "dark"
        ? "bg-gray-800 text-gray-300"
        : "bg-gray-100 text-gray-800",
    link: theme === "dark" ? "hover:text-orange-400" : "hover:text-green-600",
  };

  const isHomePage = location.pathname === "/";

  return (
    <html lang="en" className={`h-full ${themeClasses.html}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={`h-full ${themeClasses.body}`}>
        <div className="flex flex-col min-h-screen">
          <Header 
            user={user} 
            theme={theme} 
            toggleTheme={toggleTheme} 
            timezone={timezone}
          />
          <main className="flex-grow pt-16 md:pt-20">
            <Outlet context={{ theme, timezone, toggleTheme }} />
          </main>
          {isHomePage && (
            <footer
              className={`${themeClasses.footer} py-2 fixed bottom-0 right-0 w-auto transition-transform duration-300 ease-in-out ${
                isFooterVisible ? "translate-x-0" : "translate-x-full"
              } hidden md:block rounded-tl-lg shadow-lg`}
              onMouseEnter={() => setIsFooterVisible(true)}
              onMouseLeave={() => setIsFooterVisible(false)}
            >
              <div className="px-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <a href="mailto:afroinnovate@gmail.com" className={`${themeClasses.link} flex items-center text-sm`}>
                    <FaEnvelope className="mr-2" /> afroinnovate@gmail.com
                  </a>
                  <a href="tel:+251915121312" className={`${themeClasses.link} flex items-center text-sm ml-4`}>
                    <FaPhone className="mr-2" /> +251 915 121 312
                  </a>
                </div>
                <div className="flex justify-center space-x-4 mb-2">
                  <a href="https://twitter.com/afroinnovate" target="_blank" rel="noopener noreferrer" className={`${themeClasses.link} hover:opacity-75 transition-opacity`}>
                    <FaTwitter size={18} />
                  </a>
                  <a href="https://facebook.com/afroinnovate" target="_blank" rel="noopener noreferrer" className={`${themeClasses.link} hover:opacity-75 transition-opacity`}>
                    <FaFacebook size={18} />
                  </a>
                  <a href="https://linkedin.com/company/afroinnovate" target="_blank" rel="noopener noreferrer" className={`${themeClasses.link} hover:opacity-75 transition-opacity`}>
                    <FaLinkedin size={18} />
                  </a>
                </div>
                <p className="text-xs text-center">
                  © 2024 AfroInnovate LoadBoard
                </p>
              </div>
            </footer>
          )}
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

<ErrorBoundary />;
