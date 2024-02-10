import { Link } from "@remix-run/react";
import {  HomeIcon } from "@heroicons/react/20/solid";

type AccessDeniedProps = {
    returnUrl: string;
    message?: string;
};

export default function AccessDenied({ returnUrl, message }: AccessDeniedProps) {
    return(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white py-8 px-6 shadow-2xl rounded-lg sm:px-10 max-w-2xl">
            <h1 className="text-center text-2xl font-extrabold text-red-700 py-4">
              Access Denied!
            </h1>
            <p className="text-center text-gray-700 mb-4 italic">
              { message || "You do not have access to this page"}
            </p>
            <div className="flex justify-center">
            <Link to={ returnUrl } className="primary-action">
                <HomeIcon className="h-5  mr-2 font-extrabold w-full" />
              </Link>
            </div>
          </div>
        </div>
    );
}