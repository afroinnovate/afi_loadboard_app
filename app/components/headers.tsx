import { Form, Link, NavLink, useLocation } from "@remix-run/react";
import { useState } from "react";
import {XMarkIcon, Bars3Icon } from "@heroicons/react/20/solid"; // Ensure you have heroicons installed
import ShipperHeader from "./shipperheader";
import CarrierHeader from "./carrierheader";


export default function Header({ user }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  let isAuthenticated = location.pathname.startsWith('/dashboard/') || location.pathname.startsWith('/shipper/dashboard');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isLoadOperationsActive = location.pathname.startsWith("/dashboard/loads/");

  return (
    <div className="sticky top-0 bg-white shadow-md z-20 font-apercu font-serif">
      <nav className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:flex justify-center flex-grow">
          <Link to="/" className="flex items-center">
            <img src="" alt="AFI Logo" className="h-8 w-auto text-xl text-green-700 hover:translate-x-2 hover:translate-y-2 hover:underline hover:cursor-pointer" />
          </Link>
        </div>
          {/* Hamburger button for mobile view */}
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
      
        { !isMenuOpen && (
          <header className="w-full lg:hidden flex justify-between items-center py-4 px-8 bg-gray-100 border-b-2 border-gray-200">
            <div className="flex items-center space-x-4">
              <NavLink
                to="/shipper/dashboard/"
                end
                className={({ isActive }) =>
                  "text-black font-semibold " +
                  (isActive
                    ? "border-b-2 border-blue-400 sm:text-4xl"
                    : "text-gray-400 hover:text-black sm:text")
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/shipper/dashboard/view/"
                className={() =>
                  "text-black font-semibold " +
                  (isLoadOperationsActive
                    ? "border-b-2 border-blue-400 sm:text-4xl"
                    : "text-gray-500 hover:text-black sm:text")
                }
              >
                Load Operations
              </NavLink>
            </div>
            <Link
              to="/shipper/dashboard/help"
              className="text-gray-500 hover:text-black px-4 py-2 rounded hover:border-b-2 hover:border-blue-400 sm:text-4xl"
            >
              Help
            </Link>
          </header>
        )}

        {/* Desktop view */}
        <div className="hidden lg:flex justify right space-x-4">
         {!isAuthenticated ? (
            <>
              <Link to="/login/" className="px-3 py-2 rounded-md text-sm font-medium text-green-600 bg-white hover:bg-orange-400 hover:translate-y-1 transition duration-300">
                Login
              </Link>
              <Link to="/signup/" className="px-3 py-2 rounded-md text-sm font-medium bg-green-500 text-white hover:bg-orange-400 hover:translate-y-1 transition duration-300">
                Get Started Now
              </Link>
            </>
          ) : (
            <>
              <Form action="/logout/" method="post">
                <button type="submit" className="px-3 py-2 rounded border-black text-orange-700 font-extrabold font-sans hover:underline hover:translate-y-1 hover:translate-x-2">
                  Logout
                </button>
              </Form>
              <Link to="/shipper/dashboard/view" className="px-3 py-2 rounded-md text-sm font-medium bg-green-500 text-white hover:bg-orange-400 hover:translate-y-1 transition duration-300">
                PickUp Load Now
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Menu overlay for mobile view */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-20 z-20 max-sm:min-h-full">
          <div className="bg-white rounded-lg shadow-md ml-5 mt-3 mr-5 overflow-auto max-h-full max-w-full">
            <button
              onClick={toggleMenu}
              aria-label="Open Menu"
              className="rounded focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-orange-600" />
              ) : (
                <Bars3Icon className="top-0 h-6 w-6 text-green-600" />
              )}
          </button>
          { location.pathname.startsWith('/shipper/dashboard') &&(
            <ShipperHeader isAuthenticated={isAuthenticated} isLoadOperationsActive={isLoadOperationsActive} toggleMenu={toggleMenu} />
          )}

          { location.pathname.startsWith('/dashboard') && (
            <CarrierHeader isAuthenticated={isAuthenticated} isLoadOperationsActive={isLoadOperationsActive} toggleMenu={toggleMenu} />
          )}
        </div>
        </div>
      )}
    </div>
  );
}