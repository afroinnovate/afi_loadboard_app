import { useNavigation, Form, Link, useParams, useActionData } from "@remix-run/react";
import {
  type MetaFunction,
  type LinksFunction,
  type ActionFunction,
  redirect,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import type { User } from "~/api/models/user";
import { Register } from "~/api/services/auth.server";
import invariant from "tiny-invariant";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Sign Up",
      description: "Sign up for a new account",
    },
  ];
};

export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

export const action: ActionFunction = async ({ request, params }) => {
  // invariant(params.customer, "Missing customer parameter");

  const body = await request.formData();
  const email = body.get("email");
  const password = body.get("password");
  const confirmPassword = body.get("confirmPassword");

  const user: User = {
    email: body.get("email") as string,
    password: body.get("password") as string,
  };

  // Server-side validation for email and password
  invariant(typeof email === "string" && email.length > 0, "Email is required");
  invariant(typeof password === "string" && password.length >= 6, "Password must be at least 6 characters long");
  invariant(password.match(/[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/), "Password must contain a special character");
  invariant(typeof confirmPassword === "string" && confirmPassword === password, "Passwords must match");

  const response  = await Register(user);
  console.log('registration response -->', response);
  
  return redirect(`/login/`);
};

export default function Signup() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const inputStyle = `border border-slate-400 rounded py-2 px-3 inline-block w-full`;
  const actionData = useActionData();

  return (
    <>
      <div className="text-center mt-2 sm:mx-auto sm:w-full sm:max-w-xl">
        <h1 className="text-center text-2xl font-extrabold text-gray-900 py-4">
          <div className="font-mono text-center text-3xl text-black-600">
            Register for a new account
          </div>
        </h1>
        <p className="text-center text-bold text-black">
          Already registered?{" "}
          <Link
            to={`/login/`}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Error message */}
        {/* actionData?.errorMessage && <p className="text-red-500 text-xs italic">{actionData.errorMessage}</p> */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-xlg sm:px-10">
          <Form reloadDocument method="post" className="mb-0 space-y-6">
            <fieldset>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                className={inputStyle}
                required
              />
            </fieldset>
            <fieldset>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className={inputStyle}
                required
              />
            </fieldset>
            <fieldset className="space-y-2">
             <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {actionData?.fieldErrors?.confirmPassword && (
                <p className="text-red-500 text-xs italic">{actionData.fieldErrors.confirmPassword}</p>
              )}
            </fieldset>
            <div className=" col-span-4 col-start-0 col-end-4 flex items-center">
            <input
              id="terms-and-privacy"
              name="terms-and-privacy"
              type="checkbox"
              required
              className="h-4 w-4 border-gray-300 rounded text-blue-700 focus:ring-orange-700"
              onChange={() => {
                const submitButton = document.getElementById('submit-button');
                const isChecked = document.getElementById('terms-and-privacy').checked;
                submitButton.disabled = !isChecked;
                if (isChecked) {
                  submitButton.classList.remove('bg-gray-400', 'text-gray-700', 'cursor-not-allowed');
                } else {
                  submitButton.classList.add('bg-gray-400', 'text-gray-700', 'cursor-not-allowed');
                }
              }}
            />

                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-900"
                >
                  I agree to the{" "}
                  <Link to="/terms"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >Terms </Link>
                  and
                  <Link to="/terms"
                    className="font-medium text-blue-600 hover:text-blue-500"> Privacy Policy</Link>
                </label>
              </div>
              <button
                type="submit"
                id="submit-button"
                disabled
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-orange-400 focus:outline-1 focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 ${
                  isSubmitting ? "" : "bg-gray-400 text-gray-700 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Signing Up..." : "Create Account"}
              </button>


          </Form>
          {/* <Form reloadDocument method="post" className="mb-0 space-y-6">
            <div className="grid grid-cols-4 gap-12">
              <div className="col-span-2 col-start-0 col-end-1">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"

                  required
                  className="mt-1 block border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="col-span-2 col-start-1 col-end-4">
                <label
                  htmlFor="middleName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Middle Name
                </label>
                <input
                  id="middleName"
                  name="middleName"
                  type="text"
                  className="mt-1 block border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500  focus:border-indigo-500"
                />
              </div>
              <div className="col-span-2 col-start-0 col-end-1">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="mt-1 block border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="col-span-2 col-start-1 col-end-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  className="mt-1 block border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="col-span-4 col-start-0 col-end-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="col-span-4 col-start-0 col-end-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="col-span-4 col-start-0 col-end-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className=" col-span-4 col-start-0 col-end-4 flex items-center">
                <input
                  id="terms-and-privacy"
                  name="terms-and-privacy"
                  type="checkbox"
                  required
                  className="h-4 w-4 border-gray-300 rounded text-blue-700 focus:ring-orange-700"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-900"
                >
                  I agree to the{" "}
                  <Link to="/terms"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >Terms </Link>
                  and
                  <Link to="/terms"
                    className="font-medium text-blue-600 hover:text-blue-500"> Privacy Policy</Link>
                </label>
              </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-orange-400 focus:outline-1 focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
            >
              {isSubmitting ? "Signing Up..." : "Create Account"}
            </button>
          </Form> */}
        </div>
      </div>
    </>
  );
}