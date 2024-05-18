// app/routes/account/profile.tsx
import { type MetaFunction, json, type LinksFunction, ActionFunction } from "@remix-run/node";
import customStyles from "../styles/global.css";
import { PencilIcon } from "@heroicons/react/20/solid";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { FloatingLabelInput } from "~/components/FloatingInput";
import { FloatingPasswordInput } from "~/components/FloatingPasswordInput";

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

const userData = {
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YzEzNGVmMC1lZmY4LTQ2NmUtOTU1ZS1lMTk1NzAwZDg2OTYiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYWZpbHlfbmFtZSI6IldhciIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiN2MxMzRlZjAtZWZmOC00NjZlLTk1NWUtZTE5NTcwMGQ4Njk2IiwianRpIjoiYmJmNmZhOTEtOTljYy00NzAxLWJkZWUtNWRkMWY3MWJhZTdmIiwibmJmIjoxNzE1ODYwMTMwLCJleHAiOjE3MTU4NjM3MzUsImlhdCI6MTcxNTg2MDEzNSwiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.m24wLWyItr-658y3ewUgh1rex8hOjvbxM_MCDeodp9s",
  tokenType: "Bearer",
  refreshToken: "eyJhbGci",
  expiresIn: 3600,
  user: {
    id: "7c134ef0-eff8-466e-955e-e195700d8696",
    userName: "tangotew@gmail.com",
    email: "tangotew@gmail.com",
    firstName: "Tango",
    lastName: "War",
    roles: ["carrier"],
    phoneNumber: "+15806471212",
  },
};

export let loader = async ({ request }) => {
  try {
    const user: any = userData;
    if (!user) {
      throw JSON.stringify({
        data: {
          message: "Unauthorized",
          status: 401,
        },
      });
    }

    return json({ user });
  } catch (e: any) {
    if (JSON.parse(e).data.status === 401) {
      return "/";
    }
    throw e;
  }
};

export let action: ActionFunction = async ({ request }) => {
  // const session = await getSession(request.headers.get("Cookie"));
  // const user = session.get("user");

  const user: any = userData;

  if (!user) {
    throw JSON.stringify({
      data: {
      message: "Unauthorized", 
      status: 401 
    }});
  }

  const formData = await request.formData();
  console.log("formData: ", formData);
}

export default function Profile() {
  const LoaderData: any = useLoaderData();
  const user = LoaderData?.user?.user;

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingField, setIsEditingField] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = (
    name: string,
    value: string,
  ) => {
    if (name === "newpassword") {
      setNewPassword(value);
    } else if (name === "confirmpassword") {
      setConfirmPassword(value);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      <Form method="post">
        {/* Email Row */}
        <div className="mb-4 flex items-center justify-between">
          <div>
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
          {/* <button
            type="button"
            onClick={() =>
              setIsEditingField(isEditingField === "email" ? null : "email")
            }
            className="text-blue-500 hover:text-blue-700"
          >
            <PencilIcon className="w-4 h-4 hover:text-orange-400" />
          </button> */}
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
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditingField(null);
                setIsEditingPassword(false);
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
