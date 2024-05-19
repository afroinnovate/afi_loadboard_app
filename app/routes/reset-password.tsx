import { useNavigation, Form, useActionData, Link, useLoaderData, useRouteError } from "@remix-run/react";
import {
  type MetaFunction,
  type LinksFunction,
  type ActionFunction,
  json,
  type LoaderFunction,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import { FloatingPasswordInput } from "~/components/FloatingPasswordInput";
import invariant from "tiny-invariant";
import { useState } from "react";
import { ChangePassword } from "~/api/services/auth.server";
import ErrorDisplay from "~/components/ErrorDisplay";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { PasswordResetRequest } from "~/api/models/passwordResetRequest";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Set New Password",
      description: "Set your new password",
    },
  ];
};

export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];


export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");

  if (!token || !email) {
    throw new Response("Invalid reset link", { status: 400 });
  }

  return json({ token, email });
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const password = body.get("password");
  const token = body.get("token");
  const email = body.get("email");

  try {
    invariant(typeof password === "string" && password.length >= 8, "Password must be at least 8 characters long");
    invariant(password.match(/[ `!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?~]/), "Password must contain a special character");
    invariant(/[A-Z]/.test(password), "Password must contain at least one uppercase letter");
    invariant(typeof token === "string" && token.length > 0, "Invalid token");
    invariant(typeof email === "string" && email.length > 0, "Invalid email");
    
    const request: PasswordResetRequest = {
      email,
      newPassword: password,
      token,
    };
    await ChangePassword(request);
    return json({ success: true });
  } catch (error: any) {
    throw error;
  }
};

export default function NewPasswordPage() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData: any = useActionData();
  const { token, email } = useLoaderData<{ token: string; email: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = (name: string, value: string) => {
    if (name === "password") {
      setPassword(value);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    }
  };

  const isPasswordValid = password !== "" && password === confirmPassword;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div
        className="bg-white py-8 px-6 shadow-2xl rounded-lg sm:px-10"
        style={{ maxWidth: "600px" }}
      >
        <Link
          to="/login/"
          className="text-black--500 hover:text-gray-700 focus:outline-none flex justify-end"
        >
          <XMarkIcon className="h-6 w-6 ml-auto" />
        </Link>
        <h1 className="text-center text-2xl font-extrabold text-green-900 py-4">
          Set Your New Password
        </h1>

        {actionData?.error && (
          <p className="text-red-500 text-xs italic p-2">{actionData.error}</p>
        )}

        {actionData?.success ? (
          <div className="text-center">
            <p className="text-green-500 text-xs italic p-2">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Link
              to="/login"
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <Form reloadDocument method="post" className="mb-0 space-y-6">
            <input type="hidden" name="token" value={token || ""} />
            <input type="hidden" name="email" value={email|| ""} />
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
                name="confirmPassword"
                placeholder="Confirm Password"
                required
                newPassword={password}
                onChange={(name, value) => handlePasswordChange(name, value)}
              />
            </fieldset>
            <button
              type="submit"
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isPasswordValid
                  ? "bg-green-500 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
              disabled={!isPasswordValid || isSubmitting}
            >
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  try{
    const errorResponse: any = useRouteError();
    const jsonError = JSON.parse(errorResponse);
    const error = {
      message: jsonError.data.message,
      status: jsonError.data.status,
    };

    return <ErrorDisplay error={error} />;
  }catch(e){
    const error = {
      message: "Something went wrong while tryig to reset the password, try again later",
      status: 500
    }
    return <ErrorDisplay error={error} />
  }
}