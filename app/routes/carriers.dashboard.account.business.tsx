import { useEffect, useState } from "react";
import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  type LoaderFunction,
  type ActionFunction,
  type MetaFunction,
  json,
  redirect,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import { FloatingLabelInput } from "~/components/FloatingInput";
import { commitSession, getSession } from "~/api/services/session";
import invariant from "tiny-invariant";
import { PencilIcon } from "@heroicons/react/16/solid";
import { authenticator, CompleteProfile } from "~/api/services/auth.server";
import { type CompleteProfileRequest } from "../api/models/profileCompletionRequest";
import { Loader } from "~/components/loader";
import Modal from "~/components/popup";
import { type UserBusinessProfile } from "~/api/models/carrierUser";
import { CreateUser } from "~/api/services/user.service";
import VehicleForm from "~/components/vehicleForm";
import { ErrorBoundary } from "~/components/errorBoundary";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Business Information",
      description: "Provide and manage your business information.",
    },
  ];
};

export const links = () => {
  return [{ rel: "stylesheet", href: customStyles }];
};

export let loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);

    const carrierProfile = session.get("carrier");

    const session_expiration: any = process.env.SESSION_EXPIRATION;
    const EXPIRES_IN = parseInt(session_expiration) * 1000; // Convert seconds to milliseconds
    if (isNaN(EXPIRES_IN)) {
      throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
    }

    if (!user) {
      return redirect("/login/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    // update the session so the user can keep working long as they are active
    const expires = new Date(Date.now() + EXPIRES_IN);
    session.set(authenticator.sessionKey, user);
    await commitSession(session, { expires });

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

    return json({ carrierProfile, roles });
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
      });
    }
    throw e;
  }
};

