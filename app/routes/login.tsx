import { useEffect, useState, useRef } from "react";
import {
  Form,
  Link,
  useLoaderData,
  useActionData,
  useNavigate,
  useSearchParams,
  useOutletContext,
  useNavigation,
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
import { Github, FacebookIcon, MailIcon } from "lucide-react";
import { Loader } from "~/components/loader";

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

  const session_expiration: any = process.env.SESSION_EXPIRATION;
  const EXPIRES_IN = parseInt(session_expiration) * 1000;
  if (isNaN(EXPIRES_IN)) {
    throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
  }

  const expires = new Date(Date.now() + EXPIRES_IN);

  let timeZone = session.get("timeZone") || "UTC";
  const url = new URL(request.url);
  const timeZoneParam = url.searchParams.get("timeZone");

  if (timeZoneParam && timeZoneParam !== timeZone) {
    timeZone = timeZoneParam;
    session.set("timeZone", timeZone);
  }

  if (user) {
    return redirect(
      user?.user.userType === "shipper"
        ? "/shipper/dashboard/"
        : "/carrier/dashboard/"
    );
  }

  const errorMessage = session.get(authenticator.sessionErrorKey) || null;
  return json(
    { message: errorMessage, timeZone },
    { headers: { "Set-Cookie": await commitSession(session, { expires }) } }
  );
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  try {
    const user: any = await authenticator.authenticate("user-pass", request);

    const session_expiration: any = process.env.SESSION_EXPIRATION;
    const EXPIRES_IN = parseInt(session_expiration) * 1000;
    if (isNaN(EXPIRES_IN)) {
      throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
    }

    const expires = new Date(Date.now() + EXPIRES_IN);
    if (!user) {
      session.flash(
        authenticator.sessionErrorKey,
        "Invalid username or password"
      );
      return json(
        { error: "Invalid username or password" },
        {
          status: 400,
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }

    session.set(authenticator.sessionKey, user);
    session.set("theme", session.get("theme") || "dark");
    const redirectUrl =
      user?.user.userType === "shipper"
        ? "/shipper/dashboard/"
        : "/carrier/dashboard/";
    return redirect(redirectUrl, {
      headers: {
        "Set-Cookie": await commitSession(session, { expires }),
      },
    });
  } catch (error) {
    return json(
      { error: "Invalid username or password" },
      {
        status: 400,
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }
};

export default function Login() {
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string }>();
  const loaderData = useLoaderData<{ message?: string; timeZone?: string }>();
  const [timeZoneName, setTimeZoneName] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useOutletContext<{ theme: 'light' | 'dark' }>();

  useEffect(() => {
    if (!loaderData.timeZone || loaderData.timeZone === "UTC") {
      // Attempt to get the time zone via JavaScript
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (
        timeZone &&
        timeZone !== "UTC" &&
        timeZone !== searchParams.get("timeZone")
      ) {
        // Use client-side navigation instead of window.location.replace
        navigate(`/login?timeZone=${encodeURIComponent(timeZone)}`, {
          replace: true,
        });
      } else {
        setTimeZoneName("Coordinated Universal Time");
      }
    } else {
      // Get the localized time zone name
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: loaderData.timeZone,
        timeZoneName: "long",
      });
      const parts = formatter.formatToParts(new Date());
      const tzName = parts.find((part) => part.type === "timeZoneName")?.value;
      setTimeZoneName(tzName || loaderData.timeZone);
    }
  }, [loaderData.timeZone, navigate, searchParams]);

  const isSubmitting = navigation.state === "submitting";

  const bgColor = theme === 'light' ? 'bg-gray-100' : 'bg-gray-900';
  const cardBgColor = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const inputBgColor = theme === 'light' ? 'bg-gray-100' : 'bg-gray-700';
  const inputFocusBgColor = theme === 'light' ? 'focus:bg-white' : 'focus:bg-gray-600';

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgColor} relative overflow-hidden transition-colors duration-300`}>
      {/* Background Styling */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(50)].map((_, i) => (
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
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ))}
      </div>

      {/* Main Content */}
      <div className={`${cardBgColor} p-8 rounded-lg shadow-xl w-full max-w-md z-10 transition-colors duration-300`}>
        <h2 className="text-3xl font-bold mb-6 text-orange-500 text-center">
          AfroInnovate
        </h2>
        {loaderData.message && (
          <p className="text-red-500 text-xs italic p-2">
            {loaderData.message}
          </p>
        )}
        {timeZoneName && (
          <p className={`${textColor} text-sm mb-4 text-center`}>
            Your time zone is: {timeZoneName}
          </p>
        )}
        {actionData?.error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {actionData.error}
          </p>
        )}
        <noscript>
          <p className="text-red-500 text-sm text-center">
            JavaScript is required to detect your time zone and provide the best
            experience. Your time zone is set to UTC by default.
          </p>
          <div className="text-center mt-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
            >
              Enable JavaScript
            </button>
          </div>
        </noscript>
        <Form method="post" className="space-y-4">
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`appearance-none block w-full ${inputBgColor} ${textColor} border rounded py-3 px-4 mb-3 leading-tight focus:outline-none ${inputFocusBgColor} focus:ring-2 focus:ring-orange-500 border-gray-600 transition-colors duration-300`}
              placeholder="Enter your email or username"
            />
          </div>
          <div className="py-2">
            <FloatingPasswordInput
              name="password"
              placeholder="Enter your password"
              required
              className={`appearance-none block w-full ${inputBgColor} ${textColor} border rounded py-3 px-4 mb-3 leading-tight focus:outline-none ${inputFocusBgColor} focus:ring-2 focus:ring-orange-500 border-gray-600 transition-colors duration-300`}
              theme={theme}
              onChange={() => setLoginError(null)}
            />
          </div>
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
            className={`w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition duration-200 flex items-center justify-center`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader size={20} className="mr-2" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </Form>
        <div className={`mt-6 text-center ${textColor}`}>
          <span>or continue with</span>
        </div>
        {/* Social Login Buttons */}
        <ComingSoonButton icon={Github} text="Continue with Github" theme={theme} />
        <ComingSoonButton icon={MailIcon} text="Continue with Google" theme={theme} />
        <ComingSoonButton icon={FacebookIcon} text="Continue with Facebook" theme={theme} />
        <p className={`mt-6 text-center ${textColor}`}>
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

function ComingSoonButton({
  icon: Icon,
  text,
  theme,
}: {
  icon: React.ElementType;
  text: string;
  theme: 'light' | 'dark';
}) {
  const bgColor = theme === 'light' ? 'bg-gray-200' : 'bg-gray-700';
  const textColor = theme === 'light' ? 'text-gray-600' : 'text-gray-400';

  return (
    <div className="relative group">
      <button
        type="button"
        className={`mt-2 w-full ${bgColor} ${textColor} py-2 px-4 rounded-md cursor-not-allowed flex items-center justify-center transition-colors duration-300`}
        disabled
      >
        <Icon className="mr-2" size={20} />
        {text}
      </button>
      <div className={`absolute invisible group-hover:visible ${theme === 'light' ? 'bg-gray-200 text-gray-800' : 'bg-gray-800 text-white'} text-xs rounded p-2 -mt-4 left-1/2 transform -translate-x-1/2 transition-opacity duration-300`}>
        Coming Soon!
      </div>
    </div>
  );
}

<ErrorBoundary />;
