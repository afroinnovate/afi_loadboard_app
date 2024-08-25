import { format } from "date-fns";

export const LoadInfoDisplay = ({
  load,
  currency,
  background,
  shadow,
  offerColor,
}: {
    load: any;
    currency: string;
    background: string;
    shadow: string;
    offerColor: string;
}) => {
  const formattedDate = load.createdAt
    ? format(new Date(load.createdAt), "dd/MM/yyyy 'at' h:mm a")
    : "Date not available";

  return (
    <div
      className={`flex flex-col items-center justify-center ${background} rounded-lg ${shadow} p-4 space-y-2`}
    >
      <div className="flex items-center space-x-2 text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
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
        <span className="text-xs font-medium">Posted on: {formattedDate}</span>
      </div>

      {load.createdBy && (
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-600"
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
          <span className="text-sm font-medium text-gray-400">
            {`${load.createdBy.firstName} ${load.createdBy.lastName}`}
          </span>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-blue-400"
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
        <span className={`text-md font-bold text-${offerColor}`}>
          Offer: {currency} {load.offerAmount}
        </span>
      </div>
    </div>
  );
};
