import { Form, Link, NavLink } from "@remix-run/react";

export default function CarrierHeader({ isAuthenticated, isLoadOperationsActive, toggleMenu }) {
    return (
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        {!isAuthenticated && (
          <>
            <div className="md:hidden">
              <Link
                onClick={toggleMenu}
                to="/login/"
                className="block px-4 py-2 text-sm text-green-700 font-extrabold hover:bg-gray-100 hover:text-green-800"
              >
                Login
              </Link>
              <Link
                onClick={toggleMenu}
                to="/signup/"
                className="block px-4 py-2 text-sm bg-green-500 text-white hover:bg-green-600"
              >
                Get Started Now
              </Link>
            </div>
          </>
        )}

        {isAuthenticated && (
          <>
            <NavLink
              onClick={toggleMenu}
              to="/carrier/dashboard/"
              end
              className={({ isActive }) =>
                `block px-4 py-2 text-sm ${
                  isActive
                    ? "bg-green-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-green-700"
                }`
              }
            >
              Home
            </NavLink>
            <Link
              onClick={toggleMenu}
              to="/carrier/dashboard/view"
              className="block px-4 py-2 text-sm text-green-700 hover:bg-gray-100 hover:text-green-800"
            >
              PickUp Load Now
            </Link>
            <Link
              to="/carrier/dashboard/help"
              className="block px-4 py-2 text-sm text-blue-400 hover:bg-gray-100 hover:text-blue-500"
            >
              Help
            </Link>
            <Form action="/logout/" method="post" className="md:hidden">
              <button
                type="submit"
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700"
              >
                Logout
              </button>
            </Form>
          </>
        )}
      </div>
    );
}