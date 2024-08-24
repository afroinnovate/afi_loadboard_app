import { useState } from "react";
import {
  useNavigation,
  Form,
  Link,
  useLoaderData,
  useActionData,
} from "@remix-run/react";
import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
  ActionFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import customStyles from "../styles/global.css";
import { authenticator } from "../api/services/auth.server";
import { commitSession, getSession } from "../api/services/session";
import { FloatingPasswordInput } from "~/components/FloatingPasswordInput";
import { ErrorBoundary } from "~/components/errorBoundary";
import {
  Github,
  FacebookIcon,
  MailIcon,
} from "lucide-react";

export const meta: MetaFunction = () => [
  {
    title: "Loadboard | Sign In",
    description: "Sign into an existing account",
  },
];

export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user: any = await session.get(authenticator.sessionKey);

  if (user) {
    return redirect(
      user?.user.userType === "shipper" ? "/shipper/dashboard/" : "/carriers/dashboard/"
    );
  }

  const errorMessage = session.get(authenticator.sessionErrorKey) || null;
  return json({ message: errorMessage });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  try {
    const user: any = await authenticator.authenticate("user-pass", request);
    session.set(authenticator.sessionKey, user);
    const redirectUrl =
      user?.user.userType === "shipper"
        ? "/shipper/dashboard/"
        : "/carriers/dashboard/";
    return redirect(redirectUrl, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    session.flash(
      authenticator.sessionErrorKey,
      "Invalid username or password"
    );
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
};

const ComingSoonButton = ({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) => (
  <div className="relative group">
    <button
      type="button"
      className="mt-2 w-full bg-gray-700 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed flex items-center justify-center"
      disabled
    >
      <Icon className="mr-2" size={20} />
      {text}
    </button>
    <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded p-2 -mt-4 left-1/2 transform -translate-x-1/2 transition-opacity duration-300">
      Coming Soon!
    </div>
  </div>
);

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const actionData = useActionData();
  const navigation = useNavigation();
  const loaderData = useLoaderData<{ message?: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        {[...Array(100)].map((_, i) => (
          <svg
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `scale(${Math.random() * 0.5 + 0.5})`,
            }}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ))}
      </div>
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 z-10">
        <h2 className="text-3xl font-bold mb-6 text-orange-500 text-center">
          AfroInnovate
        </h2>
        {loaderData.message && (
          <p className="text-red-500 text-xs italic p-2">
            {loaderData.message}
          </p>
        )}
        <Form method="post" className="space-y-2">
          <div className="relative mb-4">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`appearance-none block w-full bg-gray-700 text-white border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-gray-600 focus:ring-2 focus:ring-orange-500
                ${email.length >= 6 ? "border-green-500" : "border-gray-600"}`}
              placeholder="Enter your email or username"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mt-6 py-2">
            <FloatingPasswordInput
              name="password"
              placeholder="Enter your password"
              required
              onChange={(name, value, isValid) => setPassword(value)}
              className={`appearance-none block w-full bg-gray-700 text-white border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-gray-600 focus:ring-2 focus:ring-orange-500
                ${
                  password.length >= 8 ? "border-green-500" : "border-gray-600"
                }`}
            />
          </div>
          {actionData?.error && (
            <p className="text-red-500 text-sm">{actionData.error}</p>
          )}
          <div className="text-right">
            <Link
              to="/resetpassword/"
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              Forgotten Password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition duration-200"
          >
            {navigation.state === "submitting" ? "Signing In..." : "Sign In"}
          </button>
        </Form>
        <div className="mt-6 text-center text-gray-400">
          <span>or continue with</span>
        </div>
        <ComingSoonButton icon={Github} text="Continue with Github" />
        <ComingSoonButton icon={MailIcon} text="Continue with Google" />
        <ComingSoonButton icon={FacebookIcon} text="Continue with Facebook" />
        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup/"
            className="font-bold text-orange-400 hover:text-orange-300"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

<ErrorBoundary />