export let action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  let user = session.get(authenticator.sessionKey);
  const token = user.token;

  if (!user) {
    return redirect("/login/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  const carrierProfile = session.get("carrier");
  user = carrierProfile;

  const mapCarrierRole = (role: string | null) => {
    switch (role) {
      case "owner_operator":
        return 0;
      case "fleet_owner":
        return 1;
      case "dispatcher":
        return 2;
      default:
        return null;
    }
  };

  const mapShipperRole = (role: string | null) => {
    switch (role) {
      case "independent_shipper":
        return 0;
      case "corporate_shipper":
        return 1;
      case "govt_shipper":
        return 2;
      default:
        return null;
    }
  };

  const body = await request.formData();
  const action = body.get("_action");
  console.log("Action User: ", user);
  try {
    if (action === "personal") {
      const firstName = body.get("firstName");
      const middleName: any = body.get("middleName");
      const lastName = body.get("lastName");
      const phoneNumber = body.get("phone");
      const email = body.get("email");

      invariant(typeof firstName === "string", "First name is required");
      invariant(typeof lastName === "string", "Last name is required");
      invariant(typeof email === "string", "Email is required");
      invariant(typeof phoneNumber === "string", "Phone number is required");

      const loaderRequest: CompleteProfileRequest = {
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        email: email,
        role: "",
        phoneNumber: phoneNumber,
      };
      let updatedUserSession = {
        token: user.token,
        user: {
          firstName,
          middleName,
          lastName,
          email,
          phoneNumber,
          roles: user.roles,
        },
      };
      await CompleteProfile(loaderRequest);
      session.set(authenticator.sessionKey, updatedUserSession);
      await commitSession(session);

      return json({ success: true });
    } else if (action === "business") {
      const companyName = body.get("companyName") as string;
      const role = body.get("role") as string;

      let vehicleType = body.get("vehicleType");
      const vehicleName = body.get("vehicleName");
      const vehicleCapacity = body.get("vehicleCapacity")
        ? body.get("vehicleCapacity")
        : 0;
      const vehicleColor = body.get("vehicleColor");
      const registrationNumber = body.get("registrationNumber");
      const hasInsurance = body.get("hasInsurance");
      const hasInspection = body.get("hasInspection");
      const businessType = body.get("businessType");
      const idCardOrDriverLicenceNumber = body.get(
        "idCardOrDriverLicenceNumber"
      );

      let vehicleTypes = null;
      if (role === "owner_operator") {
        vehicleType = body.get("vehicleType") as string;
      } else if (role === "fleet_owner") {
        const vehicleTypesJSON = body.get("vehicleTypes") as string;
        const parsedVehicleTypes = vehicleTypesJSON
          ? JSON.parse(vehicleTypesJSON)
          : {};
        vehicleTypes = parsedVehicleTypes;
      }

      let carrierRole = mapCarrierRole(role);
      let shipperRole = mapShipperRole(role);

      // Construct the business profile request object
      const business_req: any = {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        phone: user.phone,
        userType: user.userType,
        businessProfile: {
          companyName: companyName,
          motorCarrierNumber: registrationNumber,
          dotNumber: registrationNumber,
          equipmentType: vehicleType,
          availableCapacity: parseInt(vehicleCapacity),
          idCardOrDriverLicenceNumber: idCardOrDriverLicenceNumber,
          insuranceName: "Best Insure",
          businessType: businessType,
          carrierRole: carrierRole,
          shipperRole: shipperRole,
          businessRegistrationNumber: registrationNumber,
          carrierVehicles: [
            {
              vehicleTypeId: 2,
              name: vehicleName,
              description: "This is my work vehicle",
              imageUrl: "https://example.com/image2.jpg",
              vin: registrationNumber,
              licensePlate: registrationNumber,
              make: vehicleType,
              model: vehicleName,
              year: "",
              color: vehicleColor,
              hasInsurance: hasInsurance === "on" ? true : false,
              hasRegistration: registrationNumber ? true : false,
              hasInspection: hasInspection === "on" ? true : false,
            },
          ],
        },
      };

      // update the userinformation
      var response: any = await CreateUser(business_req, token);
      console.log("Response: ", response);
      if (response) {
        var updatedUser = {
          userId: user.userId,
          token: user.token,
          user: {
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            userType: user.userType,
            roles: user.roles,
            confirmed: user.confirmed,
            status: user.status,
            businessProfile: business_req.businessProfile,
          },
        };
        session.set("carrier", updatedUser);
        await commitSession(session);
      }

      return json({ type: "business", success: true });
    } else if (action === "updated") {
      return redirect("/logout/");
    }
  } catch (error: any) {
    console.log("Action Error", error);
    switch (JSON.parse(error.message).data.status) {
      case 404 || 400:
        return json({
          error:
            "User's business profile was not updated, please try again, or contact support with CODE: 404",
        });
      case 401:
        session.set(authenticator.sessionKey, null);
        session.set("carrier", null);
        session.set("shipper", null);
        return redirect("/login/", {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        });
      case 500:
        return json({
          error:
            "Something went wrong, please try again later, or reach support with CODE: 500",
        });
      default:
        return json({ error: "Something went wrong, please try again later." });
    }
  }
};

export default function BusinessInformation() {
  const LoaderData: any = useLoaderData();
  const actionData: any = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const user: UserBusinessProfile = LoaderData?.carrierProfile;
  const roles = LoaderData?.roles;
  const [isEditingField, setIsEditingField] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [showCompleteProfileForm, setShowCompleteProfileForm] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [isUpdateEnabled, setIsUpdateEnabled] = useState(false);
  const [fleetSize, setFleetSize] = useState("");
  const fetcher = useFetcher();

  let businessUpdated = false;
  if (actionData?.type === "business" && actionData?.success) {
    businessUpdated = true;
  }

  const [vehicleTypes, setVehicleTypes]: any = useState({
    Trucks: { selected: false, quantity: 0 },
    Boats: { selected: false, quantity: 0 },
    Vans: { selected: false, quantity: 0 },
  });

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
    const { name, value, type, checked } = e.target;
    if (selectedRole === "owner_operator") {
      setVehicleTypes({
        Trucks: { selected: value === "Trucks", quantity: 0 },
        Boats: { selected: value === "Boats", quantity: 0 },
        Vans: { selected: value === "Vans", quantity: 0 },
        Cargoes: { selected: value === "Cargoes", quantity: 0 },
      });
    } else {
      setVehicleTypes((prevVehicles) => ({
        ...prevVehicles,
        [name]: { ...prevVehicles[name], selected: checked },
      }));
    }
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

  const [formValues, setFormValues] = useState({
    firstName: user?.firstName || "",
    middleName: user?.middleName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const isFormValid = () => {
    return (
      formValues.firstName &&
      formValues.lastName &&
      formValues.email &&
      formValues.phone
    );
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const requiredDocs = documents;
    if (selectedRole === "owner_operator") {
      const isVehicleSelected = Object.values(vehicleTypes).some(
        (v: any) => v.selected
      );
      const requiredDocCount = requiredDocs.length >= 2;
      const isValid = isVehicleSelected && requiredDocCount;
      setIsUpdateEnabled(isValid);
    } else if (selectedRole === "fleet_owner") {
      const isVehicleSelected = Object.values(vehicleTypes).some(
        (v) => v.selected && v.quantity > 0
      );
      const requiredDocCount = requiredDocs.length >= 2;
      const isValid = isVehicleSelected && requiredDocCount;
      setIsUpdateEnabled(isValid);
    } else {
      setIsUpdateEnabled(false);
    }

    if ((fetcher.data && fetcher.data.success) || businessUpdated) {
      setIsModalOpen(true);
    }
  }, [
    selectedRole,
    vehicleTypes,
    documents,
    isSubmitting,
    fetcher.data,
    businessUpdated,
  ]);

  const handleEditClick = (field: any) => {
    setIsEditingField(field);
  };

  const handleCancelClick = () => {
    setIsEditingField(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    businessUpdated = false;
    window.location.reload(); // Reload the page to fetch updated data
  };

  if (!user || isSubmitting) {
    return <Loader />;
  }

  const selectedVehicleType = Object.keys(vehicleTypes).find(
    (key) => vehicleTypes[key].selected
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full flex flex-col">
      <Modal
        isOpen={isModalOpen}
        title="Success"
        message="Your information has been updated successfully. Please Log back in to see changes."
        onClose={handleCloseModal}
      />
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
              <div className="flex justify-between items-center mb-4 py-2">
                <h3 className="text-lg font-semibold text-green-700">
                  Personal Information
                </h3>
                {isEditingField !== "personal" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleEditClick("personal")}
                      className="flex items-center text-green-700 hover:text-orange-400 transition duration-200 mr-4 bg-gray-100"
                    >
                      <span className="mr-2 p-2">Edit</span>
                      <PencilIcon className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {isEditingField !== "personal" && LoaderData.user !== null ? (
                <div className="space-y-6 text-green-700">
                  {[
                    { name: "firstName", label: "First Name" },
                    { name: "middleName", label: "Middle Name" },
                    { name: "lastName", label: "Last Name" },
                    { name: "email", label: "Email" },
                    { name: "phone", label: "Phone Number" },
                  ].map((field, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border-t-1 py-1"
                    >
                      <label className="w-1/3 font-semibold text-green-700">
                        {field.label}
                      </label>
                      <span className="w-2/3">{user[field.name]}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <fetcher.Form method="post" className="space-y-6">
                  {[
                    { name: "firstName", label: "First Name" },
                    { name: "middleName", label: "Middle Name" },
                    { name: "lastName", label: "Last Name" },
                    { name: "email", label: "Email" },
                    { name: "phone", label: "Phone Number" },
                  ].map((field, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border-t-1 py-1"
                    >
                      <label className="w-1/3 text-green-700 font-semibold">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        name={field.name}
                        defaultValue={formValues[field.name]}
                        required
                        placeholder={field.label}
                        className="w-2/3 border border-gray-300 rounded py-2 px-3"
                        onChange={handleInputChange}
                      />
                    </div>
                  ))}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancelClick}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-orange-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      name="_action"
                      value="personal"
                      className={`px-4 py-2 rounded ${
                        isSubmitting || !isFormValid()
                          ? "bg-gray-500 text-black cursor-not-allowed"
                          : "bg-green-500 text-white cursor-pointer hover:bg-orange-400"
                      }`}
                      disabled={isSubmitting || !isFormValid()}
                    >
                      {isSubmitting ? (
                        <>
                          Submitting
                          <span className="animate-ping font-bold"> ..</span>
                          <span className="animate-bounce font-extrabold">
                            .
                          </span>
                        </>
                      ) : (
                        "Update"
                      )}
                    </button>
                  </div>
                </fetcher.Form>
              )}
            </div>
          )}

          {activeTab === "business" && (
            <div className="text-lg font-semibold mb-4 text-green-800">
              <h3 className="border-b-1">Business Information</h3>
              <div className="mt-6">
                {!showCompleteProfileForm && (
                  <>
                    <div className="flex items-center mb-4">
                      {user.businessProfile.carrierRole !== null ? (
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

                    {user.status && user.businessProfile.companyName && (
                      <div className="mb-4 border border-gray-300">
                        <label className="block font-semibold">
                          Company Name:
                          <span className="font-normal px-6">
                            {user.businessProfile.companyName}
                          </span>
                        </label>
                      </div>
                    )}

                    {user.businessProfile.carrierRole === null && (
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
                        name="companyName"
                        defaultValue={user.businessProfile.companyName}
                        required
                        placeholder="Company Name"
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
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRole === "owner_operator" && (
                        <div className="col-span-2 flex flex-wrap gap-4">
                          <input
                            type="hidden"
                            name="vehicleTypes"
                            value={JSON.stringify(vehicleTypes)}
                          />
                          {["Trucks", "Boats", "Vans"].map((vehicle) => (
                            <div key={vehicle} className="flex items-center">
                              <label className="flex pl-4 items-center space-x-2">
                                <input
                                  type="radio"
                                  name="vehicleType"
                                  checked={vehicleTypes[vehicle].selected}
                                  value={vehicle}
                                  onChange={handleVehicleChange}
                                />
                                <span>{vehicle}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedRole === "fleet_owner" && (
                        <div className="col-span-2">
                          <input
                            type="hidden"
                            name="vehicleTypes"
                            value={JSON.stringify(vehicleTypes)}
                          />
                          <p className="font-medium">Fleet:</p>
                          <div className="grid grid-cols-2 gap-4">
                            {["Trucks", "Boats", "Vans"].map((vehicle) => (
                              <div
                                key={vehicle}
                                className="flex items-center space-x-2"
                              >
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    name={vehicle}
                                    onChange={handleVehicleChange}
                                  />
                                  <span>{vehicle}</span>
                                </label>
                                {vehicleTypes[vehicle].selected && (
                                  <input
                                    type="number"
                                    required
                                    name={`${vehicle.toLowerCase()}Quantity`}
                                    className="w-20 ml-auto"
                                    placeholder="Qty"
                                    value={vehicleTypes[vehicle].quantity}
                                    onChange={(e) =>
                                      handleVehicleQuantityChange(e, vehicle)
                                    }
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Show VehicleForm if a vehicle type is selected */}
                      {selectedVehicleType && (
                        <VehicleForm selectedVehicle={selectedVehicleType} />
                      )}
                    </div>
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
                        name="_action"
                        value="business"
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

<ErrorBoundary />;
