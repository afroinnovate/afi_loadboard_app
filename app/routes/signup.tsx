import { useNavigation, Form, Link, useActionData } from "@remix-run/react";
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

export const action: ActionFunction = async ({ request }) => {
  // invariant(params.customer, "Missing customer parameter");

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
      typeof password === "string" && password.length >= 6,
      "Password must be at least 6 characters long"
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
      case "Invariant failed: Password must be at least 6 characters long":
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
        errorMessage = "Oopse! Something went wrong. Please try again.";
        break;
    }
    return errorMessage;
  }
};

export default function Signup() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const inputStyle = `border border-slate-400 rounded py-2 px-3 inline-block w-full`;
  const actionData: any = useActionData();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div
        className="bg-white py-8 px-6 shadow-2xl rounded-lg sm:px-10"
        style={{ maxWidth: "600px" }}
      >
        <h1 className="text-center text-2xl font-extrabold text-gray-900 py-4">
          Register for a new account
        </h1>
        <p className="text-center text-bold text-black pb-2">
          Already registered?{" "}
          <Link
            to={`/login/`}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>

        {actionData && (
          <p className="text-red-500 text-xs italic p-2">{actionData}</p>
        )}

        <Form reloadDocument method="post" className="mb-0 space-y-6">
          <fieldset>
            <label className="block text-sm font-medium text-gray-700">
            <span className="text-red-500">*</span> Email
            </label>
            <input type="email" name="email" className={inputStyle} required />
          </fieldset>
          <fieldset>
            <label className="block text-sm font-medium text-gray-700">
            <span className="text-red-500">*</span> Password
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
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              <span className="text-red-500">*</span> Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </fieldset>
          <div className=" col-span-4 col-start-0 col-end-4 flex items-center">
            <input
              id="terms-and-privacy"
              name="terms-and-privacy"
              type="checkbox"
              required
              className="h-4 w-4 border-gray-300 rounded text-blue-700 focus:ring-orange-700"
              onChange={() => {
                const submitButton = document.getElementById("submit-button");
                const isChecked =
                  document.getElementById("terms-and-privacy").checked;
                submitButton.disabled = !isChecked;
                if (isChecked) {
                  submitButton.classList.remove(
                    "bg-gray-400",
                    "text-gray-700",
                    "cursor-not-allowed"
                  );
                } else {
                  submitButton.classList.add(
                    "bg-gray-400",
                    "text-gray-700",
                    "cursor-not-allowed"
                  );
                }
              }}
            />

            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{" "}
              <Link
                to="/terms"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Terms{" "}
              </Link>
              and
              <Link
                to="/terms"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {" "}
                Privacy Policy
              </Link>
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
      </div>
    </div>
  );
}
