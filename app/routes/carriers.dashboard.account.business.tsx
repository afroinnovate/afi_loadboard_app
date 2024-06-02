import {
  type MetaFunction,
  json,
  type LinksFunction,
  type ActionFunction,
  redirect,
  type LoaderFunction,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import {
  Form,
  useActionData,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { FloatingLabelInput } from "~/components/FloatingInput";
import { getSession } from "~/api/services/session";
import invariant from "tiny-invariant";
import ErrorDisplay from "~/components/ErrorDisplay";
import { Link } from "@remix-run/react";
import { PencilIcon } from "@heroicons/react/16/solid";
import DocumentUpload from "~/components/documentupload";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Business Information",
      description: "Provide and manage your business information.",
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
    middleName: "Alpha",
    lastName: "War",
    roles: ["carrier"],
    companyDetails: "CA1247",
    phoneNumber: "+15806471212",
    status: "Not Approved",
  },
};

export let loader: LoaderFunction = async ({ request }) => {
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

    const roles = user.user.roles.includes("carrier")
      ? {
          "Owner Operator": "owner_operator",
          "Fleet Owner": "fleet_owner",
          Dispatcher: "dispatcher",
        }
      : {
          "Independent Shipper": "independent_shipper",
          "Government Shipper": "government_shipper",
          "Corporate Shipper": "corporate_shipper",
        };

    return json({ user, roles });
  } catch (e: any) {
    if (JSON.parse(e).data.status === 401) {
      return redirect("/login/");
    }
    throw e;
  }
};

export let action: ActionFunction = async ({ request }) => {
  const user: any = userData;
  if (!user) {
    return json({ error: "Unauthorized", status: 401 }, { status: 401 });
  }

  const body = await request.formData();
  const firstName = body.get("firstName");
  const middleName = body.get("middleName");
  const lastName = body.get("lastName");
  const phoneNumber = body.get("phoneNumber");
  const email = body.get("email");
  const role = body.get("role");
  const action = body.get("_action");

  try {
    invariant(typeof firstName === "string", "First name is required");
    invariant(typeof lastName === "string", "Last name is required");
    invariant(typeof email === "string", "Email is required");
    invariant(typeof phoneNumber === "string", "Phone number is required");
    invariant(typeof role === "string", "Role is required");

    // Perform the update logic here with the updated user data

    return redirect("/account/information");
  } catch (error: any) {
    return json({ error: error.message }, { status: 400 });
  }
};

