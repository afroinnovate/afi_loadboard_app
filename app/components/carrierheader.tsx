import { Form, Link, NavLink } from "@remix-run/react";

export default function CarrierHeader({ isAuthenticated, isLoadOperationsActive, toggleMenu }) {
    return (
        <div className="flex flex-col space-y-4">
          {/* If the carrier hasn't logged in */}
            {!isAuthenticated && (
              <>
                <div className="pt-4 pl-4">
                  <Link 
                    onClick={toggleMenu}
                    to="/login/" 
                    className="px-3 py-4 items-center text-green-700 font-extrabold font-sans hover:underline hover:translate-y-1 hover:translate-x-2"
                  >
                    Login
                  </Link>
                </div>
                <div className="pb-4 pl-4">
                  <Link 
                    onClick={toggleMenu}
                    to="/signup/" 
                    className="px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-blue-400 hover:translate-y-1 hover:translate-x-2"
                    >
                      Get Started Now
                  </Link>
                </div>
              </>
            )}

            {/* If the carrier logged in */}
            {isAuthenticated && (
                <>
                  <span className="bd-solid w-auto"></span>
                  <div className="pt-4 pl-4 m-2">
                    <NavLink
                      onClick={toggleMenu}
                      to="/carriers/dashboard/"
                      end
                      className={({ isActive }) =>
                        "text-black font-semibold " +
                        (isActive
                          ? "border-b-2 border-blue-400 sm:text items-center text-green-700 font-extrabold font-sans hover:underline hover:translate-y-1 hover:translate-x-2"
                          : "text-gray-400 hover:text-black sm:text")
                      }
                    >
                      Home
                    </NavLink>
                  </div>
                  <div className="pl-4 m-2"> 
                    <NavLink
                      onClick={toggleMenu}
                      to="/carriers/dashboard/view/"
                      className={() =>
                        "text-black font-semibold " +
                        (isLoadOperationsActive
                          ? "border-b-2 border-blue-400 sm:text items-center text-green-700 font-extrabold font-sans hover:underline hover:translate-y-1 hover:translate-x-2"
                          : "text-gray-500 hover:text-black sm:text")
                      }
                    >
                      Load Operations
                    </NavLink>
                  </div>
                  <div className="pl-2 m-2">
                    <Link 
                      onClick={toggleMenu}
                      to="/carriers/dashboard/view" className="px-3 py-4 items-center text-green-700 font-extrabold font-sans hover:underline hover:translate-y-1 hover:translate-x-2">
                      PickUp Load Now
                    </Link>
                  </div>
                  <Form action="/logout/" method="post" className="pl-2 m-2">
                    <button 
                      type="submit" className="px-3 py-2 rounded border-black text-orange-700 font-extrabold font-sans hover:underline hover:translate-y-1 hover:translate-x-2">
                      Logout
                    </button> 
                  </Form>
                  <div className="mb-4 pl-8">
                    <Link
                      to="/carriers/dashboard/help"
                      className="sm:text items-center text-blue-400 font-extrabold font-sans hover:underline hover:translate-y-1 hover:translate-x-2"
                    >
                      Help
                    </Link>
                  </div>
              </>
            )}
        </div>
    );
}