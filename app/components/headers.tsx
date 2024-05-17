import { Form, Link, useLocation, useRouteError } from "@remix-run/react";
import { useState } from "react";
import {
  XMarkIcon,
  Bars3Icon,
  UserIcon,
  CogIcon,
} from "@heroicons/react/20/solid"; // Ensure you have heroicons installed
import getUnicodeFlagIcon from "country-flag-icons/unicode";

import CarrierHeader from "./carrierheader";
import ShipperHeader from "./shipperheader";
import ErrorDisplay from "./ErrorDisplay";

export default function Header({ user }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  let isAuthenticated =
    location.pathname.startsWith("/dashboard/") ||
    location.pathname.startsWith("/carriers/dashboard/");

  console.log("pathname", location.pathname);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isLoadOperationsActive =
    location.pathname.startsWith("/carriers/dashboard/") ||
    location.pathname.startsWith("/dashboard/loads/");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const userInitials = `${user?.firstName?.charAt(0) ?? ""}${
    user?.lastName?.charAt(0) ?? ""
  }`;

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

        {/* Desktop view  for carrier dashhboard*/}
        {location.pathname.startsWith("/carriers/dashboard") && (
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
                    className="px-3 py-2 rounded-md text-sm font-medium bg-green-500 text-white hover:bg-orange-400 hover:translate-y-1 transition duration-300"
                  >
                    PickUp Load Now
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <Link
                    to="/account"
                    className="text-green-700 font-extrabold text-sm"
                  >
                    <div className="w-9 h-9 flex items-center justify-center bg-gray-400 rounded-full">
                      <UserIcon className="w-6 h-6 text-green-600" />
                      {userInitials}
                    </div>
                  </Link>
                  <div className="relative">
                    <button
                      onClick={toggleSettings}
                      className="text-blue-400 font-extrabold text-lg"
                    >
                      <div className="flex items-center">
                        <CogIcon className="w-8 h-8 text-green-600" />
                      </div>
                    </button>
                    {isSettingsOpen && (
                      <div className="absolute right-0 mt-2 ml-2 w-40 bg-white rounded-lg shadow-lg py-2 z-50">
                        <Link
                          to="#"
                          className="block px-4 py-2 text-green-700 hover:bg-gray-100"
                        >
                          Help
                        </Link>
                        <Form action="/logout/" method="post">
                          <button
                            type="submit"
                            className="block px-4 py-2 text-green-700 hover:bg-gray-100"
                          >
                            Logout
                          </button>
                        </Form>
                      </div>
                    )}
                  </div>
                  <div>
                    <select
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 bg-white text-green-900"
                      onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                      <option value="eng" defaultChecked>
                        {getUnicodeFlagIcon("US")}eng
                      </option>
                      <option value="arb">
                        {getUnicodeFlagIcon("SA")}arabic
                      </option>
                      <option value="amh">
                        {getUnicodeFlagIcon("ET")}amharic
                      </option>
                      <option value="nus">
                        {getUnicodeFlagIcon("SS")}nuer
                      </option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {/* Desktop view for shipper dashboard */}
        {location.pathname.startsWith("/dashboard/") && (
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
                {location.pathname === "/dashboard/" && (
                  <Link
                    to="/dashboard/loads/view/"
                    className="px-3 py-2 rounded-md text-sm font-medium bg-green-500 text-white hover:bg-orange-400 hover:translate-y-1 transition duration-300"
                  >
                    Manage loads
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <Link
                    to="/account"
                    className="text-green-700 font-extrabold text-sm"
                  >
                    <div className="w-9 h-9 flex items-center justify-center bg-gray-400 rounded-full">
                      <UserIcon className="w-6 h-6 text-green-600" />
                      {userInitials}
                    </div>
                  </Link>
                  <div className="relative">
                    <button
                      onClick={toggleSettings}
                      className="text-blue-400 font-extrabold text-lg"
                    >
                      <div className="flex items-center">
                        <CogIcon className="w-8 h-8 text-green-600" />
                      </div>
                    </button>
                    {isSettingsOpen && (
                      <div className="absolute right-0 mt-2 ml-2 w-40 bg-white rounded-md shadow-lg py-2 z-50">
                        <Link
                          to="#"
                          className="block px-4 py-2 text-green-700 hover:bg-gray-100"
                        >
                          Help
                        </Link>
                        <Form action="/logout/" method="post">
                          <button
                            type="submit"
                            className="block px-4 py-2 text-green-700 hover:bg-gray-100"
                          >
                            Logout
                          </button>
                        </Form>
                      </div>
                    )}
                  </div>
                  <div>
                    <select
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 bg-white text-green-900"
                      onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                      <option value="eng" defaultChecked>
                        {getUnicodeFlagIcon("US")}eng
                      </option>
                      <option value="arb">
                        {getUnicodeFlagIcon("SA")}arabic
                      </option>
                      <option value="amh">
                        {getUnicodeFlagIcon("ET")}amharic
                      </option>
                      <option value="nus">
                        {getUnicodeFlagIcon("SS")}nuer
                      </option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Hamburger button for mobile view */}
        {location.pathname.startsWith("/carriers/dashboard") && (
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

        {location.pathname.startsWith("/dashboard/") && (
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
      {isMenuOpen && location.pathname.startsWith("/carriers/dashboard/") && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-20 z-20 max-sm:min-h-full">
          <div className="bg-white rounded-lg shadow-md ml-5 mt-3 mr-5 overflow-auto max-h-full max-w-full">
            {location.pathname.startsWith("/carriers/dashboard") && (
              <CarrierHeader
                isAuthenticated={isAuthenticated}
                isLoadOperationsActive={isLoadOperationsActive}
                toggleMenu={toggleMenu}
              />
            )}
          </div>
        </div>
      )}

      {isMenuOpen && location.pathname.startsWith("/dashboard/") && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-20 z-20 max-sm:min-h-full">
          <div className="bg-white rounded-lg shadow-md ml-5 mt-3 mr-5 overflow-auto max-h-full max-w-full">
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
    const errorResponse: any = useRouteError();
    const jsonError = JSON.parse(errorResponse);
    const error = {
      message: jsonError.data.message,
      status: jsonError.data.status,
    };

    return <ErrorDisplay error={error} />;
  } catch (e) {
    console.error(e);
    return <div>Something went wrong</div>;
  }
}
