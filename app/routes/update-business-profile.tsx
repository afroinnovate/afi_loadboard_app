// import customStyles from "../styles/global.css";
// import invariant from "tiny-invariant";
// import type {
//   MetaFunction,
//   LinksFunction,
//   LoaderFunction,
//   ActionFunction,
// } from "@remix-run/node";
// import { json, redirect } from "@remix-run/node";
// import {
//   Form,
//   useActionData,
//   useLoaderData,
//   useNavigation,
// } from "@remix-run/react";
// import { useState } from "react";
// import { CompleteProfileRequest } from "~/api/models/profileCompletionRequest";
// import { CompleteProfile } from "~/api/services/auth.server";

// export const meta: MetaFunction = () => {
//   return [
//     {
//       title: "Loadboard | Complete your registration",
//       description: "Complete your registration to access the loadboard.",
//     },
//   ];
// };

// export const links: LinksFunction = () => [
//   ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
// ];

// // Define a type for your loader data that matches the structure of the data you're returning.
// export type LoaderData = {
//   roles: {
//     [key: string]: string;
//   };
// };

// // // Your loader function
// export const loader: LoaderFunction = async () => {
//   // Here you can fetch and return any data needed for your form
//   const roles = {
//     "Support": "support",
//     "Admin": "admin",
//     "Owner Operator": "owner_operator_carrier",
//     "Fleet Owner": "fleet_owner_carrier",
//     "Company Driver": "company_carrier",
//     "Dispatcher": "dispatcher_carrier",
//     "Independent Shipper": "independent_shipper",
//     "Gov. Shipper": "gov_shipper",
//     "Corporate Shipper": "corporate_shipper",
//     // ... other roles
//   };

//   return json({ roles });
// };

// export const action: ActionFunction = async ({ request }) => {
//   const body = await request.formData();
//   const firstName = body.get("firstName");
//   const lastName = body.get("lastName");
//   const username = body.get("email");
//   const companyName = body.get("companyName");
//   const dotNumber = body.get("dotNumber");
//   const role = body.get("role");

//   var errorMessage = "";

//   try {
//     const profile: CompleteProfileRequest = {
//       firstName: firstName as string,
//       lastName: lastName as string,
//       username: username as string,
//       companyName: companyName as string,
//       dotNumber: dotNumber as string,
//       role: role as string,
//     };

//     // Server-side validation for email and password
//     invariant(
//       typeof username === "string" && username.length > 8,
//       "Enter a valid email address"
//     );
//     invariant(
//       typeof firstName === "string" && firstName.length >= 3,
//       "First Name must be at least 3 characters long"
//     );
//     invariant(
//       typeof lastName === "string" && lastName.length >= 3,
//       "Last Name must be at least 3 characters long"
//     );
//     invariant(
//       typeof dotNumber === "string" && dotNumber.length >= 6,
//       "Dot Number must be at least 6 characters long"
//     );
//     invariant(
//       typeof role === "string" && role.length > 0,
//       "Please select a role"
//     );

//     await CompleteProfile(profile);
//     return redirect(`/login/`);
//   } catch (error: any) {
//     switch (error.message) {
//       case "Invariant failed: Enter a valid email address":
//         errorMessage = error.message.replace("Invariant failed: ", "");
//         break;
//       case "Invariant failed: First Name must be at least 3 characters long":
//         errorMessage = error.message.replace("Invariant failed: ", "");
//         break;
//       case "Invariant failed: Last Name must be at least 3 characters long":
//         errorMessage = error.message.replace("Invariant failed: ", "");
//         break;
//       case "Invariant failed: Dot Number must be at least 6 characters long":
//         errorMessage = error.message.replace("Invariant failed: ", "");
//         break;
//       case "Invariant failed: Please select a role":
//         errorMessage = error.message.replace("Invariant failed: ", "");
//         break;
//       default:
//         errorMessage = "Oopse! Something went wrong. Please try again.";
//         break;
//     }
//     return errorMessage;
//   }
// };

// export default function ConfirmEmailPage() {
//   const { roles }: LoaderData = useLoaderData();
//   const inputStyle = `border border-slate-400 rounded py-2 px-3 inline-block w-full`;
//   const navigation = useNavigation();
//   const isSubmitting = navigation.state === "submitting";
//   const actionData: any = useActionData();

//   // State to track the selected role
//   const [selectedRole, setSelectedRole] = useState("");
//   const [vehicles, setVehicles] = useState({
//     Trucks: false,
//     Boats: false,
//     Vans: false,
//     Cargoes: false,
//   });

//   // Determine if the user is a Fleet Owner or Driver
//   const isFleetOwner = selectedRole.includes("fleet_owner");
//   const isOwnerOperator = selectedRole.includes("owner_operator");

