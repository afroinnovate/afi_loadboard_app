import { useNavigation, Form, Link, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
  ActionFunction,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import { authenticator } from "../api/services/auth.server";
import { commitSession, getSession } from "../api/services/session";
import type { LoginResponse } from "../api/models/loginResponse";
import { useState } from "react";
import { FloatingPasswordInput } from "~/components/FloatingPasswordInput";

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

// At the top of your entry file (e.g., index.js or server.js)

const session_expiration = process.env.SESSION_EXPIRATION;
console.log("session expiration:", session_expiration);

const EXPIRES_IN = Number(session_expiration) * 1000; // Convert seconds to milliseconds

if (isNaN(EXPIRES_IN)) {
  throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
}

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: `/dashboard/`,
  });

  const session = await getSession(request.headers.get("Cookie"));
  const error = session.get(authenticator.sessionErrorKey);

  const expires = new Date(Date.now() + EXPIRES_IN);

  if (error) {
    return json(
      { message: error },
      { headers: { "Set-Cookie": await commitSession(session, { expires }) } }
    );
  }

  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  try {
    let user: LoginResponse = await authenticator.authenticate(
      "user-pass",
      request,
      {
        failureRedirect: "/login/",
      }
    );

    const session = await getSession(request.headers.get("Cookie"));
    session.set(authenticator.sessionKey, user);
    session.flash(authenticator.sessionErrorKey, null);

    const expires = new Date(Date.now() + EXPIRES_IN);

    return redirect("/dashboard/", {
      headers: {
        "Set-Cookie": await commitSession(session, { expires }),
      },
    });
  } catch (error) {
    const session = await getSession(request.headers.get("Cookie"));
    session.flash(
      authenticator.sessionErrorKey,
      "Invalid username or password"
    );
    const expires = new Date(Date.now() + EXPIRES_IN);
    return redirect("/login/", {
      headers: {
        "Set-Cookie": await commitSession(session, { expires }),
      },
    });
  }
};

export default function Login() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const loaderData = useLoaderData<{ message?: string }>();

  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  // Function to handle password field focus - show rules
  const handlePasswordFocus = () => setShowPasswordRules(true);
  const handlePasswordBlur = () => setShowPasswordRules(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div
        className="bg-white py-8 px-6 shadow-2xl rounded-lg sm:px-10"
        style={{ maxWidth: "600px" }}
      >
        <h1 className="text-center text-2xl font-extrabold text-gray-900 py-4">
          Welcome to Loadboard
        </h1>

        {loaderData.message && (
          <p className="text-red-500 text-xs italic p-2">
            {loaderData.message}
          </p>
        )}

        <Form reloadDocument method="post" className="space-y-6">
          <div className="relative mb-2">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                ${
                  email.length >= 6
                    ? "border-t-white border-b-green-500"
                    : "border-b-red-500 border-l-red-500 border-r-red-500 border-t-white"
                }`}
              placeholder="Enter your email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <FloatingPasswordInput
              name="password"
              placeholder="Enter your password"
              required
              onChange={(name, value, isValid) => setPassword(value)}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                ${
                  password.length >= 8
                    ? "border-t-white border-b-green-500"
                    : "border-b-red-500 border-l-red-500 border-r-red-500 border-t-white"
                }`}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-green-500 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-center text-bold text-green-900 pb-2">
            Haven't registered yet?{" "}
            <Link
              to={`/signup/`}
              className="font-bold text-blue-600 hover:text-orange-400"
            >
              Create an account
            </Link>
          </p>

          <p className="text-bold text-green-1000 pb-2">
            Forgot your password?{" "}
            <Link
              to={`/resetpassword/`}
              className="font-bold text-blue-600 hover:text-orange-400"
            >
              Reset Password
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
