import { useState, useEffect } from "react";
import { useNavigation, Form, Link, useActionData } from "@remix-run/react";
import {
  type MetaFunction,
  type LinksFunction,
  type ActionFunction,
  redirect,
  json,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import { Register } from "~/api/services/auth.server";
import invariant from "tiny-invariant";
import { FloatingLabelInput } from "~/components/FloatingInput";
import { FloatingPasswordInput } from "~/components/FloatingPasswordInput";
import { ErrorBoundary } from "~/components/errorBoundary";

export const meta: MetaFunction = () => [
  {
    title: "AfroInnovate | Sign Up",
    description: "Sign up for a new account",
  },
];

export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const email = body.get("email");
  const password = body.get("password");
  const confirmPassword = body.get("confirmPassword");

  let errorMessage = "";

  try {
    const user: any = {
      email: body.get("email") as string,
      password: body.get("password") as string,
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

  const handlePasswordChange = (name: string, value: string) => {
    if (name === "password") {
      setPassword(value);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    }
  };

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
        <h3 className="text-xl font-semibold mb-4 text-white text-center">
          Create a new account
        </h3>
        <p className="text-center text-gray-300 mb-6">
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

        <Form method="post" className="space-y-6">
          <FloatingLabelInput
            name="email"
            placeholder="Email"
            required
            type="email"
            minLength={6}
            onChange={(name, value) => setEmail(value)}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
          />
          <FloatingPasswordInput
            name="password"
            placeholder="Password"
            required
            onChange={(name, value) => handlePasswordChange(name, value)}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <FloatingPasswordInput
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            newPassword={confirmPassword}
            onChange={(name, value) => handlePasswordChange(name, value)}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="flex items-center">
            <input
              id="terms-and-privacy"
              name="terms-and-privacy"
              type="checkbox"
              required
              className="h-4 w-4 border-gray-300 rounded text-orange-500 focus:ring-orange-500"
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <label
              htmlFor="terms-and-privacy"
              className="ml-2 block text-sm text-gray-300"
            >
              I agree to the{" "}
              <Link
                to="/terms"
                className="font-bold text-orange-400 hover:text-orange-300"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="font-bold text-orange-400 hover:text-orange-300"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isFormValid
                ? "bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                : "bg-gray-700 cursor-not-allowed"
            }`}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </Form>
      </div>
    </div>
  );
}

<ErrorBoundary />;
