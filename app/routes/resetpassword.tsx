import { useNavigation, Form, useActionData, Link } from "@remix-run/react";
import {
  type MetaFunction,
  type LinksFunction,
  type ActionFunction,
  json,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import { ResetPassword } from "~/api/services/auth.server";
import { FloatingLabelInput } from "~/components/FloatingInput";
import invariant from "tiny-invariant";
import { useState } from "react";

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
      typeof email === "string" && email.length > 6,
      "Enter a valid email address"
    );

    // await ResetPassword(email);
    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message }, { status: 400 });
  }
};

export default function ResetPasswordPage() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData: any = useActionData();
  const [showModal, setShowModal] = useState(true);

  const handleClose = () => {
    setShowModal(false); // Hide the modal
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div
        className="bg-white bg-opacity-90 py-8 px-6 shadow-2xl rounded-lg sm:px-10"
        style={{ maxWidth: "600px" }}
      >
        <h1 className="text-center text-2xl font-extrabold text-green-1000 py-4">
          Reset Your Password
        </h1>

        {actionData?.error && (
          <p className="text-red-500 text-xs italic p-2 m-4">
            {actionData.error}
          </p>
        )}

        {actionData?.success ? (
          <div className="text-center">
            <p className="text-green-500 text-xs italic p-2">
              Check your email for the reset link. If you don't see the email,
              check your spam folder.
            </p>
            <Link
              to="/login/"
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
            >
              Close
            </Link>
          </div>
        ) : (
          <Form reloadDocument method="post" className="mb-0 space-y-6">
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
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-orange-400 ${
                isSubmitting
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  :"bg-green-500" 
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
