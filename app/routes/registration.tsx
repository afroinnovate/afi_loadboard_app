import { Link, useOutletContext } from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import customStyles from "../styles/global.css";
import { ErrorBoundary } from "~/components/errorBoundary";

export const meta: MetaFunction = () => [{
  title: "Loadboard | Registration Confirmation",
  description: "Complete your profile by checking your email.",
}];

export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

interface OutletContext {
  theme: 'light' | 'dark';
}

export default function RegistrationResult() {
  const { theme } = useOutletContext<OutletContext>();
  console.log("theme: ", theme);
  const isDarkTheme = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-6 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full space-y-8 p-10 rounded-xl shadow-md ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
        <h1 className={`text-3xl font-bold text-center ${isDarkTheme ? 'text-white' : 'text-green-700'}`}>
          Registration Successful
        </h1>
        <div className="space-y-4">
          <p className={isDarkTheme ? 'text-gray-300' : 'text-gray-700'}>
            Thank you for registering! To complete your profile:
          </p>
          <ol className={`list-decimal list-inside space-y-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>Check your email inbox</li>
            <li>Follow the instructions in the confirmation email</li>
          </ol>
          <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            Can't find the email? Check your spam folder or try the options below.
          </p>
        </div>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
          <Link
            to="/signup"
            className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDarkTheme
                ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                : 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
            }`}
          >
            Register with Another Email
          </Link>
          <Link
            to="/contact/registration"
            className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDarkTheme
                ? 'text-white bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
            }`}
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

<ErrorBoundary />;