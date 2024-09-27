import { format } from "date-fns";

export const LoadInfoDisplay = ({
  load,
  currency,
  theme,
}: {
  load: any;
  currency: string;
  theme: 'light' | 'dark';
}) => {
  const formattedDate = load.createdAt
    ? format(new Date(load.createdAt), "dd/MM/yyyy 'at' h:mm a")
    : "Date not available";

  const themeClasses = {
    background: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-800',
    icon: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    offerColor: theme === 'dark' ? 'text-white' : 'text-blue-600',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${themeClasses.background} rounded-lg shadow-lg p-2 sm:p-4 space-y-1 sm:space-y-2 text-sm sm:text-base`}
    >
      <div className={`flex items-center space-x-2 ${themeClasses.text}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 hidden sm:inline ${themeClasses.icon}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="font-medium">Posted on: {formattedDate}</span>
      </div>

      {load.createdBy && (
        <div className={`hidden sm:flex items-center space-x-2 ${themeClasses.text}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ${themeClasses.icon}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="font-medium">
            {`${load.createdBy.firstName} ${load.createdBy.lastName}`}
          </span>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-blue-400 hidden sm:inline ${themeClasses.icon}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className={`font-bold ${themeClasses.offerColor}`}>
          Offer: {currency} {load.offerAmount}
        </span>
      </div>
    </div>
  );
};
