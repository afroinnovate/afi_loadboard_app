import React from 'react';

const errorCodes: any = {
  400: 'ER400',
  401: 'ER401',
  404: 'ER404',
  500: 'ER500',
  default: 'ER101'
};

interface ErrorProps {
  error: {
    message: string;
    status: keyof typeof errorCodes;
  };
}

const ErrorDisplay: React.FC<ErrorProps> = ({ error }:{error: any}) => {
  const errorCode = errorCodes[error.status] || errorCodes.default;
  console.log("errorCode", errorCode);
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4 shadow-lg">
        { errorCode === 'ER404' && (
          <div className="border border-green-400 text-white-700 p-3 rounded relative" role="alert">
            <strong className="font-bold">Oops!</strong>
            <span className="block sm:inline"> {error.message}, or call support with this code {errorCode}.</span>
          </div>
          )
        }
        { errorCode === 'ER500' && (
          <div className="border border-red-400 text-red-700 p-3 rounded relative" role="alert">
            <strong className="font-bold">Oops!</strong>
            <span className="block sm:inline"> {error.message}, please try again or call support with this error code: {errorCode}</span>
            <div className="mt-4 flex justify-center">
              {/* <img src="https://media.giphy.com/media/YTzh3zw4mj1XpjjiIb/giphy.gif" alt="Error Animation" style={{ maxWidth: '100%', height: '10%' }} /> */}
            </div>
          </div>
        )}
        { errorCode === 'ER400' && (
          <div className="border border-red-400 text-green-700 p-3 rounded relative" role="alert">
            <strong className="font-bold">Oops!</strong>
            <span className="block sm:inline"> {error.message}, or call support with this error code: {errorCode}</span>
          </div>
        )}
        { errorCode === 'ER401' && (
          <div className="border border-blue-400 text-black-700 p-3 rounded relative" role="alert">
            <strong className="font-bold">Oops!</strong>
            <span className="block sm:inline"> Unauthorized, You need enough priviledge. Please try again or call support with this error code: {errorCode}</span>
          </div>
        )}
        { errorCode === 'ER101' && (
          <div className="border border-red-400 text-red-700 p-3 rounded relative" role="alert">
            <strong className="font-bold">Oops!</strong>
            <span className="block sm:inline"> Something went wrong, please try again or call support with this error code: {errorCode}</span>
          </div>
        )}
        <div className="mt-3 text-center">
          <button onClick={() => window.location.reload()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
