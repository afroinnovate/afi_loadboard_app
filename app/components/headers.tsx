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
            <img src="" alt="AFI LoadBoard" className="h-8 w-auto text-xl text-green-700 hover:translate-x-2 hover:translate-y-2 hover:underline hover:cursor-pointer" />
          </Link>
        </div>

        {/* Desktop view  for shipper dashhboard*/}
        { location.pathname.startsWith('/shipper/dashboard') &&(
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
        )}
        {/* Desktop view for carrier dashboard */}
        { location.pathname.startsWith('/dashboard/') && (
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
                <Link to="/dashboard/loads/view/" className="px-3 py-2 rounded-md text-sm font-medium bg-green-500 text-white hover:bg-orange-400 hover:translate-y-1 transition duration-300">
                  Manage your Loads
                </Link>
              </>
            )}
          </div>
        )}
        
        {/* Hamburger button for mobile view */}
        { location.pathname.startsWith('/shipper/dashboard') &&(
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

        { location.pathname.startsWith('/dashboard/') && (
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
      {isMenuOpen && location.pathname.startsWith('/shipper/dashboard/')  && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-20 z-20 max-sm:min-h-full">
          <div className="bg-white rounded-lg shadow-md ml-5 mt-3 mr-5 overflow-auto max-h-full max-w-full">
            { location.pathname.startsWith('/shipper/dashboard') &&(
              <ShipperHeader isAuthenticated={isAuthenticated} isLoadOperationsActive={isLoadOperationsActive} toggleMenu={toggleMenu} />
            )}
          </div>
        </div>
      )}

      {isMenuOpen && location.pathname.startsWith('/dashboard/')  && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-20 z-20 max-sm:min-h-full">
          <div className="bg-white rounded-lg shadow-md ml-5 mt-3 mr-5 overflow-auto max-h-full max-w-full">
            { location.pathname.startsWith('/dashboard/') &&(
              <CarrierHeader isAuthenticated={isAuthenticated} isLoadOperationsActive={isLoadOperationsActive} toggleMenu={toggleMenu} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}