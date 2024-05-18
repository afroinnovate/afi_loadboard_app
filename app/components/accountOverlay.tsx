// app/components/AccountOverlay.tsx
import { useLocation, Link, Outlet, useLoaderData } from "@remix-run/react";
import { XMarkIcon, UserIcon, CogIcon, LifebuoyIcon, InformationCircleIcon } from "@heroicons/react/20/solid";

export default function AccountOverlay({ onClose }) {
  const location = useLocation();
  
  const basePath = location.pathname.split("/").slice(0, -1).join("/");

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex">
          <div className="w-1/3 bg-gray-100 p-4">
            <ul>
              <li className="mb-4">
                <Link to={`${basePath}/profile`} className="flex items-center text-green-900 hover:bg-gray-200">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Profile
                </Link>
              </li>
              <li className="mb-4">
                <Link to={`${basePath}/business`} className="flex items-centertext-green-900 hover:bg-gray-200">
                  <InformationCircleIcon className="w-5 h-5 mr-2" />
                    Business Information
                </Link>
              </li>
              <li className="mb-4">
                <Link to={`${basePath}/subscriptions`} className="flex items-centertext-green-900 hover:bg-gray-200">
                  <CogIcon className="w-5 h-5 mr-2" />
                  Subscription
                </Link>
              </li>
              
              <li className="mb-4">
                <Link to={`${basePath}/help`} className="flex items-centertext-green-900 hover:bg-gray-200">
                  <LifebuoyIcon className="w-5 h-5 mr-2" />
                  Help
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-2/3 p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
