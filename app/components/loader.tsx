import { TruckIcon } from "@heroicons/react/16/solid";

export const Loader = () => {
  return (
    <div className="fixed top-32 left-80 right-0 bottom-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="loader-container">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 40 8 A 32 32 0 0 1 72 40"
            stroke="gold"
            strokeWidth="8"
            fill="none"
          />
        </svg>
        <TruckIcon className="loader-truck w-6 h-6 text-orange-400" />
      </div>
    </div>
  );
};
