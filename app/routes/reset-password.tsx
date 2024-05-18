import { useNavigation, Form, useActionData, useSearchParams, Link } from "@remix-run/react";
import {
  type MetaFunction,
  type LinksFunction,
  type ActionFunction,
  json,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import { FloatingPasswordInput } from "~/components/FloatingPasswordInput";
import invariant from "tiny-invariant";
import { useState } from "react";

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

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const password = body.get("password");
  const confirmPassword = body.get("confirmPassword");
  const token = body.get("token");
  const email = body.get("email");

  try {
    invariant(typeof password === "string" && password.length >= 8, "Password must be at least 8 characters long");
    invariant(password.match(/[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/), "Password must contain a special character");
    invariant(/[A-Z]/.test(password), "Password must contain at least one uppercase letter");
    invariant(typeof confirmPassword === "string" && confirmPassword === password, "Passwords must match");
    invariant(typeof token === "string" && token.length > 0, "Invalid token");
    invariant(typeof email === "string" && email.length > 0, "Invalid email");

    // await UpdatePassword({ password, token, email });
    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message }, { status: 400 });
  }
};

export default function NewPasswordPage() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData: any = useActionData();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = (name: string, value: string) => {
    if (name === "password") {
      setPassword(value);
    } else if (name === "confirmPassword") {
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
            <input type="hidden" name="token" value={searchParams.get("token") || ""} />
            <input type="hidden" name="email" value={searchParams.get("email") || ""} />
            <fieldset>
              <FloatingPasswordInput
                name="password"
                placeholder="New Password"
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
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 ${
                isSubmitting || !confirmPassword ? "hover:bg-gray-500 hover:text-white cursor-not-allowed":  "bg-green-500"
              }`}
              disabled={!confirmPassword || isSubmitting}
            >
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}
