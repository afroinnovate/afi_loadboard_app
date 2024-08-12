// app/routes/account/profile.tsx
import {
  type MetaFunction,
  json,
  type LinksFunction,
  type ActionFunction,
  redirect,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import { PencilIcon } from "@heroicons/react/20/solid";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import { useState } from "react";
import { FloatingLabelInput } from "~/components/FloatingInput";
import { FloatingPasswordInput } from "~/components/FloatingPasswordInput";
import invariant from "tiny-invariant";
import {
  authenticator,
  UpdatePasswordInProfile,
} from "~/api/services/auth.server";
import ErrorDisplay from "~/components/ErrorDisplay";
import { commitSession, getSession } from "~/api/services/session";
import { type PasswordUpdateRequest } from "~/api/models/paswordUpdateRequest";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Account Management",
      description: "Manage your account settings.",
    },
  ];
};
export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

export let loader = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);
    
    const carrierProfile = session.get("carrier");
    const shipperProfile = session.get("shipper");

    if (!user) {
      return redirect("/login/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    return carrierProfile ?
      json({ user, carrierProfile }, { status: 200 }) :
      json({ user, shipperProfile }, { status: 200 });
  } catch (e: any) {
    if (JSON.parse(e).data.status === 401) {
      const session = await getSession(request.headers.get("Cookie"));
      session.set("user", null);
      session.set("carrier", null);
      session.set("shipper", null);
      return redirect("/login/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
      );
    }
    throw e;
  }
};

export let action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  const carrierProfile = session.get("carrier");
 const shipperProfile = session.get("shipper"); 
  // const user: any = userData;
  if (!user) {
    return json({ error: "Unauthorized", status: 401 }, { status: 401 });
  }

  const body = await request.formData();
  const currentPassword = body.get("password");
  const password = body.get("newpassword");
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

    const request: PasswordUpdateRequest = {
      email: email?.toString() || "",
      currentPassword: currentPassword?.toString() || "",
      newPassword: password,
    };

    const response = await UpdatePasswordInProfile(request);
    if (response.status === 200) {
      session.set(authenticator.sessionKey, null);
      session.set("carrier", null);
      session.set("shipper", null);
      return redirect("/login/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  } catch (error: any) {
    return json({ error: error.message }, { status: 400 });
  }
};

export default function Profile() {
  const navigation = useNavigation();
  const LoaderData: any = useLoaderData();
  const actionData: any = useActionData();
  const user = LoaderData?.user?.user;
  const isSubmitting = navigation.state === "submitting";
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingField, setIsEditingField] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const navigate = useNavigate();

  const isPasswordValid = newPassword !== "" && newPassword === confirmPassword;

  // useEffect(() => {
  //   if (actionData?.success) {
  //     navigate("/carrier/dashboard/account/profile");
  //   }
  // }, [actionData, navigate]);

  const handlePasswordChange = (name: string, value: string) => {
    if (name === "newpassword") {
      setNewPassword(value);
    } else if (name === "confirmpassword") {
      setConfirmPassword(value);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
      {actionData?.error && (
        <p className="text-red-500 text-xs italic p-2 m-4">
          {actionData.error}
        </p>
      )}
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      <Form method="post">
        {/* Email Row */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <input type="hidden" name="email" value={user.email} />
            {isEditingField === "email" ? (
              <FloatingLabelInput
                type="email"
                name="email"
                defaultValue={user.email}
                minLength={6}
                required
                placeholder="Email"
                onChange={() => {}}
              />
            ) : (
              <span className="rounded mt-1">{user.email}</span>
            )}
          </div>
        </div>

        {/* Name Row */}
        <div className="mb-4 flex items-center justify-between border-w-full">
          <div>
            <label className="block text-gray-700">
              {user.firstName} {user.lastName}
            </label>
          </div>
        </div>

        {/* Password Row */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            {isEditingPassword ? (
              <div>
                <span className="block text-gray-700">
                  <FloatingPasswordInput
                    name="password"
                    placeholder="Current Password"
                    required
                    onChange={() => {}}
                  />
                </span>
                <span className="block text-gray-700 mt-7">
                  <FloatingPasswordInput
                    name="newpassword"
                    placeholder="New Password"
                    required
                    onChange={handlePasswordChange}
                  />
                </span>
                <span className="block text-gray-700 mt-7">
                  <FloatingPasswordInput
                    name="confirmpassword"
                    placeholder="Confirm Password"
                    required
                    onChange={handlePasswordChange}
                    newPassword={newPassword}
                  />
                </span>
              </div>
            ) : (
              <span className="rounded">********</span>
            )}
          </div>
          {!isEditingPassword && (
            <button
              type="button"
              onClick={() => setIsEditingPassword(true)}
              className="text-blue-500 hover:text-blue-700"
            >
              <PencilIcon className="w-4 h-4 hover:text-orange-400" />
            </button>
          )}
        </div>

        {/* Save and Cancel Buttons */}
        {(isEditingField || isEditingPassword) && (
          <div className="mt-4">
            <button
              type="submit"
              className={`px-4 py-2 rounded text-white ${
                isPasswordValid
                  ? "bg-green-500 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
              disabled={!isPasswordValid || isSubmitting}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditingField(null);
                setIsEditingPassword(false);
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="ml-4 bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const errorResponse: any = useRouteError();
  try {
    const jsonError = JSON.parse(errorResponse);
    const error = {
      message: jsonError.data.message,
      status: jsonError.data.status,
    };

    return <ErrorDisplay error={error} />;
  } catch (e) {
    const error = {
      message:
        "Your Current password is wrong or the new password does not meet the requirements. Please try again.",
      status: 400,
    };
    return <ErrorDisplay error={error} />;
  }
}
