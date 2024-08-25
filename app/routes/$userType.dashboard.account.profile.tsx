import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { type ActionFunction, json, type LoaderFunction, redirect } from "@remix-run/node";
import { ErrorBoundary } from "~/components/errorBoundary";
import { authenticator, UpdatePasswordInProfile } from "~/api/services/auth.server";
import { getSession, commitSession } from "~/api/services/session";
import invariant from "tiny-invariant";
import { type PasswordUpdateRequest } from "~/api/models/paswordUpdateRequest";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { FloatingLabelInput } from "~/components/FloatingInput";
import { FloatingPasswordInput } from "~/components/FloatingPasswordInput";

export const loader: LoaderFunction = async ({ params, request }: any) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);
    if (!user) {
      console.log("no auth user found");
      return redirect("/login/");
    }

    let { userType } = params;
    userType = userType === user?.user.userType ? userType : user?.user.userType;
    
    if (!userType) {
      return redirect("/logout/");
    }
    const userTypeFiltered = userType === "carriers" ? "carrier" : userType;
    console.log("user type: ", userTypeFiltered);
    
    const userProfile = session.get(userTypeFiltered);
    console.log("user profile: ", userProfile);
    if (!userProfile) {
      console.log("no user profile found");
      return redirect("/logout/");
    }

    return json({ user, userType }, { status: 200 });
  } catch (error: any) {
    console.log("Profile Error: ", error);
    if (JSON.parse(error).data.status === 401) {
      return redirect("/logout/");
    }
    throw error;
  }
};

export let action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const carrierProfile = session.get("carrier");
  const shipperProfile = session.get("shipper");

  if (!carrierProfile && !shipperProfile) {
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
      return redirect("/logout/");
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

  const isPasswordValid = newPassword !== "" && newPassword === confirmPassword;

  const handlePasswordChange = (name: string, value: string) => {
    if (name === "newpassword") {
      setNewPassword(value);
    } else if (name === "confirmpassword") {
      setConfirmPassword(value);
    }
  };

  return (
    <div className="w-full">
      {actionData?.error && (
        <p className="text-red-500 text-xs italic mb-4">{actionData.error}</p>
      )}
      <Form method="post">
        <div className="space-y-4 max-w-full">
          {/* Email Row */}
          <div className="flex justify-between items-center border-b py-3">
            <span className="font-semibold text-green-700">Email:</span>
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
                <span>{user.email}</span>
              )}
            </div>
          </div>

          {/* Name Row */}
          <div className="flex justify-between items-center border-b py-3">
            <span className="font-semibold text-green-700">Name:</span>
            <span>
              {user.firstName} {user.lastName}
            </span>
          </div>

          {/* Password Row */}
          <div className="flex justify-between items-center border-b py-2 space-x-4 ">
            <div className="flex items-center ">
              {isEditingPassword ? (
                <div className="space-y-7">
                  <FloatingPasswordInput
                    name="password"
                    placeholder="Current Password"
                    required
                    onChange={() => {}}
                  />
                  <FloatingPasswordInput
                    name="newpassword"
                    placeholder="New Password"
                    required
                    onChange={handlePasswordChange}
                  />
                  <FloatingPasswordInput
                    name="confirmpassword"
                    placeholder="Confirm Password"
                    required
                    onChange={handlePasswordChange}
                    newPassword={newPassword}
                  />
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="font-semibold text-green-700 items-start">
                    Password:
                  </span>
                  <span className="ml-12 items-end">********</span>
                </div>
              )}
              {!isEditingPassword && (
                <button
                  type="button"
                  onClick={() => setIsEditingPassword(true)}
                  className="ml-2 text-blue-500 hover:text-orange-400"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Save and Cancel Buttons */}
        {(isEditingField || isEditingPassword) && (
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setIsEditingField(null);
                setIsEditingPassword(false);
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded text-white ${
                isPasswordValid
                  ? "bg-green-500 hover:bg-orange-400"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
              disabled={!isPasswordValid || isSubmitting}
            >
              Save Changes
            </button>
          </div>
        )}
      </Form>
    </div>
  );
}

<ErrorBoundary />;