//   const handleVehicleChange = (e: any) => {
//     const { name, checked } = e.target;
//     setVehicles((prevVehicles) => ({ ...prevVehicles, [name]: checked }));
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//       <div
//         className="bg-white py-8 px-6 shadow-2xl rounded-lg sm:px-10"
//         style={{ maxWidth: "600px" }}
//       >
//         <Form className="mb-0 space-y-6" method="post">
//           {/* <Form className="mb-0 space-y-6" method="post"> */}
//           <h2 className="text-lg font-bold text-center mb-4">
//             Welcome to loadboard! Please complete your profile.
//           </h2>
//           <p className="text-sm text-center mb-8">
//             Tell us a little bit more about you
//           </p>
//           {actionData && (
//             <p className="text-red-500 text-xs italic p-2">{actionData}</p>
//           )}
//           <div className="grid grid-cols-2 gap-4">

//             <input
//               type="email"
//               name="email"
//               className={inputStyle}
//               placeholder="* Your username"
//               required
//             />
//             <input
//               type="text"
//               name="firstName"
//               minLength={3}
//               className={inputStyle}
//               placeholder="* Your First Name"
//               required
//             />
//             <input
//               type="text"
//               name="lastName"
//               minLength={3}
//               className={inputStyle}
//               placeholder="* Your Last Name"
//               required
//             />
//             <input
//               type="text"
//               name="companyName"
//               minLength={3}
//               className={inputStyle}
//               placeholder="Company Name"
//             />
//             <input
//               type="text"
//               name="dotNumber"
//               minLength={6}
//               className={inputStyle}
//               placeholder="* Business Registration Number"
//               required
//             />
//             <select
//               name="role"
//               className={inputStyle}
//               onChange={(e) => setSelectedRole(e.target.value)}
//               required
//             >
//               <option defaultChecked value="">
//                 * Select Role
//               </option>

//               {Object.entries(roles).map(([name, value]) => (
//                 <option key={value} value={value}>
//                   {name}
//                 </option>
//               ))}
//             </select>

//             {/* Conditional Vehicle Type and Quantity Inputs */}

//             {/* Conditional Vehicle Type and Quantity Inputs */}
//             {isOwnerOperator && (
//               <div className="col-span-2 flex flex-wrap gap-4">
//                 {["Trucks", "Boats", "Vans", "Cargoes"].map((vehicle) => (
//                   <div key={vehicle}>
//                     <label className="px-4">
//                       <input
//                         type="checkbox"
//                         name={vehicle}
//                         onChange={handleVehicleChange}
//                       />
//                       {vehicle}
//                     </label>
//                     {vehicles[vehicle] && (
//                       <input
//                         type="number"
//                         name={`${vehicle.toLowerCase()}Quantity`}
//                         className="w-20"
//                         placeholder="Qty"
//                       />
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {isFleetOwner && (
//               <div className="col-span-2 flex flex-wrap gap-4">
//                 <div>
//                   <p>Fleet:</p>
//                   <label className="px-4">
//                     <input type="checkbox" name="vehicleType" value="Trucks" />{" "}
//                     Trucks
//                   </label>
//                   <label className="px-4">
//                     <input type="checkbox" name="vehicleType" value="Boats" />{" "}
//                     Boats
//                   </label>
//                   <label className="px-4">
//                     <input type="checkbox" name="vehicleType" value="Vans" />{" "}
//                     Vans
//                   </label>
//                   <label className="px-4">
//                     <input type="checkbox" name="vehicleType" value="Cargoes" />{" "}
//                     Cargoes
//                   </label>
//                 </div>
//               </div>
//             )}

//             {/* Conditional Fleet Size Radios */}
//             {selectedRole === "fleet_owner_carrier" && (
//               <div className="col-span-2">
//                 <p>Fleet Size:</p>
//                 <label className="px-6">
//                   <input type="radio" name="fleetSize" value="1-2" /> 1-2
//                 </label>
//                 <label className="px-6">
//                   <input type="radio" name="fleetSize" value="3-10" /> 3-10
//                 </label>
//                 <label className="px-4">
//                   <input type="radio" name="fleetSize" value="11-25" /> 11-25
//                 </label>
//                 <label className="px-3">
//                   <input type="radio" name="fleetSize" value="26-50" /> 26-50
//                 </label>
//                 <label className="px-5">
//                   <input type="radio" name="fleetSize" value="50+" /> 50+
//                 </label>
//               </div>
//             )}
//           </div>
//           <button
//             type="submit"
//             className="mt-6 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-orange-400"
//           >
//             {isSubmitting ? "Completing Profile..." : "Complete Profile"}
//           </button>
//         </Form>
//       </div>
//     </div>
//   );
// }

// app/routes/confirmEmail.tsx

import {
  json,
  type LoaderFunction,
  type ActionFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { FloatingLabelInput } from "../components/FloatingInput";
import invariant from "tiny-invariant";
import { useEffect, useState } from "react";
import { CompleteProfile } from "~/api/services/auth.server";
import { CompleteProfileRequest } from "~/api/models/profileCompletionRequest";

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
      // "Owner Operator": "owner_operator_carrier",
      // "Fleet Owner": "fleet_owner_carrier",
      // "Dispatcher": "dispatcher_carrier",
      // "Independent Shipper": "independent_shipper",
      // "Gov't Shipper": "gov_shipper",
      // "Corporate Shipper": "corporate_shipper",
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const firstName = formData.get("firstName")?.toString().trim();
  const lastName = formData.get("lastName")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  // const vehiclyType = formData.get("vehicleType")?.toString().trim();
  // const quantity = formData.get("quantity")?.toString().trim();
  const role = formData.get("role")?.toString().trim();
  // const shipperType = formData.get("shipperType")?.toString().trim();

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
      firstName,
      lastName,
      email,
      phone,
      role: role
    }
  
    await CompleteProfile(profile);
    return redirect(`/login/`);
  } catch (error: any) {
    console.error("Error during profile completion: ", error);
    return json({ error: error.message }, { status: 400 });
  }
};

