import React, { useState } from "react";
import { Link, Form, useNavigate, NavLink } from "@remix-run/react";
import {
  UserIcon,
  CogIcon,
  LifebuoyIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  TruckIcon,
  PlusCircleIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/20/solid";

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
  isAuthenticated: boolean;
  userType: string;
  theme: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  toggleMenu,
  isAuthenticated,
  userType,
  theme,
}) => {
  const navigate = useNavigate();
  const baseUrl = `/${userType}/dashboard/`;
  const [isOperationsOpen, setIsOperationsOpen] = useState(false);

  const menuItemClass = `block px-4 py-2 text-sm ${
    theme === "dark" ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
  } hover:text-white`;

  const handleNavigation = (path: string) => {
    toggleMenu();
    navigate(path);
  };

  if (!isOpen) return null;

  const shipperLinks = [
    { name: "Overview", to: "/shipper/dashboard/", icon: HomeIcon },
    { name: "View Loads", to: "/shipper/dashboard/loads/view/", icon: TruckIcon },
    { name: "Add Loads", to: "/shipper/dashboard/loads/add/", icon: PlusCircleIcon },
    { name: "Bids", to: "/shipper/dashboard/loads/bids/", icon: CurrencyDollarIcon },
  ];

  const carrierLinks = [
    { name: "Overview", to: "/carrier/dashboard/", icon: HomeIcon },
    {
      name: "Operations",
      icon: TruckIcon,
      children: [
        { name: "View Open Loads", to: "/carrier/dashboard/view/", icon: TruckIcon },
        { name: "View Bids", to: "/carrier/dashboard/bid/", icon: CurrencyDollarIcon },
      ],
    },
  ];

  const links = userType === "shipper" ? shipperLinks : carrierLinks;

  return (
    <div className={`md:hidden ${theme === "dark" ? "bg-gray-800" : "bg-white"} border-b border-gray-700`}>
      <div className="px-2 pt-2 pb-3 space-y-1">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className={menuItemClass} onClick={toggleMenu}>
              Login
            </Link>
            <Link to="/signup" className={menuItemClass} onClick={toggleMenu}>
              Sign Up
            </Link>
          </>
        ) : (
          <>
            {links.map((link) => (
              <React.Fragment key={link.name}>
                {link.children ? (
                  <div>
                    <button
                      onClick={() => setIsOperationsOpen(!isOperationsOpen)}
                      className={`${menuItemClass} w-full flex justify-between items-center`}
                    >
                      <span className="flex items-center">
                        <link.icon className="w-5 h-5 inline-block mr-2" />
                        {link.name}
                      </span>
                      {isOperationsOpen ? (
                        <ChevronUpIcon className="w-5 h-5" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                      )}
                    </button>
                    {isOperationsOpen && (
                      <div className="pl-4">
                        {link.children.map((childLink) => (
                          <NavLink
                            key={childLink.name}
                            to={childLink.to}
                            className={({ isActive }) =>
                              `${menuItemClass} ${isActive ? (theme === "dark" ? "bg-gray-700" : "bg-gray-200") : ""}`
                            }
                            onClick={toggleMenu}
                          >
                            <childLink.icon className="w-5 h-5 inline-block mr-2" />
                            {childLink.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `${menuItemClass} ${isActive ? (theme === "dark" ? "bg-gray-700" : "bg-gray-200") : ""}`
                    }
                    onClick={toggleMenu}
                  >
                    <link.icon className="w-5 h-5 inline-block mr-2" />
                    {link.name}
                  </NavLink>
                )}
              </React.Fragment>
            ))}
            <button onClick={() => handleNavigation(`${baseUrl}account/profile`)} className={menuItemClass}>
              <UserIcon className="w-5 h-5 inline-block mr-2" />
              Account
            </button>
            <button onClick={() => handleNavigation("/settings")} className={menuItemClass}>
              <CogIcon className="w-5 h-5 inline-block mr-2" />
              Settings
            </button>
            <button onClick={() => handleNavigation(`${baseUrl}help`)} className={menuItemClass}>
              <LifebuoyIcon className="w-5 h-5 inline-block mr-2" />
              Help
            </button>
            <Form action="/logout/" method="post" onSubmit={toggleMenu}>
              <button type="submit" className={`w-full text-left ${menuItemClass}`}>
                <ArrowRightOnRectangleIcon className="w-5 h-5 inline-block mr-2" />
                Logout
              </button>
            </Form>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
