import {
  json,
  type LoaderFunction,
  type ActionFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { FloatingLabelInput } from "../components/FloatingInput";
import invariant from "tiny-invariant";
import { useState } from "react";
import { CompleteProfile } from "~/api/services/auth.server";
import type { CompleteProfileRequest } from "~/api/models/profileCompletionRequest";
import ErrorDisplay from "~/components/ErrorDisplay";

export const loader: LoaderFunction = async () => {
  return json({
    formData: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    roles: {
      Shipper: "shipper",
      Carrier: "carrier",
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const firstName = formData.get("firstName")?.toString().trim();
  const lastName = formData.get("lastName")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const role = formData.get("role")?.toString().trim();
  const middleName = formData.get("middleName")?.toString().trim();

  try {
    invariant(
      firstName && firstName.length >= 3,
      "First name must be at least 3 characters long."
    );
    invariant(
      lastName && lastName.length >= 3,
      "Last name must be at least 3 characters long."
    );
    invariant(
      email && /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(email),
      "Email must be a valid email format."
    );
    invariant(
      phone && /^(\+|0)[0-9]{9,13}$/.test(phone),
      "Phone number must start with + or 0 and be at least 10 digits long and less than 14."
    );

    const profile: CompleteProfileRequest ={
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: phone,
      role: role,
      middleName: middleName !== "" ? middleName : "",
    }
  
    await CompleteProfile(profile);
    return redirect(`/login/`);
  } catch (error: any) {
    console.error("Error during profile completion: ", error);
    return json({ error: { message: error.message, status: 400 } }, { status: error.status || 500});
  }
};

export default function ConfirmEmailPage() {
  const { formData, roles } = useLoaderData();
  const actionData: any = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [form, setForm] = useState({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    role: "",
    subRole: "",
    vehicles: {
      Trucks: false,
      Boats: false,
      Vans: false,
      Cargoes: false,
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };  

  const handleRoleChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      role: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div
        className="bg-white py-8 px-6 shadow-2xl rounded-lg sm:px-10"
        style={{ maxWidth: "600px" }}
      >
        <div>
          {actionData?.error && (
            <ErrorDisplay error={actionData.error} />
          )}
        </div>
        <Form method="post" className="space-y-8">
          <h2 className="text-lg font-bold text-center mb-4">
            Welcome to Loadboard! Please complete your profile.
          </h2>
          <FloatingLabelInput
            name="firstName"
            placeholder="* First Name"
            defaultValue={form.firstName}
            required
            minLength={3}
            onChange={handleInputChange}
          />
          <FloatingLabelInput
            name="middleName"
            placeholder="Middle Name"
            defaultValue={form.firstName}
            minLength={3}
            onChange={handleInputChange}
          />
          <FloatingLabelInput
            name="lastName"
            placeholder="* Last Name"
            defaultValue={form.lastName}
            required
            minLength={3}
            onChange={handleInputChange}
          />
          <FloatingLabelInput
            name="email"
            type="email"
            placeholder="* Email"
            defaultValue={form.email}
            required
            pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            onChange={handleInputChange}
          />
          <FloatingLabelInput
            name="phone"
            type="tel"
            placeholder="* Phone Number"
            defaultValue={form.phone}
            required
            pattern="^(\+|0)[0-9]{9,13}$"
            onChange={handleInputChange}
          />

          {/* Updated role selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              <span className="text-red-500 font">*</span> Role:
            </label>
            <select
              name="role"
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5"
              value={form.role}
              onChange={handleRoleChange}
              required
            >
              <option value="">Select Role</option>
              {Object.entries(roles).map(([name, value]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="mt-6 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-orange-400 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Completing Profile..." : "Complete Profile"}
          </button>
        </Form>
      </div>
    </div>
  );
}
