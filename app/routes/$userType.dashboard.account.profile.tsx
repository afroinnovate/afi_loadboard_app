import { useState } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useOutletContext,
  Link,
} from "@remix-run/react";
import { ErrorBoundary } from "~/components/errorBoundary";
import { PencilIcon } from "lucide-react";
import { FloatingLabelInput } from "~/components/FloatingInput";
import { FloatingPasswordInput } from "~/components/FloatingPasswordInput";
import { type ActionFunction, json, type LoaderFunction, redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/api/services/session";
import { authenticator, UpdatePasswordInProfile } from "~/api/services/auth.server";
import invariant from "tiny-invariant";
import { type PasswordUpdateRequest } from "~/api/models/paswordUpdateRequest";

export const loader: LoaderFunction = async ({ params, request }: any) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);
    
    if (!user) {
      console.log("no auth user found");
      return redirect("/logout/");
    }

    let { userType } = params;
    userType = userType === user?.user.userType ? userType : user?.user.userType;
    
    if (!userType) {
      return redirect("/logout/");
    }
    const userTypeFiltered = userType === "carriers" ? "carrier" : userType;

    
    const userProfile = session.get(userTypeFiltered);

    if (!userProfile) {
      console.log("no user profile found");
      return redirect("/logout/");
    }

    return json(
      { user, userType },
      { headers: { "Set-Cookie": await commitSession(session) } }
    );
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

interface OutletContext {
  theme: string;
}

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
  const { theme }: OutletContext = useOutletContext();

  const isPasswordValid = newPassword !== "" && newPassword === confirmPassword;

  const handlePasswordChange = (name: string, value: string) => {
    if (name === "newpassword") {
      setNewPassword(value);
    } else if (name === "confirmpassword") {
      setConfirmPassword(value);
    }
  };

  const themeClasses = {
    container: theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900",
    header: theme === "dark" ? "text-green-400" : "text-green-700",
    input: theme === "dark"
      ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500",
    button: theme === "dark"
      ? "bg-green-600 text-white hover:bg-green-700"
      : "bg-green-500 text-white hover:bg-green-600",
    cancelButton: theme === "dark"
      ? "bg-gray-600 text-white hover:bg-gray-700"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    editIcon: theme === "dark"
      ? "text-blue-400 hover:text-orange-300"
      : "text-blue-600 hover:text-orange-500",
    cardBorder: theme === "dark" ? "border-green-700" : "border-green-500",
    text: theme === "dark" ? "text-gray-300" : "text-gray-700",
    formBackground: theme === "dark" ? "bg-gray-800" : "bg-gray-50",
  };

  const dashboardUrl = `/${user.userType}/dashboard`;

  return (
    <div className={`w-full p-4 ${themeClasses.container}`}>
      <div className="mb-4">
        <Link
          to={`/${LoaderData.userType}/dashboard/`}
          className={`inline-block px-4 py-2 rounded ${themeClasses.button}`}
        >
          Back to Dashboard
        </Link>
      </div>
      
      {actionData?.error && (
        <p className="text-red-500 text-xs italic mb-4">{actionData.error}</p>
      )}
      <Form method="post" className={`shadow-lg rounded-lg p-6 border ${themeClasses.cardBorder} ${themeClasses.formBackground}`}>
        <div className="space-y-4 max-w-full">
          {/* Email Row */}
          <div className={`flex justify-between items-center border-b py-3 ${themeClasses.border}`}>
            <span className={`font-semibold ${themeClasses.header}`}>Email:</span>
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
                  className={themeClasses.input}
                  theme={theme}
                />
              ) : (
                <span className={themeClasses.text}>{user.email}</span>
              )}
            </div>
          </div>

          {/* Name Row */}
          <div className={`flex justify-between items-center border-b py-3 ${themeClasses.border}`}>
            <span className={`font-semibold ${themeClasses.header}`}>Name:</span>
            <span className={themeClasses.text}>
              {user.firstName} {user.lastName}
            </span>
          </div>

          {/* Password Row */}
          <div className={`flex justify-between items-center border-b py-2 ${themeClasses.border}`}>
            <div className="flex items-center w-full">
              {isEditingPassword ? (
                <div className="space-y-7 w-full">
                  <FloatingPasswordInput
                    name="password"
                    placeholder="Current Password"
                    required
                    onChange={() => {}}
                    className={themeClasses.input}
                    theme={theme}
                  />
                  <FloatingPasswordInput
                    name="newpassword"
                    placeholder="New Password"
                    required
                    onChange={handlePasswordChange}
                    className={themeClasses.input}
                    theme={theme}
                  />
                  <FloatingPasswordInput
                    name="confirmpassword"
                    placeholder="Confirm Password"
                    required
                    onChange={handlePasswordChange}
                    newPassword={newPassword}
                    className={themeClasses.input}
                    theme={theme}
                  />
                </div>
              ) : (
                <div className="flex justify-between w-full">
                  <span className={`font-semibold ${themeClasses.header}`}>Password:</span>
                  <span className={`${themeClasses.text}`}>********</span>
                </div>
              )}
              {!isEditingPassword && (
                <button
                  type="button"
                  onClick={() => setIsEditingPassword(true)}
                  className={`ml-2 ${themeClasses.editIcon}`}
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
              className={`px-4 py-2 rounded ${themeClasses.cancelButton}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded text-white ${
                isPasswordValid
                  ? themeClasses.button
                  : theme === "dark"
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
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