import React, { useState } from "react";
import {
  Form,
  useActionData,
  useNavigation,
  Link,
  useLoaderData,
} from "@remix-run/react";
import { type ActionFunction,type LoaderFunction, json } from "@remix-run/node";
import { ChangePassword } from "~/api/services/auth.server";
import { type PasswordResetRequest } from "~/api/models/passwordResetRequest";
import invariant from "tiny-invariant";
import { ErrorBoundary } from "~/components/errorBoundary";

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
    invariant(
      typeof password === "string" && password.length >= 8,
      "Password must be at least 8 characters long"
    );
    invariant(
      password.match(/[ `!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?~]/),
      "Password must contain a special character"
    );
    invariant(
      /[A-Z]/.test(password),
      "Password must contain at least one uppercase letter"
    );
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
    return json({ error: error.message }, { status: 400 });
  }
};

export const SetNewPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation();
  const actionData = useActionData();
  const { token, email } = useLoaderData<{ token: string; email: string }>();
  const isSubmitting = navigation.state === "submitting";

  const isPasswordValid =
    password !== "" &&
    password === confirmPassword &&
    password.length >= 8 &&
    password.match(/[ `!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?~]/) &&
    /[A-Z]/.test(password);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-orange-500">
            AfroInnovate
          </h2>
          <h3 className="mt-2 text-center text-xl text-gray-300">
            Set Your New Password
          </h3>
        </div>
        {actionData?.success ? (
          <div className="text-center">
            <p className="text-green-500 text-sm">
              Your password has been reset successfully. You can now log in with
              your new password.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <Form method="post" className="mt-8 space-y-6">
            <input type="hidden" name="token" value={token || ""} />
            <input type="hidden" name="email" value={email || ""} />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="password" className="sr-only">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-gray-300 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm bg-gray-700"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="py-4">
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-gray-300 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm bg-gray-700"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {actionData?.error && (
              <div className="text-red-500 text-sm">{actionData.error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={!isPasswordValid || isSubmitting}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  !isPasswordValid || isSubmitting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                }`}
              >
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </button>
            </div>
          </Form>
        )}
        <div className="text-center">
          <Link
            to="/login"
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

<ErrorBoundary />;