export default function BusinessInformation() {
  const LoaderData: any = useLoaderData();
  const actionData: any = useActionData();
  const user = LoaderData?.user?.user;
  const roles = LoaderData?.roles;

  const [isEditingField, setIsEditingField] = useState<string | null>(null);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [showCompleteProfileForm, setShowCompleteProfileForm] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [isUpdateEnabled, setIsUpdateEnabled] = useState(false);
  const [fleetSize, setFleetSize] = useState("");

  const [vehicleTypes, setVehicleTypes] = useState({
    Trucks: { selected: false, quantity: 0 },
    Boats: { selected: false, quantity: 0 },
    Vans: { selected: false, quantity: 0 },
    Cargoes: { selected: false, quantity: 0 },
  });

  const inputStyle = `border border-slate-400 rounded py-2 px-3 inline-block w-full`;

  console.log("selectedRole", selectedRole);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setDocuments((prevDocs) => [...prevDocs, ...Array.from(files)]);
    }
  };

  const handleRemoveFile = (index) => {
    setDocuments((prevDocs) => prevDocs.filter((_, i) => i !== index));
  };

  const handleVehicleChange = (e) => {
    const { name, checked } = e.target;
    setVehicleTypes((prevVehicles) => ({
      ...prevVehicles,
      [name]: { ...prevVehicles[name], selected: checked },
    }));
  };

  const handleVehicleQuantityChange = (e, vehicle) => {
    const { value } = e.target;
    setVehicleTypes((prevVehicles) => ({
      ...prevVehicles,
      [vehicle]: { ...prevVehicles[vehicle], quantity: parseInt(value, 10) },
    }));
  };

  const handleFleetSizeChange = (e) => {
    setFleetSize(e.target.value);
  };

  const [fieldValues, setFieldValues] = useState({
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
  });

  const inputRef = useRef(null);

  useEffect(() => {
    const requiredDocs = documents;
    if (selectedRole === "owner_operator") {
      const isVehicleSelected = Object.values(vehicleTypes).some(
        (v) => v.selected && v.quantity > 0
      );
      const requiredDocCount = requiredDocs.length >= 2;
      const isValid = isVehicleSelected && requiredDocCount;
      setIsUpdateEnabled(isValid);
    } else if (selectedRole === "fleet_owner") {
      const isVehicleSelected = Object.values(vehicleTypes).some(
        (v) => v.selected
      );
      const isFleetSizeSelected = fleetSize !== "";
      const requiredDocCount = requiredDocs.length >= 2;
      const isValid =
        isVehicleSelected && isFleetSizeSelected && requiredDocCount;
      setIsUpdateEnabled(isValid);
    } else {
      setIsUpdateEnabled(false);
    }
  }, [selectedRole, vehicleTypes, fleetSize, documents]);

  const handleEditClick = (field) => {
    setIsEditingField(field);
  };

  const handleCancelClick = () => {
    setIsEditingField(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full flex flex-col">
      {actionData?.error && (
        <p className="text-red-500 text-xs italic p-2 m-4">
          {actionData.error}
        </p>
      )}
      <h2 className="text-2xl font-semibold mb-4 text-green-800">My Account</h2>
      <div className="flex flex-col w-full h-full">
        <div className="flex justify-start border-b pb-2 mb-4">
          <button
            className={`text-lg font-semibold px-4 ${
              activeTab === "personal"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Information
          </button>
          <button
            className={`text-lg font-semibold px-4 ${
              activeTab === "business"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("business")}
          >
            Business Information
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "personal" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Personal Information
              </h3>

              {[
                "firstName",
                "middleName",
                "lastName",
                "email",
                "phoneNumber",
              ].map((field, index) => (
                <div
                  key={index}
                  className="mb-6 flex justify-between items-center border-t-2 py-2"
                >
                  <div className="flex-1">
                    {isEditingField === field ? (
                      <Form method="post" className="flex w-full">
                        <input
                          type="text"
                          name={field}
                          defaultValue={user[field]}
                          required
                          placeholder={
                            field.charAt(0).toUpperCase() + field.slice(1)
                          }
                          className="flex-1 border border-gray-300 rounded py-2 px-3"
                          ref={inputRef}
                        />
                        <input
                          type="hidden"
                          name="_action"
                          value={`update${field}`}
                        />
                        <div className="flex space-x-2 ml-4">
                          <button
                            type="submit"
                            className="text-blue-500 hover:underline"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelClick}
                            className="text-blue-500 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </Form>
                    ) : (
                      <div className="flex items-center w-full">
                        <label className="block text-gray-700 font-semibold">
                          {field.charAt(0).toUpperCase() +
                            field.slice(1).replace(/([A-Z])/g, " $1")}
                        </label>
                        <span className="ml-20 flex-1">{user[field]}</span>
                      </div>
                    )}
                  </div>
                  {isEditingField !== field && (
                    <button
                      type="button"
                      onClick={() => handleEditClick(field)}
                      className="text-blue-500 hover:underline"
                    >
                      <PencilIcon className="w-4 h-4 hover:text-orange-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "business" && (
            <div className="text-lg font-semibold mb-4 text-green-800">
              <h3 className="border-b-1">Business Information</h3>
              <div className="mt-6">
                {!showCompleteProfileForm && (
                  <>
                    <div className="flex items-center mb-4">
                      {user.status === "Approved" ? (
                        <>
                          <h3 className="mr-2">Business Profile Status:</h3>
                          <div className="relative group">
                            <span className="inline-block bg-green-500 text-white rounded-full p-2 text-center">
                              ✔
                            </span>
                            <label className="absolute bottom-full mb-2 w-max p-2 bg-gray-800 text-white text-sm rounded-md">
                              Your business profile is complete. Start picking
                              up loads.
                              <Link
                                to="/carriers/dashboard/view/"
                                className="text-blue-400 underline ml-1"
                              >
                                View Loads
                              </Link>
                            </label>
                          </div>
                        </>
                      ) : null}
                    </div>

                    <div className="mb-4 border border-gray-300">
                      <label className="block font-semibold">
                        Current Role:{" "}
                        <span className="font-normal px-9">
                          {user.roles[0]}
                        </span>
                      </label>
                    </div>

                    {user.status === "Approved" && user.companyDetails && (
                      <div className="mb-4 border border-gray-300">
                        <label className="block font-semibold">
                          Company Name:
                          <span className="font-normal px-6">
                            {user.companyDetails}
                          </span>
                        </label>
                      </div>
                    )}

                    {user.status === "Not Approved" && (
                      <>
                        <p className="mb-4">
                          Your business profile is not complete. Please complete
                          your profile to start picking up loads.
                        </p>
                        <button
                          className="bg-orange-500 text-white px-4 py-2 rounded"
                          onClick={() => setShowCompleteProfileForm(true)}
                        >
                          Complete your Profile
                        </button>
                      </>
                    )}
                  </>
                )}

                {showCompleteProfileForm && (
                  <Form method="post" encType="multipart/form-data">
                    <div className="mb-4">
                      <FloatingLabelInput
                        type="text"
                        name="companyDetails"
                        defaultValue={user.companyDetails}
                        required
                        placeholder="Company Details"
                        className="block w-full mt-1 rounded-md border-gray-300"
                        onChange={function (
                          name: string,
                          value: string,
                          isValid: boolean
                        ): void {
                          throw new Error("Function not implemented.");
                        }}
                      />
                    </div>
                    <div className="mb-4">
                      <select
                        name="role"
                        className="block w-full mt-1 rounded-md border-gray-300 mb-4"
                        onChange={(e) => setSelectedRole(e.target.value)}
                        required
                      >
                        <option defaultChecked value="">
                          Select Role
                        </option>
                        {Object.entries(roles).map(([name, value]) => (
                          <option key={value as string} value={value as string}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedRole === "owner_operator" && (
                      <div className="col-span-2 flex flex-wrap gap-4">
                        {["Trucks", "Boats", "Vans", "Cargoes"].map(
                          (vehicle) => (
                            <div key={vehicle}>
                              <label className="px-4">
                                <input
                                  type="checkbox"
                                  name={vehicle}
                                  onChange={handleVehicleChange}
                                />
                                {vehicle}
                              </label>
                              {vehicleTypes[vehicle].selected && (
                                <input
                                  type="number"
                                  required
                                  name={`${vehicle.toLowerCase()}Quantity`}
                                  className="w-20"
                                  placeholder="Qty"
                                  value={vehicleTypes[vehicle].quantity}
                                  onChange={(e) =>
                                    handleVehicleQuantityChange(e, vehicle)
                                  }
                                />
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                    {selectedRole === "fleet_owner" && (
                      <div className="col-span-2 pb-3">
                        <p className="font-medium">Fleet:</p>
                        {["Trucks", "Boats", "Vans", "Cargoes"].map(
                          (vehicle) => (
                            <label key={vehicle} className="px-1">
                              <input
                                type="checkbox"
                                name="vehicleType"
                                value={vehicle}
                                onChange={handleVehicleChange}
                              />{" "}
                              {vehicle}
                            </label>
                          )
                        )}
                      </div>
                    )}
                    {selectedRole === "fleet_owner" && (
                      <div className="col-span-2">
                        <p className="font-medium">Fleet Size:</p>
                        {["1-2", "3-10", "11-25", "26-50", "50+"].map(
                          (size) => (
                            <label key={size} className="px-2">
                              <input
                                type="radio"
                                name="fleetSize"
                                value={size}
                                onChange={handleFleetSizeChange}
                              />{" "}
                              {size}
                            </label>
                          )
                        )}
                      </div>
                    )}
                    <div className="mb-4 mt-6">
                      <label className="block text-green-700">
                        Upload Required Documents
                      </label>
                      <p className="text-gray-500 text-sm">
                        Upload the following documents to complete your profile
                        <br />
                        {selectedRole === "owner_operator" && (
                          <>
                            <span className="text-red-700 italic">
                              * Driver's License,{" "}
                            </span>
                            <span className="text-red-700">
                              * Vehicle Registration,{" "}
                            </span>
                          </>
                        )}
                        {selectedRole === "fleet_owner" && (
                          <>
                            <span className="text-red-700 italic">
                              * Company's License,{" "}
                            </span>
                            <span className="text-red-700">* ID, </span>
                          </>
                        )}
                        and any other relevant documents.
                      </p>
                      {selectedRole && (
                        <div className="mt-4">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            multiple
                            name="documents"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="block w-full mt-1 rounded-md border-gray-300 p-2"
                          />
                          <ul className="mt-2">
                            {documents.map((file, index) => (
                              <li
                                key={index}
                                className="flex space-x-10 items-center mt-2"
                              >
                                <span className="text-sm">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <svg
                                    className="w-4 h-4 font-bold hover:text-red-800"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"
                                    ></path>
                                  </svg>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCompleteProfileForm(false);
                          setIsEditingField(null);
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-orange-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 rounded ${
                          isUpdateEnabled
                            ? "bg-green-500 text-white cursor-pointer hover:bg-orange-400"
                            : "bg-gray-500 text-black cursor-not-allowed"
                        }`}
                        disabled={!isUpdateEnabled}
                      >
                        Update
                      </button>
                    </div>
                  </Form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
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
      message: "There was an error processing your request. Please try again.",
      status: 400,
    };
    return <ErrorDisplay error={error} />;
  }
}
