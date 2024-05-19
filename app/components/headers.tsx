import { Form, Link, redirect, useLoaderData, useLocation, useRouteError } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { XMarkIcon, Bars3Icon, UserIcon, CogIcon, LifebuoyIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/20/solid";
import getUnicodeFlagIcon from "country-flag-icons/unicode";

import CarrierHeader from "./carrierheader";
import ShipperHeader from "./shipperheader";
import ErrorDisplay from "./ErrorDisplay";


export default function Header({ user }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef();

  const isLoadOperationsActive = location.pathname === "/carriers/dashboard/view/" ||
                                 location.pathname === "/dashboard/loads/view/"
  let isAuthenticated =
    location.pathname.startsWith("/dashboard/") ||
    location.pathname.startsWith("/carriers/dashboard/");

  // const baseUrl = location.pathname.split("/").slice(0, -1).join("/");

  const baseUrl = location.pathname == "/dashboard/" ? "/dashboard" : "/carriers/dashboard";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const userInitials = `${user?.user.firstName?.charAt(0) ?? ""}${user?.user.lastName?.charAt(0) ?? ""}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        closeSettings();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="sticky top-0 bg-white shadow-md z-20 font-apercu font-serif">
      <nav className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:flex justify-center flex-grow">
          <Link to="/" className="flex items-center">
            <img
              src=""
              alt="AFI LoadBoard"
              className="h-8 w-auto text-xl text-green-700 hover:translate-x-2 hover:translate-y-2 hover:underline hover:cursor-pointer"
            />
          </Link>
        </div>

        {location.pathname.startsWith("/carriers/dashboard") || location.pathname.startsWith("/dashboard/") ? (
          <div className="hidden lg:flex justify right space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login/"
                  className="px-3 py-2 rounded-md text-sm font-medium text-green-600 bg-white hover:bg-orange-400 hover:translate-y-1 transition duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/signup/"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-green-500 text-white hover:bg-orange-400 hover:translate-y-1 transition duration-300"
                >
                  Get Started Now
                </Link>
              </>
            ) : (
              <>
                {location.pathname === "/carriers/dashboard/" && (
                  <Link
                    to="/carriers/dashboard/view"
                    className="bg-green-500 text-white font-bold p-2 rounded hover:bg-orange-400 hover:animate-pulse"
                  >
                    PickUp Load Now
                  </Link>
                )}
                {location.pathname === "/dashboard/" && (
                  <Link
                    to="/dashboard/loads/view/"
                    className="bg-green-500 text-white font-bold p-2 rounded hover:bg-orange-400 hover:animate-pulse"
                  >
                    Manage loads
                  </Link>
                )}
                   
                <div>
                  <select
                    className="block p-2 font-bold rounded hover:bg-orange-400 text-green-800 focus:outline-none hover:cursor-pointer"
                    onChange={(e) => handleLanguageChange(e.target.value)}
                  >
                    <option value="eng" defaultChecked>
                      {getUnicodeFlagIcon("US")} eng
                    </option>
                    <option value="arb">
                      {getUnicodeFlagIcon("SA")} arabic
                    </option>
                    <option value="amh">
                      {getUnicodeFlagIcon("ET")} amharic
                    </option>
                    <option value="nus">
                      {getUnicodeFlagIcon("SS")} nuer
                    </option>
                  </select>
                </div>
                <div className="relative" ref={settingsRef}>
                  <button
                    onClick={toggleSettings}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-green-500 text-white font-bold rounded-full p-2 hover:bg-orange-400">
                      <span>{userInitials}</span>
                    </div>
                  </button>
                  {isSettingsOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                      <Link
                        to={baseUrl+"/account/profile"}
                        className="flex items-center px-4 py-2 text-green-700 hover:bg-gray-100"
                      >
                        <UserIcon className="w-5 h-5 mr-2" />
                        Account
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-green-700 hover:bg-gray-100"
                      >
                        <CogIcon className="w-5 h-5 mr-2" />
                        Settings
                      </Link>
                      <Link
                        to="#"
                        className="flex items-center px-4 py-2 text-green-700 hover:bg-gray-100"
                      >
                        <LifebuoyIcon className="w-5 h-5 mr-2" />
                        Help
                      </Link>
                      <Form action="/logout/" method="post">
                        <button
                          type="submit"
                          className="flex items-center w-full text-left px-4 py-2 text-green-700 hover:bg-gray-100"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                          Logout
                        </button>
                      </Form>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : null}

        {/* Hamburger button for mobile view */}
        {(location.pathname.startsWith("/carriers/dashboard") || location.pathname.startsWith("/dashboard/")) && (
          <button
            onClick={toggleMenu}
            aria-label="Open Menu"
            className="rounded focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-orange-500" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-green-600" />
            )}
          </button>
        )}
      </nav>

      {/* Menu overlay for mobile view */}
      {isMenuOpen && (location.pathname.startsWith("/carriers/dashboard/") || location.pathname.startsWith("/dashboard/")) && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-20 z-20 max-sm:min-h-full">
          <div className="bg-white rounded-lg shadow-md ml-5 mt-3 mr-5 overflow-auto max-h-full max-w-full">
            {location.pathname.startsWith("/carriers/dashboard") && (
              <CarrierHeader
                isAuthenticated={isAuthenticated}
                isLoadOperationsActive={isLoadOperationsActive}
                toggleMenu={toggleMenu}
              />
            )}
            {location.pathname.startsWith("/dashboard/") && (
              <ShipperHeader
                isAuthenticated={isAuthenticated}
                isLoadOperationsActive={isLoadOperationsActive}
                toggleMenu={toggleMenu}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  try {
    const errorResponse = useRouteError();
    const jsonError = JSON.parse(errorResponse);
    const error = {
      message: jsonError.data.message,
      status: jsonError.data.status,
    };

    return <ErrorDisplay error={error} />;
  } catch (e) {
    console.error(e);
    return <div className="flex content-center bg-red-800 text-white font-medium animate-bounce">Something went wrong</div>;
  }
}
