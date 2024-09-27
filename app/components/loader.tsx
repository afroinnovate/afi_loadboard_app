import React from 'react';
import { TruckIcon } from "@heroicons/react/16/solid";

interface LoaderProps {
  size?: number;
  strokeWidth?: number;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ size = 80, strokeWidth = 8, fullScreen = false }) => {
  const loaderContent = (
    <div className="loader-container relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="white"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="loader-circle"
        />
        <g className="loader-truck-container">
          <TruckIcon 
            className="loader-truck text-white" 
            style={{ 
              width: size / 5, 
              height: size / 5,
            }} 
          />
        </g>
      </svg>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed top-32 left-80 right-0 bottom-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};
