import {
  useNavigation,
  Form,
  useActionData,
  Link,
  useRouteError,
} from "@remix-run/react";
import {
  type MetaFunction,
  type LinksFunction,
  type ActionFunction,
  json,
  redirect,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import { RequestResetPassword } from "~/api/services/auth.server";
import { FloatingLabelInput } from "~/components/FloatingInput";
import invariant from "tiny-invariant";
import { useState } from "react";
import ErrorDisplay from "~/components/ErrorDisplay";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { ErrorBoundary } from "~/components/errorBoundary";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Reset Password",
      description: "Request a password reset link",
    },
  ];
};

export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

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
    throw error;
  }
};

export default function ResetPasswordPage() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData: any = useActionData();
  const [showModal, setShowModal] = useState(true);

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-md max-h-full text-center relative">
        <Link
          to="/login/"
          className="absolute top-2 right-2 text-red-500 hover:text-white hover:bg-red-500 rounded-full p-1"
        >
          <XMarkIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold text-green-700 mb-6">
          Reset Your Password
        </h1>

        {actionData?.error && (
          <p className="text-red-500 text-sm mb-4">{actionData.error}</p>
        )}

        {actionData?.success ? (
          <div>
            <p className="text-green-600 mb-4">
              Check your email for the reset link. If you don't see the email,
              check your spam folder.
            </p>
            <Link
              to="/login/"
              className="inline-block px-6 py-2 text-white bg-green-600 rounded hover:bg-green-700 transition duration-200"
            >
              Close
            </Link>
          </div>
        ) : (
          <Form reloadDocument method="post" className="space-y-4 text-green-900">
            <fieldset>
              <FloatingLabelInput
                name="email"
                placeholder="Email"
                required
                minLength={6}
                type="email"
                onChange={() => {}}
              />
            </fieldset>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 rounded text-green-900  font-medium ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-200 border border-green-600 hover:bg-green-700 hover:text-white transition duration-200"
              }`}
            >
              {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}

<ErrorBoundary />;