export default function UpdateBusinessProfile() {
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
    // const { name, value, type, checked } = e.target;
    const { name, value } = e.target;
    // if (type === "number") {
    //   setForm(prev => ({
    //     ...prev,
    //     vehicles: {
    //       ...prev.vehicles,
    //       [`${name}`]: parseInt(value, 10) || 0 // Ensure the number is parsed correctly
    //     }
    //   }));
    // } else if (type === "checkbox") {
    //   setForm(prev => ({
    //     ...prev,
    //     vehicles: {
    //       ...prev.vehicles,
    //       [name]: checked
    //     }
    //   }));
    // } else {
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
      // subRole: "", // Reset subRole on role change
    }));
  };

  // const handleSubRoleChange = (value) => {
  //   setForm((prev) => ({
  //     ...prev,
  //     subRole: value,
  //   }));
  // };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div
        className="bg-white py-8 px-6 shadow-2xl rounded-lg sm:px-10"
        style={{ maxWidth: "600px" }}
      >
        {actionData?.error && (
          <p className="text-red-500">{actionData.error}</p>
        )}
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

          {/* Dynamic sub-role selection based on role
          {form.role === "shipper" && (
            <div className="mb-6">
              <fieldset>
                <legend className="block text-sm font-medium mb-2">
                  * Type of Shipper:
                </legend>
                {[
                  "Gov't Shipper",
                  "Corporate Shipper",
                  "Independent Shipper",
                ].map((type) => (
                  <label key={type} className="block">
                    <input
                      type="radio"
                      name="shipperType"
                      value={type.toLowerCase().replace(/\s/g, "_")}
                      checked={
                        form.subRole === type.toLowerCase().replace(/\s/g, "_")
                      }
                      onChange={() =>
                        handleSubRoleChange(
                          type.toLowerCase().replace(/\s/g, "_")
                        )
                      }
                      className="mr-2"
                    />
                    {type}
                  </label>
                ))}
              </fieldset>
            </div>
          )} */}

          {/* {form.role === "carrier" && (
            <div className="mb-6">
              <fieldset>
                <legend className="block text-sm font-medium mb-2">
                  * Type of Carrier:
                </legend>
                {["Fleet Owner", "Owner Operator", "Dispatcher"].map((type) => (
                  <label key={type} className="block">
                    <input
                      type="radio"
                      name="carrierType"
                      value={type.toLowerCase().replace(/\s/g, "_")}
                      checked={
                        form.subRole === type.toLowerCase().replace(/\s/g, "_")
                      }
                      onChange={() =>
                        handleSubRoleChange(
                          type.toLowerCase().replace(/\s/g, "_")
                        )
                      }
                      className="mr-2"
                    />
                    {type}
                  </label>
                ))} */}

                {/* Conditional Vehicle Type and Quantity Inputs
                {form.subRole === "fleet_owner" && (
                  <div className="col-span-2 flex flex-wrap gap-4">
                    {["Trucks", "Boats", "Vans", "Cargoes"].map((vehicle) => (
                      <div key={vehicle}>
                        <label className="px-2">
                          <input
                            type="checkbox"
                            name='vehicleType'
                            checked={form.vehicles[vehicle.trim()]}
                            onChange={handleInputChange}
                          />
                          {vehicle}
                        </label>
                        {form.vehicles[vehicle.trim()] && (
                          <input
                            type="number"
                            name='quantity'
                            value={form.vehicles[`${vehicle.trim().toLowerCase()}Quantity`]}  // Ensures a fallback value of 0
                            onChange={handleInputChange}
                            className="w-11 h-5 p-2"
                            placeholder="Qty"
                            min="1"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )} */}

                {/* {form.subRole === "owner_operator" && (
                  <div className="col-span-2 flex flex-wrap gap-4">
                    <div>
                      <label className="px-4">
                        <input
                          type="checkbox"
                          name="vehicleType"
                          value="Trucks"
                        />{" "}
                        Truck
                      </label>
                      <label className="px-4">
                        <input
                          type="checkbox"
                          name="vehicleType"
                          value="Boats"
                        />{" "}
                        Boat
                      </label>
                      <label className="px-4">
                        <input
                          type="checkbox"
                          name="vehicleType"
                          value="Vans"
                        />{" "}
                        Van
                      </label>
                      <label className="px-4">
                        <input
                          type="checkbox"
                          name="vehicleType"
                          value="Cargoes"
                        />{" "}
                        Cargoe
                      </label>
                    </div>
                  </div>
                )}
              </fieldset>
            </div>
          )} */}
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
