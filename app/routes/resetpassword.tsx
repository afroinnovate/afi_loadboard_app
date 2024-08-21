import React, { useState } from "react";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { ActionFunction, json } from "@remix-run/node";
import { RequestResetPassword } from "~/api/services/auth.server";
import invariant from "tiny-invariant";
import { ErrorBoundary } from "~/components/errorBoundary";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const email = body.get("email");

  try {
    invariant(
      typeof email === "string" &&
        email.length > 6 &&
        email.includes("@") &&
        email.includes("."),
      "Enter a valid email address"
    );

    await RequestResetPassword(email);
    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message }, { status: 400 });
  }
};

export const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const navigation = useNavigation();
  const actionData = useActionData();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-orange-500">
            AfroInnovate
          </h2>
          <h3 className="mt-2 text-center text-xl text-gray-300">
            Reset your password
          </h3>
        </div>
        <Form method="post" className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-gray-300 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm bg-gray-700"
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {actionData?.error && (
            <div className="text-red-500 text-sm">{actionData.error}</div>
          )}

          {actionData?.success && (
            <div className="text-green-500 text-sm">
              Check your email for the reset link. If you don't see the email,
              check your spam folder.
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              }`}
            >
              {isSubmitting ? "Sending Reset Link..." : "Reset Password"}
            </button>
          </div>
        </Form>

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