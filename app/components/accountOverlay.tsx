import { useState, useEffect } from "react";
import { useLocation, Link, Outlet } from "@remix-run/react";
import {
  UserIcon,
  CogIcon,
  LifebuoyIcon,
  InformationCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/20/solid";

export default function AccountOverlay({
  theme,
  onClose,
  isOpen,
  toggleSidebar,
}: {
  theme: string;
  onClose: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  const basePath =
    location.pathname === "/dashboard/"
      ? "/shipper/dashboard/account"
      : "/carriers/dashboard/account";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItems = [
    { path: "profile", icon: UserIcon, label: "Profile" },
    {
      path: "business",
      icon: InformationCircleIcon,
      label: "Business Information",
    },
    { path: "subscriptions", icon: CogIcon, label: "Subscription" },
    { path: "help", icon: LifebuoyIcon, label: "Help" },
  ];

  return (
    <div className={`flex h-screen bg-white text-green-800 ${theme === "dark" ? "text-white" : ""}`}>
      {/* Sidebar */}
      <div
        className={`fixed top-16 inset-y-0 left-0 z-30 w-64 bg-gray-900 text-green-400 transition-all duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "shadow-lg" : ""}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-2xl font-semibold">Menu</h2>
          </div>
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2 p-4">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={`${basePath}/${item.path}`}
                    className="flex items-center py-2 px-4 text-green-400 hover:bg-gray-700 hover:text-white rounded transition-colors duration-200"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 transition-all duration-300 ease-in-out ml-0 md:ml-64">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <button
              onClick={toggleSidebar}
              className="text-gray-500 focus:outline-none mr-4"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              Account Settings
            </h1>
            <button onClick={onClose} className="text-gray-500 focus:outline-none">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-white">
          <div className="px-4 py-6 sm:px-0">
            <Outlet context={{ theme }}/>
          </div>
        </main>
      </div>
    </div>
  );
}
