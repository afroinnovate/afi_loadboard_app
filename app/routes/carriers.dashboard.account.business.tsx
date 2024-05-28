import {
  MetaFunction,
  json,
  LinksFunction,
  ActionFunction,
  redirect,
  LoaderFunction,
} from "@remix-run/node";
import customStyles from "../styles/global.css";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { FloatingLabelInput } from "~/components/FloatingInput";
import { getSession } from "~/api/services/session";
import invariant from "tiny-invariant";
import ErrorDisplay from "~/components/ErrorDisplay";
import { Link } from '@remix-run/react';

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
    companyDetails: "",
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
  const companyDetails = body.get("companyDetails");
  const role = body.get("role");
  const action = body.get("_action");

  try {
    if (action === "confirmAccount") {
      return json({ message: "confirmingAccount" });
    }

    invariant(typeof firstName === "string", "First name is required");
    invariant(typeof lastName === "string", "Last name is required");
    invariant(
      typeof companyDetails === "string",
      "Company details are required"
    );
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
  const [showCompleteProfileForm, setShowCompleteProfileForm] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [vehicles, setVehicles] = useState({
    Trucks: false,
    Boats: false,
    Vans: false,
    Cargoes: false,
  });


  // Determine if the user is a Fleet Owner or Driver
  const isFleetOwner = ["fleet_owner"].includes(selectedRole);
  const isOwnerOperator = ["owner_operator"].includes(selectedRole);
  const isDispatcher = ["dispatcher"].includes(selectedRole);

  const inputStyle = `border border-slate-400 rounded py-2 px-3 inline-block w-full`;

  console.log("selectedRole", selectedRole);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setDocuments(Array.from(files));
    }
  };

  const handleVehicleChange = (e) => {
    const { name, checked } = e.target;
    setVehicles((prevVehicles) => ({ ...prevVehicles, [name]: checked }));
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto overflow-auto h-full ${user.status === "Not Approved" ? "bg-red-500" : "bg-green-500"}`}>
      {actionData?.error && (
        <p className="text-red-500 text-xs italic p-2 m-4">
          {actionData.error}
        </p>
      )}
      <h2 className="text-2xl font-semibold mb-4">Business Information</h2>
      <div className="mt-6">
   { !isEditingField && <h3 className="text-lg font-semibold">Business Profile Status</h3> }
  {user.status === "Not Approved" && !isEditingField ? (
    <div className="flex items-center">
      <div className="relative group">
        <p className="bg-red-500 text-white rounded-xl p-3 text-center">
          {user.status}
        </p>
        <div className="absolute bottom-full mb-2 hidden w-max p-2 bg-gray-800 text-white text-sm rounded-md group-hover:block">
          Please complete your business profile to start picking up some loads.
        </div>
      </div>
    </div>
  ) : (
    !isEditingField && 
    <div className="flex items-center">
      <div className="relative group">
        <p className="bg-green-500 text-white rounded-xl p-3 text-center">
          {user.status}
        </p>
        <div className="absolute bottom-full mb-2 hidden w-max p-2 bg-gray-800 text-white text-sm rounded-md group-hover:block">
          Your business profile is complete. Start picking up some loads.
          <Link to="/carriers/dashboard/view/" className="text-blue-400 underline ml-1">
            View Loads
          </Link>
        </div>
      </div>
    </div>
  )}
</div>

      <div>
        <div className="mb-4">
          {isEditingField === "companyDetails" ? (
            <FloatingLabelInput
              type="text"
              name="companyDetails"
              defaultValue={user.companyDetails}
              required
              placeholder="Company Details"
              onChange={() => {}}
            />
          ) : (
            user.companyDetails !== "" ? <span>Company Name: {user.companyDetails}</span>
            : ""
          )}
        </div>
        <div className="mb-4">
          {isEditingRole ? (
            <select
              name="role"
              className={inputStyle}
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
          ) : (
            <span>Current Role: {user.roles[0]}</span>
          )}
        </div>

        {/* Conditional Vehicle Type and Quantity Inputs */}
        {isOwnerOperator && (
          <div className="col-span-2 flex flex-wrap gap-4">
            {["Trucks", "Boats", "Vans", "Cargoes"].map((vehicle) => (
              <div key={vehicle}>
                <label className="px-4">
                  <input
                    type="checkbox"
                    name={vehicle}
                    onChange={handleVehicleChange}
                  />
                  {vehicle}
                </label>
                {vehicles[vehicle as keyof typeof vehicles] && (
                  <input
                    type="number"
                    name={`${vehicle.toLowerCase()}Quantity`}
                    className="w-20"
                    placeholder="Qty"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {isFleetOwner && (
          <div className="col-span-2 pb-3">
            <p className="font-medium tooltip:'Tjos os '">Fleet:</p>
            <label className="px-1">
              <input type="checkbox" name="vehicleType" value="Trucks" /> Trucks
            </label>
            <label className="px-1">
              <input type="checkbox" name="vehicleType" value="Boats" /> Boats
            </label>
            <label className="px-1">
              <input type="checkbox" name="vehicleType" value="Vans" /> Vans
            </label>
            <label className="px-1">
              <input type="checkbox" name="vehicleType" value="Cargoes" />{" "}
              Cargoes
            </label>
          </div>
        )}

        {/* Conditional Fleet Size Radios */}
        {selectedRole === "fleet_owner" && (
          <div className="col-span-2">
            <p className="font-medium">Fleet Size:</p>
            <label className="px-2">
              <input type="radio" name="fleetSize" value="1-2" /> 1-2
            </label>
            <label className="px-2">
              <input type="radio" name="fleetSize" value="3-10" /> 3-10
            </label>
            <label className="px-2">
              <input type="radio" name="fleetSize" value="11-25" /> 11-25
            </label>
            <label className="px-2">
              <input type="radio" name="fleetSize" value="26-50" /> 26-50
            </label>
            <label className="px-2">
              <input type="radio" name="fleetSize" value="50+" /> 50+
            </label>
          </div>
        )}

        {!showCompleteProfileForm && user.status === "Not Approved" && (
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded mt-4"
            onClick={() => {
              setIsEditingField("companyDetails");
              setShowCompleteProfileForm(true);
              setIsEditingRole(true);
            }}
          >
            Complete your Profile
          </button>
        )}
        {showCompleteProfileForm && (
          <Form method="post" encType="multipart/form-data">
            <div className="mb-4">
              <label className="block text-gray-700">Upload Documents</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full mt-1 rounded-md border-gray-300"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded mr-4"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setShowCompleteProfileForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </Form>
        )}
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
