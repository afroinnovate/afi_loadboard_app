// app/routes/signup.tsx
import { useNavigation, Form, Link, useActionData } from "@remix-run/react";
import {
  type MetaFunction,
  type LinksFunction,
  type ActionFunction,
  redirect,
  json,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import type { User } from "~/api/models/user";
import { Register } from "~/api/services/auth.server";
import invariant from "tiny-invariant";
import { useState, useEffect } from "react";
import { FloatingLabelInput } from "~/components/FloatingInput";
import { FloatingPasswordInput } from "~/components/FloatingPasswordInput";

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

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const email = body.get("email");
  const password = body.get("password");
  const confirmPassword = body.get("confirmPassword");

  var errorMessage = "";

  try {
    const user: User = {
      email: body.get("email") as string,
      password: body.get("password") as string,
    };

    // Server-side validation for email and password
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

  const isPasswordValid = password !== "" && password === confirmPassword;

  useEffect(() => {
    const emailValid = email.length > 6;
    const passwordValid =
      password.length >= 8 &&
      /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password) &&
      /[A-Z]/.test(password);
    const passwordsMatch = password === confirmPassword;
    setIsFormValid(emailValid && passwordValid && passwordsMatch && termsAccepted);
  }, [email, password, confirmPassword, termsAccepted]);

  const handlePasswordChange = (name: string, value: string) => {
    if (name === "password") {
      setPassword(value);
    } else if (name === "confirmpassword") {
      setConfirmPassword(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div
        className="bg-white py-8 px-6 shadow-2xl rounded-lg sm:px-10"
        style={{ maxWidth: "600px" }}
      >
        <h1 className="text-center text-2xl font-extrabold text-gray-900 py-4">
          Register for a new account
        </h1>
        <p className="text-center text-bold text-black mb-2">
          Already registered?{" "}
          <Link
            to={`/login/`}
            className="font-bold text-blue-600 hover:text-orange-400"
          >
            Sign in
          </Link>
        </p>

        {actionData && (
          <p className="text-red-500 text-xs italic p-2">{actionData}</p>
        )}

        <Form reloadDocument method="post" className="mb-0 space-y-2">
          <fieldset>
            <FloatingLabelInput
              name="email"
              placeholder="Email"
              required
              type="email"
              minLength={6}
              onChange={(name, value) => setEmail(value)}
            />
          </fieldset>
          <fieldset>
            <FloatingPasswordInput
              name="password"
              placeholder="Password"
              required
              onChange={(name, value) => handlePasswordChange(name, value)}
            />
          </fieldset>
          <fieldset>
            <FloatingPasswordInput
              name="confirmpassword"
              placeholder="Confirm Password"
              required
              newPassword={password}
              onChange={(name, value) => handlePasswordChange(name, value)}
            />
          </fieldset>
          <div className="col-span-4 col-start-0 col-end-4 flex items-center">
            <input
              id="terms-and-privacy"
              name="terms-and-privacy"
              type="checkbox"
              required
              className="h-4 w-4 border-gray-300 rounded text-green-700"
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{" "}
              <Link
                to="/terms"
                className="font-bold text-blue-600 hover:text-ornage-400"
              >
                Terms{" "}
              </Link>
              and
              <Link
                to="/privacy"
                className="font-bold text-blue-600 hover:text-orange-400"
              >
                {" "}
                Privacy Policy
              </Link>
            </label>
          </div>
          <button
              type="submit"
              id="submit-button"
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isPasswordValid && isFormValid
                  ? "bg-green-500 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
              disabled={!isPasswordValid || isSubmitting}
            >
              {isSubmitting ? "Signing Up..." : "Create Account"}
          </button>
        </Form>
      </div>
    </div>
  );
}
