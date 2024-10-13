import React, { useState, useEffect, useRef } from "react";
import { Link, Form, useLocation } from "@remix-run/react";
import {
  XMarkIcon,
  Bars3Icon,
  UserIcon,
  CogIcon,
  LifebuoyIcon,
  ArrowRightOnRectangleIcon,
  MoonIcon,
  SunIcon
} from "@heroicons/react/20/solid";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import MobileMenu from "./MobileMenu";

export default function Header({ user, theme, toggleTheme, timezone }: { user: any, theme: string, toggleTheme: () => void, timezone: string }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const isAuthenticated =
    location.pathname.startsWith("/shipper/dashboard/") ||
    location.pathname.startsWith("/carrier/dashboard/");
  
  const userType = location.pathname.split("/")[1];
  const baseUrl = `/${userType}/dashboard`;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const closeSettings = () => setIsSettingsOpen(false);

  const userInitials = `${user?.user.firstName?.charAt(0) ?? ""}${
    user?.user.lastName?.charAt(0) ?? ""
  }`;

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        closeSettings();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const headerLinkClass = `text-sm font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors duration-200 relative group`;
  const headerLinkUnderlineClass = "absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full";

  return (
    <header className={`fixed top-0 left-0 right-0 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border-b border-gray-200 dark:border-gray-700 shadow-sm z-20 font-sans h-16 md:h-20`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src="/logo2.ico"
                alt="AfroInnovate Logo"
                className="h-10 w-auto mr-2"
              />
              <span className="text-2xl font-bold text-orange-500">
                AFI LoadBoard
              </span>
            </Link>
          </div>

          {!isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/features" className={headerLinkClass}>
                Features
                <span className={headerLinkUnderlineClass}></span>
              </Link>
              <Link to="/how-it-works" className={headerLinkClass}>
                How It Works
                <span className={headerLinkUnderlineClass}></span>
              </Link>
              <Link to="/pricing" className={headerLinkClass}>
                Pricing
                <span className={headerLinkUnderlineClass}></span>
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'} hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-4">
                <select
                  className="bg-gray-800 text-gray-300 px-3 py-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  <option value="eng" defaultChecked>
                    {getUnicodeFlagIcon("US")} ENG
                  </option>
                  <option value="arb">{getUnicodeFlagIcon("SA")} ARB</option>
                  <option value="amh">{getUnicodeFlagIcon("ET")} AMH</option>
                  <option value="nus">{getUnicodeFlagIcon("SS")} NUS</option>
                </select>

                <div className="relative" ref={settingsRef}>
                  <button
                    onClick={toggleSettings}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-orange-500 text-white font-bold rounded-full">
                      <span>{userInitials}</span>
                    </div>
                  </button>
                  {isSettingsOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50">
                      <Link
                        to={`${baseUrl}/account/profile`}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <UserIcon className="w-5 h-5 mr-2" />
                        Account
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <CogIcon className="w-5 h-5 mr-2" />
                        Settings
                      </Link>
                      <Link
                        to="#"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <LifebuoyIcon className="w-5 h-5 mr-2" />
                        Help
                      </Link>
                      <Form action="/logout/" method="post">
                        <button
                          type="submit"
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                          Logout
                        </button>
                      </Form>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={toggleMenu}
              className="md:hidden rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} isAuthenticated={isAuthenticated} userType={userType} theme={theme} />
    </header>
  );
}
