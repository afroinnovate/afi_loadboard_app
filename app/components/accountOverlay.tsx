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
import { ErrorBoundary } from "./errorBoundary";

export default function AccountOverlay({
  theme,
  onClose,
  isOpen,
  toggleSidebar,
}: {
  theme: "light" | "dark";
  onClose: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const isDarkTheme = theme === "dark";

  const basePath =
    location.pathname.includes("/shipper/")
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

  const isActive = (path: string) => {
    return location.pathname.endsWith(path);
  };

  return (
    <div className={`flex h-screen ${isDarkTheme ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      {/* Sidebar */}
      <div
        className={`fixed top-16 inset-y-0 left-0 z-30 w-64 ${
          isDarkTheme ? "bg-gray-800" : "bg-gray-100"
        } transition-all duration-300 ease-in-out transform ${
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
                    className={`flex items-center py-2 px-4 rounded transition-colors duration-200 ${
                      isActive(item.path)
                        ? isDarkTheme
                          ? "bg-green-700 text-white"
                          : "bg-green-100 text-green-800"
                        : isDarkTheme
                        ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                        : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? "text-current" : ""}`} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isOpen ? "ml-0 md:ml-64" : "ml-0"}`}>
        <header className={`${isDarkTheme ? "bg-gray-800" : "bg-white"} shadow-sm`}>
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <button
              onClick={toggleSidebar}
              className={`${isDarkTheme ? "text-gray-300" : "text-gray-500"} focus:outline-none mr-4`}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className={`text-2xl font-semibold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
              Account Settings
            </h1>
            <button onClick={onClose} className={`${isDarkTheme ? "text-gray-300" : "text-gray-500"} focus:outline-none`}>
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        <main className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ${isDarkTheme ? "bg-gray-900" : "bg-white"}`}>
          <div className="px-4 py-6 sm:px-0">
            <Outlet context={{ theme }}/>
          </div>
        </main>
      </div>
    </div>
  );
}

<ErrorBoundary />;