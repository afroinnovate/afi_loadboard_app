import { useNavigation, Form, Link, useParams, useFetcher, useActionData } from "@remix-run/react";
import { type MetaFunction, type LinksFunction, type ActionFunction, redirect } from "@remix-run/node";
import customStyles from "../styles/global.css";
import invariant from "tiny-invariant";
import { SignIn } from "~/api/services/auth";
import type { loginRequest } from '../api/models/loginRequest';

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Sign In",
      description: "Sign into an existing account",
    },
  ];
};

export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

export const action:ActionFunction = async ({ request, params }) => {
  invariant(params.customer, "Missing customer parameter");
  const body = await request.formData();
  
  const userRequest: loginRequest = {
    email: body.get("email") as string,
    password: body.get("password") as string,
  }

  await SignIn(userRequest);
  return redirect(`/login/${params.customer}`);
}
export default function Login() {
  const { customer } = useParams()
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <>
      <div className="text-center mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 py-6">
        <div className="font-mono  m-2 text-center text-3xl text-black-600">Welcome to {customer} Dashboard</div>
          Sign In
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Haven't registered yet?{" "}
          <Link
            to={`/signup/${customer}`}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Create an account
          </Link>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-xlg sm:px-10">
          <Form reloadDocument method="post" className="mb-0 space-y-6">
            <div>
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
                autoComplete="tel"
                className="mt-1 block border w-full border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
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
            <div>
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
                autoComplete="password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-orange-400 focus:outline-1 focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </Form>
        </div>
      </div>
    </>
  );
}
