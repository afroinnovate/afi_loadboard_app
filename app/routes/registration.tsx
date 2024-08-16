// Import necessary modules
import { Link } from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import customStyles from "../styles/global.css";
import { ErrorBoundary } from "~/components/errorBoundary";

// Define the MetaFunction to set metadata for the page
export const meta: MetaFunction = () => [{
  title: "Loadboard | Registration Result",
  description: "Check your email to complete your profile.",
}];

export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

// Define the RegistrationResult component
export default function RegistrationResult() {
  return (
    <div className="text-center mt-0 lg:mx-auto sm:w-full sm:max-lg min-h-screen flex flex-col justify-between overflow-hidden">
      <div className="py-6">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Registration Successful
        </h1>
        <p className="mt-4 text-sm text-gray-600">
          Thank you for registering! To complete your profile, please check your email and follow the instructions provided.
        </p>
        <p className="mt-4 text-sm text-gray-600">
          If you haven't received the email, try to check your spam, use another email or contact support.
        </p>
       
      <div className="mt-1">
        <Link
          to={`/signup/`}
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Register again with another Email
        </Link>
        <span className="mx-2">or</span>
        <Link
          to={`/contact/registration/`}
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Contact Support
        </Link>
      </div>
      </div>
    </div>
  );
}

<ErrorBoundary />;