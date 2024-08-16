import { useLocation, Link, Outlet } from "@remix-run/react";
import {
  XMarkIcon,
  UserIcon,
  CogIcon,
  LifebuoyIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";

export default function AccountOverlay({ onClose }) {
  const location = useLocation();

  const basePath =
    location.pathname === "/dashboard/"
      ? "/dashboard/account"
      : "/carriers/dashboard/account";

  return (
    <div className="flex h-screen w-full bg-gray-100">
      <div className="top-16 left-0 h-full w-45 bg-white text-black p-6 shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Menu</h2>
        <ul className="space-y-4">
          <li>
            <Link
              to={`${basePath}/profile`}
              className="flex items-center text-green-900 hover:bg-gray-300 p-2 rounded"
            >
              <UserIcon className="w-5 h-5 mr-2" />
              Profile
            </Link>
          </li>
          <li>
            <Link
              to={`${basePath}/business`}
              className="flex items-center text-green-900 hover:bg-gray-300 p-2 rounded"
            >
              <InformationCircleIcon className="w-5 h-5 mr-2" />
              Business Information
            </Link>
          </li>
          <li>
            <Link
              to={`${basePath}/subscriptions`}
              className="flex items-center text-green-900 hover:bg-gray-300 p-2 rounded"
            >
              <CogIcon className="w-5 h-5 mr-2" />
              Subscription
            </Link>
          </li>
          <li>
            <Link
              to={`${basePath}/help`}
              className="flex items-center text-green-900 hover:bg-gray-300 p-2 rounded"
            >
              <LifebuoyIcon className="w-5 h-5 mr-2" />
              Help
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex-1 ml-16 p-6 overflow-y-auto bg-white">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="h-full mt-6 w-full overflow-y-scroll ">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
