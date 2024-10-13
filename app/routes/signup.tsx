import { useState, useEffect, useRef } from "react";
import {
  useNavigation,
  Form,
  Link,
  useActionData,
  useOutletContext,
  useNavigate,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import {
  type MetaFunction,
  type LinksFunction,
  type ActionFunction,
  type LoaderFunction,
  redirect,
  json,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import { Register } from "~/api/services/auth.server";
import invariant from "tiny-invariant";
import { FloatingLabelInput } from "~/components/FloatingInput";
import { FloatingPasswordInput } from "~/components/FloatingPasswordInput";
import { ErrorBoundary } from "~/components/errorBoundary";
import { TermsPrivacyPopup } from "~/components/TermsPrivacyPopup";
import { getSession, commitSession } from "../api/services/session";
import { authenticator } from "../api/services/auth.server";
import { Loader } from "~/components/loader";

export const meta: MetaFunction = () => [
  {
    title: "AfroInnovate | Sign Up",
    description: "Sign up for a new account",
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
  const referer = request.headers.get("Referer");
  
  if (referer) {
    try {
      const url = new URL(referer);
      const timeZoneParam = url.searchParams.get("timeZone");
      if (timeZoneParam && timeZoneParam !== timeZone) {
        timeZone = timeZoneParam;
        session.set("timeZone", timeZone);
      }
    } catch (error) {
      console.error("Invalid Referer URL:", error);
    }
  }

  const termsRead = session.get("termsRead") === "true";
  const privacyRead = session.get("privacyRead") === "true";

  if (user) {
    return redirect(
      user?.user.userType === "shipper"
        ? "/shipper/dashboard/"
        : "/carrier/dashboard/"
    );
  }

  return json(
    { timeZone, termsRead, privacyRead },
    { headers: { "Set-Cookie": await commitSession(session, { expires }) } }
  );
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "markTermsPrivacyRead") {
    session.set("termsPrivacyRead", "true");
    return json(
      { success: true },
      { headers: { "Set-Cookie": await commitSession(session) } }
    );
  }

  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const termsAndPrivacyAccepted = formData.get("terms-and-privacy") === "on";

  let errorMessage = "";

  try {
    const user: any = {
      email: email as string,
      password: password as string,
    };

    // Server-side validation
    invariant(
      typeof email === "string" && email.length > 6,
      "Enter a valid email address"
    );
    invariant(
      typeof password === "string" && password.length >= 8,
      "Password must be at least 8 characters long"
    );
    invariant(
      password.match(/[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/),
      "Password must contain a special character"
    );
    invariant(
      /[A-Z]/.test(password),
      "Password must contain at least one uppercase letter"
    );
    invariant(
      typeof confirmPassword === "string" && confirmPassword === password,
      "Passwords must match"
    );
    invariant(
      termsAndPrivacyAccepted,
      "You must accept the Terms of Service and Privacy Policy"
    );

    await Register(user);
    return redirect(`/registration/`);
  } catch (error: any) {
    console.log("error signup: ", error);
    switch (error.message) {
      case "Invariant failed: Password must be at least 8 characters long":
        errorMessage = error.message.replace("Invariant failed: ", "");
        break;
      case "Invariant failed: Password must contain a special character":
        errorMessage = error.message.replace("Invariant failed: ", "");
        break;
      case "Invariant failed: Passwords must match":
        errorMessage = error.message.replace("Invariant failed: ", "");
        break;
      case "Invariant failed: Enter a valid email address":
        errorMessage = error.message.replace("Invariant failed: ", "");
        break;
      case "Invariant failed: Password must contain at least one uppercase letter":
        errorMessage = error.message.replace("Invariant failed: ", "");
        break;
      case "Invariant failed: You must accept the Terms of Service and Privacy Policy":
        errorMessage =
          "You must accept the Terms of Service and Privacy Policy";
        break;
      default:
        errorMessage = "Oops! Something went wrong. Please try again.";
        break;
    }
    return json({ error: errorMessage }, { status: 400 });
  }
};

export default function Signup() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData: any = useActionData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const { theme } = useOutletContext<{ theme: "light" | "dark" }>();
  const [termsPrivacyPopupOpen, setTermsPrivacyPopupOpen] = useState(false);
  const [termsPrivacyRead, setTermsPrivacyRead] = useState(false);
  const navigate = useNavigate();
  const loaderData = useLoaderData<{
    timeZone?: string;
    termsRead: boolean;
    privacyRead: boolean;
  }>();
  const [searchParams] = useSearchParams();
  const [timeZoneName, setTimeZoneName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const bgColor = theme === "light" ? "bg-gray-100" : "bg-gray-900";
  const cardBgColor = theme === "light" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "light" ? "text-gray-900" : "text-white";
  const inputBgColor = theme === "light" ? "bg-gray-100" : "bg-gray-700";
  const inputFocusBgColor =
    theme === "light" ? "focus:bg-white" : "focus:bg-gray-600";

  useEffect(() => {
    const emailValid = email.length > 6;
    const passwordValid =
      password.length >= 8 &&
      /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password) &&
      /[A-Z]/.test(password);
    const passwordsMatch = password === confirmPassword;
    setIsFormValid(
      emailValid && passwordValid && passwordsMatch && termsAccepted
    );
  }, [email, password, confirmPassword, termsAccepted]);

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
        navigate(`/signup?timeZone=${encodeURIComponent(timeZone)}`, {
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

  const handlePasswordChange = (name: string, value: string) => {
    if (name === "password") {
      setPassword(value);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    }
  };

  const handleTermsPrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setTermsPrivacyPopupOpen(true);
  };

  const handlePopupClose = async (agreed: boolean) => {
    setTermsPrivacyPopupOpen(false);
    if (agreed && !termsPrivacyRead) {
      const formData = new FormData();
      formData.append("intent", "markTermsPrivacyRead");
      await fetch("/signup", { method: "POST", body: formData });
      setTermsPrivacyRead(true);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${bgColor} relative overflow-hidden transition-colors duration-300`}
    >
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
      <div
        className={`${cardBgColor} p-8 rounded-lg shadow-xl w-96 z-10 transition-colors duration-300`}
      >
        <h2 className="text-3xl font-bold mb-6 text-orange-500 text-center">
          AfroInnovate
        </h2>
        <h3 className={`text-xl font-semibold mb-4 ${textColor} text-center`}>
          Create a new account
        </h3>
        <p
          className={`text-center ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          } mb-6`}
        >
          Already registered?{" "}
          <Link
            to="/login/"
            className="font-bold text-orange-400 hover:text-orange-300"
          >
            Sign in
          </Link>
        </p>

        {actionData?.error && (
          <div className="mb-4 text-red-500 text-center text-sm">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-6" ref={formRef}>
          <FloatingLabelInput
            name="email"
            theme={theme}
            placeholder="Email"
            required
            type="email"
            minLength={6}
            onChange={(name, value) => setEmail(value)}
            className={`w-full px-3 py-2 ${inputBgColor} ${textColor} border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 transition-colors duration-300`}
          />
          <FloatingPasswordInput
            name="password"
            theme={theme}
            placeholder="Password"
            required
            onChange={(name, value) => handlePasswordChange(name, value)}
            className={`w-full px-3 py-2 ${inputBgColor} ${textColor} border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-300`}
          />
          <FloatingPasswordInput
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            newPassword={confirmPassword}
            onChange={(name, value) => handlePasswordChange(name, value)}
            className={`w-full px-3 py-2 ${inputBgColor} ${textColor} border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-300`}
            theme={theme}
          />
          <div className="flex items-center">
            <input
              id="terms-and-privacy"
              name="terms-and-privacy"
              type="checkbox"
              required
              className="h-4 w-4 border-gray-300 rounded text-orange-500 focus:ring-orange-500"
              onChange={() => setTermsAccepted(!termsAccepted)}
              disabled={!termsPrivacyRead}
            />
            <label
              htmlFor="terms-and-privacy"
              className={`ml-2 block text-sm ${
                theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
            >
              I agree to the{" "}
              <button
                type="button"
                onClick={handleTermsPrivacyClick}
                className="font-bold text-orange-400 hover:text-orange-300"
              >
                Terms and Privacy Policy
              </button>
            </label>
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isFormValid
                ? "bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                : "bg-gray-700 cursor-not-allowed"
            } transition-colors duration-300 flex items-center justify-center`}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader size={20} className="mr-2" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </Form>
        {timeZoneName && (
          <p className={`${textColor} text-sm mb-4 text-center`}>
            Your time zone is: {timeZoneName}
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
      </div>

      <TermsPrivacyPopup
        isOpen={termsPrivacyPopupOpen}
        onClose={handlePopupClose}
        theme={theme}
      />
    </div>
  );
}

<ErrorBoundary />;