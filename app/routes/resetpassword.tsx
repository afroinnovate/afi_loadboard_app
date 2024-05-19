import { useNavigation, Form, useActionData, Link, useRouteError } from "@remix-run/react";
import {
  type MetaFunction,
  type LinksFunction,
  type ActionFunction,
  json,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import { RequestResetPassword } from "~/api/services/auth.server";
import { FloatingLabelInput } from "~/components/FloatingInput";
import invariant from "tiny-invariant";
import { useState } from "react";
import ErrorDisplay from "~/components/ErrorDisplay";
import { XMarkIcon } from "@heroicons/react/16/solid";

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
      typeof email === "string" && email.length > 6 && email.includes("@") && email.includes("."),
      "Enter a valid email address"
    );

    await RequestResetPassword(email);
    return json({ success: true });
  } catch (error: any) {
    throw error
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
        <Link
          to="/login/"
          className="text-black--500 hover:text-gray-700 focus:outline-none flex justify-end"
        >
          <XMarkIcon className="h-6 w-6 ml-auto" />
        </Link>
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
              className={ isSubmitting ? "bg-gray-400 text-gray-700 cursor-not-allowed "
                        :"w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-400 bg-green-500" 
              }
            >
              {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
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
      message: "Something went wrong, try again later",
      status: 500
    }
    return <ErrorDisplay error={error} />
  }
}