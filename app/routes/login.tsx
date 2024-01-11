import { useNavigation, Form, Link, useLoaderData, useActionData } from "@remix-run/react";
import type { MetaFunction, LinksFunction, LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import customStyles from "../styles/global.css";
import { authenticator } from "~/api/services/auth.server";
import { commitSession, getSession } from "~/api/services/session";
import { LoginResponse } from "~/api/models/loginResponse";
// import invariant from "tiny-invariant";

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

export const loader: LoaderFunction = async ({ request }) => {  

  // Check if this is the initial request
  // const isInitialRequest = request.method === 'GET';

  await authenticator.isAuthenticated(request, { 
    successRedirect: `/dashboard/`,
  });
  
  
  // if not check the session
  const session = await getSession(request.headers.get("Cookie"));
  let error = session.get(authenticator.sessionErrorKey);
  if (error) {
    // if there is an error, we'll add it to the flash
    session.flash(authenticator.sessionErrorKey, error);
    return json<any>(error);
  }
  return "Invalid username or password"
}

export const action: ActionFunction = async ({ request }) => {

  let user: LoginResponse = await authenticator.authenticate("user-pass", request, {
    failureRedirect: "/login/",
    successRedirect: "/dashboard/",
  });

  if (user) {
    const session = await getSession(request.headers.get("Cookie"));
    session.flash(authenticator.sessionErrorKey, null);
    await commitSession(session);
    return redirect("/dashboard/");
  }
  return "Invalid username or password";
};

export default function Login() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const loaderData: { message?: string } = useLoaderData();
  let loaderMessage = ''
  if(loaderData.message == '401: Unauthorized') {
    loaderMessage = "Invalid username or password"
  }

  return (
    <>
      <div className="text-center mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 py-6">
        <div className="font-mono  m-2 text-center text-3xl text-black-600">Welcome to loadboard</div>
          Sign In
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Haven't registered yet?{" "}
          <Link
            to={`/signup/`}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Create an account
          </Link>
        </p>
              
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg sm:px-10">
          {loaderData.message && (
            <p className="text-red-500 text-xs italic p-2">
              {loaderMessage}
            </p>
          )}
          <Form reloadDocument method="post" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </Form>
        </div>
      </div>

    </>
  );
}
function isOnboarded(user: LoginResponse) {
  throw new Error("Function not implemented.");
}

