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
import { CreateUser } from "~/api/services/user.service";
import VehicleForm from "~/components/vehicleForm";
import { ErrorBoundary } from "~/components/errorBoundary";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

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

export const loader: LoaderFunction = async ({ params, request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);
    let { userType } = params;

    userType =
      userType === user?.user.userType ? userType : user?.user.userType;

    if (!user) {
      return redirect("/logout/");
    }

    if (!userType) {
      return redirect("/logout/");
    }

    const userTypeFiltered = userType === "carriers" ? "carrier" : userType;
    const userProfile = session.get(userTypeFiltered);

    if (!userProfile) {
      return redirect("/logout/");
    }

    userProfile.user.phone = user.user.phoneNumber;
    userProfile.user.email = user.user.email;
    userProfile.user.firstName = user.user.firstName;
    userProfile.user.middleName = user.user.middleName;
    userProfile.user.lastName = user.user.lastName;
    userProfile.user.roles = user.user.roles;
    userProfile.user.userType = user.user.userType;
    userProfile.user.businessProfile.carrierRole =
      userProfile.user.businessProfile.carrierRole !== null ||
      userProfile.user.businessProfile.carrierRole !== undefined
        ? userProfile.user.businessProfile.carrierRole
        : null;
    userProfile.user.businessProfile.shipperRole =
      userProfile.user.businessProfile.shipperRole !== null ||
      userProfile.user.businessProfile.shipperRole !== undefined
        ? userProfile.user.businessProfile.shipperRole
        : null;

    const roles = user.user.roles.includes("carrier")
      ? {
          "Owner Operator": "owner_operator",
          "Fleet Owner": "fleet_owner",
          Dispatcher: "dispatcher",
        }
      : {
          "Independent Shipper": "independent_shipper",
          "Government Shipper": "govt_shipper",
          "Corporate Shipper": "corporate_shipper",
        };
    if (
      userProfile.user.businessProfile.carrierRole !== null ||
      userProfile.user.businessProfile.shipperRole !== null
    ) {
      switch (userProfile.user.businessProfile.carrierRole) {
        case 0:
          userProfile.user.businessProfile.carrierRole = "owner_operator";
          break;
        case 1:
          userProfile.user.businessProfile.carrierRole = "fleet_owner";
          break;
        case 2:
          userProfile.user.businessProfile.carrierRole = "dispatcher";
          break;
        default:
          userProfile.user.businessProfile.carrierRole = null;
          break;
      }
      switch (userProfile.user.businessProfile.shipperRole) {
        case 0:
          userProfile.user.businessProfile.shipperRole = "independent_shipper";
          break;
        case 1:
          userProfile.user.businessProfile.shipperRole = "corporate_shipper";
          break;
        case 2:
          userProfile.user.businessProfile.shipperRole = "govt_shipper";
          break;
        default:
          userProfile.user.businessProfile.shipperRole = null;
          break;
      }
    }

    const session_expiration: any = process.env.SESSION_EXPIRATION;
    const EXPIRES_IN = parseInt(session_expiration) * 1000; // Convert seconds to milliseconds
    if (isNaN(EXPIRES_IN)) {
      throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
    }
    // update the session so the user can keep working long as they are active
    const expires = new Date(Date.now() + EXPIRES_IN);
    let theme = session.get("theme");
    theme = theme?? "dark"
    session.set(authenticator.sessionKey, user);
    session.set("theme", theme)
    await commitSession(session, { expires });

    return json(
      { userProfile, roles, theme },
      { headers: { "Set-Cookie": await commitSession(session, { expires }) } }
    );
  } catch (error: any) {
    console.log("Profile Error: ", error);
    if (JSON.parse(error).data.status === 401) {
      return redirect("/logout/");
    }
    throw error;
  }
};

export let action: ActionFunction = async ({ params, request }: any) => {
  const session = await getSession(request.headers.get("Cookie"));
  let authUser = session.get(authenticator.sessionKey);
  const token = authUser.token;

  if (!authUser) {
    return redirect("/logout/");
  }

  let { userType } = params;
  userType =
    userType === authUser?.user.userType ? userType : authUser?.user.userType;

  if (!userType) {
    return redirect("/logout/");
  }
  const userTypeFiltered = userType === "carriers" ? "carrier" : userType;

  const userProfile = session.get(userTypeFiltered);
  let user = userProfile;

  user.user.phone = authUser.user.phoneNumber;
  user.user.email = authUser.user.email;
  user.user.firstName = authUser.user.firstName;
  user.user.middleName = authUser.user.middleName;
  user.user.lastName = authUser.user.lastName;
  user.user.roles = authUser.user.roles;
  user.user.userType = authUser.user.userType;

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
        userType: user.user.userType,
        status: true,
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
      const businessType = body.get("role");
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
        userId: user.id,
        email: user.user.email,
        firstName: user.user.firstName,
        middleName: user.user.middleName,
        lastName: user.user.lastName,
        phone: user.user.phone,
        userType: user.user.userType,
        businessProfile: {
          companyName: companyName
            ? companyName
            : user.user.businessProfile.companyName,
          motorCarrierNumber: user.user.userType === "carrier" ? registrationNumber : "",
          dotNumber: user.user.userType === "carrier" ? registrationNumber : "",
          equipmentType: userType === "carrier" ? vehicleType : "",
          availableCapacity:
            user.user.userType === "carrier" ? parseInt(vehicleCapacity) : 0,
          idCardOrDriverLicenceNumber: idCardOrDriverLicenceNumber
            ? idCardOrDriverLicenceNumber
            : user.user.businessProfile.idCardOrDriverLicenceNumber,
          insuranceName: user.user.userType === "carrier" ? "Place holder Insure" : "",
          businessType: businessType
            ? businessType
            : user.user.businessProfile.businessType,
          carrierRole: carrierRole,
          shipperRole: shipperRole,
          businessRegistrationNumber: registrationNumber
            ? registrationNumber
            : user.user.businessProfile.businessRegistrationNumber,
          carrierVehicles:
            user.user.userType === "carrier"
              ? [
                  {
                    vehicleTypeId: 2,
                    name: vehicleName,
                    description: "This is my work vehicle",
                    imageUrl: "https://example.com/image2.jpg",
                    vin: registrationNumber,
                    licensePlate: registrationNumber,
                    make: vehicleType,
                    vehicleCapacity: vehicleCapacity,
                    model: vehicleName,
                    year: "2010",
                    color: vehicleColor,
                    hasInsurance: hasInsurance === "on" ? true : false,
                    hasRegistration: registrationNumber ? true : false,
                    hasInspection: hasInspection === "on" ? true : false,
                  },
                ]
              : [],
        },
      };
      console.log("Business Request", business_req);
      console.log("Creating a user");
      // update the userinformation
      var response: any = await CreateUser(business_req, token);
      if (response) {
        var updatedUser = {
          userId: authUser.id,
          token: user.token,
          user: {
            firstName: user.user.firstName,
            middleName: user.user.middleName,
            lastName: user.user.lastName,
            email: user.user.email,
            phone: user.user.phone,
            userType: user.user.userType,
            roles: user.user.roles,
            confirmed: user.user.confirmed,
            status: user.user.status,
            businessProfile: business_req.businessProfile,
          },
        };
        const userTypeFiltered = userType === "carriers" ? "carrier" : userType;
        session.set(userTypeFiltered, updatedUser);
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

export default function Business() {
  const LoaderData: any = useLoaderData();
  const actionData: any = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const user: any = LoaderData?.userProfile;
  const roles = LoaderData?.roles;
  const [isEditingField, setIsEditingField] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [showCompleteProfileForm, setShowCompleteProfileForm] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [isUpdateEnabled, setIsUpdateEnabled] = useState(false);
  const [fleetSize, setFleetSize] = useState("");
  const [theme, setTheme] = useState(LoaderData?.theme || "light");
  const fetcher = useFetcher();

  const themeClasses = {
      container:
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black",
      header: theme === "dark" ? "text-green-400" : "text-green-800",
      subHeader: theme === "dark" ? "text-green-300" : "text-green-700",
      input:
        theme === "dark"
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-300 text-black",
      button:
        theme === "dark"
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-green-500 text-white hover:bg-green-600",
      cancelButton:
        theme === "dark"
          ? "bg-gray-600 text-white hover:bg-gray-700"
          : "bg-gray-300 text-gray-700 hover:bg-gray-400",
      card: theme === "dark" ? "bg-gray-800" : "bg-white",
      border: theme === "dark" ? "border-gray-700" : "border-gray-200",
  };

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
    firstName: user?.user.firstName || "",
    middleName: user?.user.middleName || "",
    lastName: user?.user.lastName || "",
    email: user?.user.email || "",
    phone: user?.user.phone || "",
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
    console.log("Selected Role", selectedRole);
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
    } else if (selectedRole === "dispatcher") {
      const requiredDocCount = requiredDocs.length >= 2;
      const isValid = requiredDocCount;
      setIsUpdateEnabled(isValid);
    } else if (selectedRole === "independent_shipper") {
      const requiredDocCount = requiredDocs.length >= 2;
      const isValid = requiredDocCount;
      setIsUpdateEnabled(isValid);
    } else if (selectedRole === "corporate_shipper") {
      const requiredDocCount = requiredDocs.length >= 2;
      const isValid = requiredDocCount;
      setIsUpdateEnabled(isValid);
    } else if (selectedRole === "govt_shipper") {
      const requiredDocCount = requiredDocs.length >= 2;
      const isValid = requiredDocCount;
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
    <div
      className={`p-6 rounded-lg shadow-lg w-full h-full flex flex-col ${themeClasses.container}`}
    >
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
      <h2 className={`text-2xl font-semibold mb-4 ${themeClasses.header}`}>
        My Account
      </h2>
      <div className="flex flex-col w-full h-full">
        <div className="flex justify-start border-b pb-2 mb-4">
          <button
            className={`text-lg font-semibold px-4 ${
              activeTab === "personal"
                ? `${themeClasses.header} border-b-2 border-current`
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Information
          </button>
          <button
            className={`text-lg font-semibold px-4 ${
              activeTab === "business"
                ? `${themeClasses.header} border-b-2 border-current`
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
                <h3
                  className={`text-lg font-semibold ${themeClasses.subHeader}`}
                >
                  Personal Information
                </h3>
                {isEditingField !== "personal" && (
                  <button
                    type="button"
                    onClick={() => handleEditClick("personal")}
                    className={`flex items-center ${themeClasses.button} transition duration-200 mr-4 p-2 rounded`}
                  >
                    <span className="mr-2">Edit</span>
                    <PencilIcon className="w-6 h-6" />
                  </button>
                )}
              </div>

              {isEditingField !== "personal" && LoaderData.user !== null ? (
                <div className="space-y-6">
                  {[
                    { name: "firstName", label: "First Name" },
                    { name: "middleName", label: "Middle Name" },
                    { name: "lastName", label: "Last Name" },
                    { name: "email", label: "Email" },
                    { name: "phone", label: "Phone Number" },
                  ].map((field, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center border-t py-1 ${themeClasses.border}`}
                    >
                      <label
                        className={`w-1/3 font-semibold ${themeClasses.subHeader}`}
                      >
                        {field.label}
                      </label>
                      <span className="w-2/3">{user.user[field.name]}</span>
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
                      className={`flex justify-between items-center border-t py-1 ${themeClasses.border}`}
                    >
                      <label
                        className={`w-1/3 font-semibold ${themeClasses.subHeader}`}
                      >
                        {field.label}
                      </label>
                      <input
                        type="text"
                        name={field.name}
                        defaultValue={formValues[field.name]}
                        required
                        placeholder={field.label}
                        className={`w-2/3 rounded py-2 px-3 ${themeClasses.input}`}
                        onChange={handleInputChange}
                      />
                    </div>
                  ))}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancelClick}
                      className={`px-4 py-2 rounded ${themeClasses.cancelButton}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      name="_action"
                      value="personal"
                      className={`px-4 py-2 rounded ${
                        isSubmitting || !isFormValid()
                          ? "bg-gray-500 text-white cursor-not-allowed"
                          : themeClasses.button
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
            <div className={`shadow-lg rounded-lg p-4 ${themeClasses.card}`}>
              <h3
                className={`text-2xl font-bold mb-4 ${themeClasses.header} border-b pb-2`}
              >
                Business Information
              </h3>
              <div className="space-y-6">
                {!showCompleteProfileForm && (
                  <>
                    <div className="flex items-center mb-2">
                      {user?.user.businessProfile.carrierRole !== null ||
                      user?.user.businessProfile.shipperRole !== null ? (
                        <>
                          <p
                            className={`p-2 mr-2 font-semibold ${themeClasses.subHeader}`}
                          >
                            Profile Status:
                          </p>
                          <CheckCircleIcon className="w-6 h-6 text-green-600 ml-6"></CheckCircleIcon>
                        </>
                      ) : null}
                    </div>

                    <div className="p-2 rounded-lg">
                      <p className={`font-semibold ${themeClasses.subHeader}`}>
                        Current Role:
                        <span className="font-normal ml-12 text-green-600">
                          {user.user.businessProfile.carrierRole ||
                            user.user.businessProfile.shipperRole}
                        </span>
                      </p>
                    </div>

                    {user.user.status &&
                      user.user.businessProfile.companyName && (
                        <div className="p-2 rounded-lg">
                          <p
                            className={`font-semibold ${themeClasses.subHeader}`}
                          >
                            Company Name:
                            <span className="font-normal ml-5 text-green-600">
                              {user.user.businessProfile.companyName}
                            </span>
                          </p>
                        </div>
                      )}

                    {user.user.userType === "carrier" &&
                      user.user.businessProfile.carrierRole !== null && (
                        <div
                          className={`bg-green-50 border ${themeClasses.border} p-4 rounded-lg`}
                        >
                          <p className="text-sm text-blue-800">
                            Your business profile is complete. Start picking up
                            loads.
                            <Link
                              to="/carriers/dashboard/view/"
                              className="text-blue-600 underline ml-1 hover:text-blue-800"
                            >
                              View Loads
                            </Link>
                          </p>
                        </div>
                      )}

                    {user.user.userType === "shipper" &&
                      user.user.businessProfile.shipperRole !== null && (
                        <div
                          className={`bg-green-50 border ${themeClasses.border} p-4 rounded-lg`}
                        >
                          <p className="text-sm text-blue-800">
                            Your business profile is complete. Start posting
                            loads.
                            <Link
                              to="/shipper/dashboard/loads/view/"
                              className="text-blue-600 underline ml-1 hover:text-blue-800"
                            >
                              View Loads
                            </Link>
                          </p>
                        </div>
                      )}

                    {user.user.businessProfile.carrierRole === null &&
                      user.user.businessProfile.shipperRole === null && (
                        <div
                          className={`bg-yellow-50 border ${themeClasses.border} p-4 rounded-lg`}
                        >
                          <p className="text-sm text-yellow-800 mb-4">
                            Your business profile is not complete. Please
                            complete your profile to start picking up or posting
                            loads.
                          </p>
                          <button
                            className={`${themeClasses.button} px-4 py-2 rounded transition duration-300`}
                            onClick={() => setShowCompleteProfileForm(true)}
                          >
                            Complete your Profile
                          </button>
                        </div>
                      )}
                  </>
                )}

                {/* Update carrier profile */}
                {showCompleteProfileForm &&
                  user.user.userType === "carrier" && (
                    <Form
                      method="post"
                      encType="multipart/form-data"
                      className="space-y-4"
                    >
                      <div className="mt-4">
                        <FloatingLabelInput
                          type="text"
                          name="companyName"
                          defaultValue={user.user.businessProfile.companyName}
                          required
                          placeholder="Company Name"
                          className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                          onChange={function (
                            name: string,
                            value: string,
                            isValid: boolean
                          ): void {
                            throw new Error("Function not implemented.");
                          }}
                          theme={theme}
                        />
                      </div>
                      <div>
                        <select
                          name="role"
                          className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          required
                        >
                          <option
                            value=""
                            className={
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }
                          >
                            Select Role
                          </option>
                          {Object.entries(roles).map(([name, value]) => (
                            <option
                              key={value as string}
                              value={value as string}
                            >
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
                                <label
                                  className={`flex items-center space-x-2 cursor-pointer ${themeClasses.label}`}
                                >
                                  <input
                                    type="radio"
                                    name="vehicleType"
                                    checked={vehicleTypes[vehicle].selected}
                                    value={vehicle}
                                    onChange={handleVehicleChange}
                                    className={`form-radio ${
                                      theme === "dark"
                                        ? "text-blue-400"
                                        : "text-blue-600"
                                    }`}
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
                            <p
                              className={`font-medium mb-2 ${themeClasses.label}`}
                            >
                              Fleet:
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              {["Trucks", "Boats", "Vans"].map((vehicle) => (
                                <div
                                  key={vehicle}
                                  className="flex items-center space-x-2"
                                >
                                  <label
                                    className={`flex items-center space-x-2 cursor-pointer ${themeClasses.label}`}
                                  >
                                    <input
                                      type="checkbox"
                                      name={vehicle}
                                      onChange={handleVehicleChange}
                                      className={`form-checkbox ${
                                        theme === "dark"
                                          ? "text-blue-400"
                                          : "text-blue-600"
                                      }`}
                                    />
                                    <span>{vehicle}</span>
                                  </label>
                                  {vehicleTypes[vehicle].selected && (
                                    <input
                                      type="number"
                                      required
                                      name={`${vehicle.toLowerCase()}Quantity`}
                                      className={`w-20 px-2 py-1 rounded-md ${themeClasses.input}`}
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

                        {selectedVehicleType && (
                          <VehicleForm
                            selectedVehicle={selectedVehicleType}
                            theme={theme}
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label
                          className={`block font-medium ${themeClasses.header}`}
                        >
                          Upload Required Documents
                        </label>
                        <p
                          className={
                            theme === "dark"
                              ? "text-gray-300 text-sm"
                              : "text-gray-500 text-sm"
                          }
                        >
                          Upload the following documents to complete your
                          profile
                          <br />
                          {selectedRole === "owner_operator" && (
                            <>
                              <span className="text-red-500 italic">
                                * Driver's License,{" "}
                              </span>
                              <span className="text-red-500">
                                * Vehicle Registration,{" "}
                              </span>
                            </>
                          )}
                          {selectedRole === "fleet_owner" && (
                            <>
                              <span className="text-red-500 italic">
                                * Company's License,{" "}
                              </span>
                              <span className="text-red-500">* ID, </span>
                            </>
                          )}
                          and any other relevant documents.
                        </p>
                        {selectedRole && (
                          <div className="mt-2">
                            <input
                              type="file"
                              onChange={handleFileChange}
                              multiple
                              name="documents"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className={`block w-full text-sm ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-500"
                              }
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            ${
              theme === "dark"
                ? "file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"
                : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            }`}
                            />
                            <ul className="mt-2 space-y-1">
                              {documents.map((file, index) => (
                                <li
                                  key={index}
                                  className={`flex justify-between items-center px-3 py-1 rounded ${
                                    theme === "dark"
                                      ? "bg-gray-700"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  <span
                                    className={`text-sm truncate ${
                                      theme === "dark"
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {file.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    className={
                                      theme === "dark"
                                        ? "text-red-400 hover:text-red-300"
                                        : "text-red-500 hover:text-red-700"
                                    }
                                  >
                                    <svg
                                      className="w-4 h-4"
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
                          className={`${themeClasses.cancelButton} p-2`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          name="_action"
                          value="business"
                          className={`px-4 py-2 rounded ${
                            isUpdateEnabled
                              ? themeClasses.button
                              : `${
                                  theme === "dark"
                                    ? "bg-gray-700 text-gray-400"
                                    : "bg-gray-300 text-gray-500"
                                } cursor-not-allowed`
                          } transition duration-300`}
                          disabled={!isUpdateEnabled}
                        >
                          Update
                        </button>
                      </div>
                    </Form>
                  )}

                {/* update shipper profile */}
                {showCompleteProfileForm &&
                  user.user.userType === "shipper" && (
                    <Form
                      method="post"
                      encType="multipart/form-data"
                      className="space-y-6"
                    >
                      <div className="mt-2">
                        <FloatingLabelInput
                          type="text"
                          name="companyName"
                          defaultValue={user.user.businessProfile.companyName}
                          required
                          placeholder="Company Name"
                          className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                          onChange={function (
                            name: string,
                            value: string,
                            isValid: boolean
                          ): void {
                            throw new Error("Function not implemented.");
                          }}
                          theme={theme}
                        />
                      </div>
                      <div>
                        <select
                          name="role"
                          className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          required
                        >
                          <option
                            value=""
                            className={
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }
                          >
                            Select Role
                          </option>
                          {Object.entries(roles).map(([name, value]) => (
                            <option
                              key={value as string}
                              value={value as string}
                            >
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <FloatingLabelInput
                          type="text"
                          name="registrationNumber"
                          defaultValue={
                            user.user.businessProfile.businessRegistrationNumber
                          }
                          required
                          placeholder="Registration Number"
                          className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                          onChange={function (
                            name: string,
                            value: string,
                            isValid: boolean
                          ): void {
                            throw new Error("Function not implemented.");
                          }}
                          theme={theme}
                        />
                      </div>

                      <div>
                        <FloatingLabelInput
                          type="text"
                          name="idCardOrDriverLicenceNumber"
                          defaultValue={
                            user.user.businessProfile
                              .idCardOrDriverLicenceNumber
                          }
                          required
                          placeholder="* ID Card/Driver's License Number"
                          className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                          onChange={function (
                            name: string,
                            value: string,
                            isValid: boolean
                          ): void {
                            throw new Error("Function not implemented.");
                          }}
                          theme={theme}
                        />
                      </div>

                      <div className="space-y-2">
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          Upload the following documents to complete your
                          profile
                          <br />
                          <span className="text-red-500 italic">
                            * Company's License, * ID, and any other relevant
                            documents.
                          </span>
                        </p>
                      </div>

                      {selectedRole && (
                        <div className="mt-2">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            multiple
                            name="documents"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className={`block w-full text-sm ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-500"
                            }
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            ${
                              theme === "dark"
                                ? "file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"
                                : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            }`}
                          />
                          <ul className="mt-2 space-y-1">
                            {documents.map((file, index) => (
                              <li
                                key={index}
                                className={`flex justify-between items-center px-3 py-1 rounded ${
                                  theme === "dark"
                                    ? "bg-gray-800"
                                    : "bg-gray-100"
                                }`}
                              >
                                <span
                                  className={`text-sm truncate ${
                                    theme === "dark"
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(index)}
                                  className={`${
                                    theme === "dark"
                                      ? "text-red-400 hover:text-red-300"
                                      : "text-red-500 hover:text-red-700"
                                  }`}
                                >
                                  <svg
                                    className="w-4 h-4"
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

                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCompleteProfileForm(false);
                            setIsEditingField(null);
                          }}
                          className={`${themeClasses.cancelButton} p-2`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          name="_action"
                          value="business"
                          className={`px-4 py-2 rounded ${
                            isUpdateEnabled
                              ? themeClasses.button
                              : `${
                                  theme === "dark"
                                    ? "bg-gray-700 text-gray-400"
                                    : "bg-gray-300 text-gray-500"
                                } cursor-not-allowed`
                          } transition duration-300`}
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
