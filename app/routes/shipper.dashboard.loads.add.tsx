import {
  Form,
  MetaFunction,
  useActionData,
  useLoaderData,
  useNavigation,
  useOutletContext,
  useRouteError,
} from "@remix-run/react";
import {
  redirect,
  type ActionFunction,
  type LoaderFunction,
  json,
} from "@remix-run/node";
import { authenticator } from "~/api/services/auth.server";
import AccessDenied from "~/components/accessdenied";
import { useEffect, useState } from "react";
import type { LoadRequest } from "~/api/models/loadRequest";
import { AddLoads } from "~/api/services/load.service";
import { commitSession, getSession } from "~/api/services/session";
import { ErrorBoundary } from "~/components/errorBoundary";
import type { ShipperUser } from "~/api/models/shipperUser";
import { FloatingLabelInput } from "~/components/FloatingInput";
import { DateInput } from "~/components/dateInput";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { the } from "../api/services/session";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Afroinnovate | Loadboard | Add Load",
      description: "Dashboard for Adding the loads",
    },
  ];
};

// check if the user is authenticated
export const loader: LoaderFunction = async ({ request }) => {
  const mapRoles = {
    independent_shipper: "independent_Shipper",
    corporate_shipper: "corporate_Shipper",
    govt_shipper: "govt_Shipper",
  };

  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);

    if (!user) {
      // Handle the missing token scenario
      return redirect("/logout/");
    }

    const session_expiration: any = process.env.SESSION_EXPIRATION;
    const EXPIRES_IN = parseInt(session_expiration) * 1000; // Convert seconds
    const expires = new Date(Date.now() + EXPIRES_IN); // Convert seconds to milliseconds

    // get shipper's profile from session storage
    const shipper: ShipperUser = session.get("shipper");
    if (!shipper) {
      return redirect("/logout/");
    }

    if (isNaN(EXPIRES_IN)) {
      throw JSON.stringify({
        message: "SESSION_EXPIRATION is not set or is not a valid number",
        status: 401,
      });
    }

    if (user.user.userType === "carrier") {
      return redirect("/carriers/dashboard/", {
        headers: {
          "Set-Cookie": await commitSession(session, { expires }),
        },
      });
    }

    const shipperRole =
      mapRoles[
        shipper.user.businessProfile.shipperRole as keyof typeof mapRoles
      ];
    const hasAccess = [
      "independent_Shipper",
      "corporate_Shipper",
      "govt_Shipper",
    ].includes(shipperRole);

    return json({ hasAccess }, { status: 200 });
  } catch (error: any) {
    console.error(" Add load  error: ", error);
    if (JSON.parse(error).data.status === 401) {
      return redirect("/logout/");
    }
    return error;
  }
};

const mapShipperRole = {
  "independent_Shipper": 0,
  "corporate_Shipper": 1,
  "govt_Shipper": 2
}

export const action: ActionFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);
    const shipperProfile: ShipperUser = session.get("shipper");

    if (!user || !shipperProfile) {
      return redirect("/logout/");
    }

    const formData = await request.formData();

    const requiredFields = [
      "origin",
      "destination",
      "pickupDate",
      "deliveryDate",
      "commodity",
      "weight",
      "offerAmount",
      "loadDetails",
    ];

    const errors: { [key: string]: string } = {};

    for (const field of requiredFields) {
      const value = formData.get(field);
      if (!value || value.toString().trim() === "") {
        errors[field] = `${field} is required`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return json({ errors }, { status: 400 });
    }

    const pickupDate = new Date(formData.get("pickupDate") as string);
    const deliveryDate = new Date(formData.get("deliveryDate") as string);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickupDate < today) {
      errors.pickupDate = "Pick-up date cannot be in the past";
    }

    if (deliveryDate < pickupDate) {
      errors.deliveryDate =
        "Estimated delivery date must be on or after the pick-up date";
    }

    if (Object.keys(errors).length > 0) {
      return json({ errors }, { status: 400 });
    }

    const loadRequest: LoadRequest = {
      shipperUserId: user.user.id,
      origin: formData.get("origin") as string,
      destination: formData.get("destination") as string,
      pickupDate: pickupDate.toISOString(),
      deliveryDate: deliveryDate.toISOString(),
      commodity: formData.get("commodity") as string,
      estimatedDistance: Number(formData.get("estimatedDistance")),
      weight: Number(formData.get("weight")),
      offerAmount: Number(formData.get("offerAmount")),
      loadDetails: formData.get("loadDetails") as string,
      loadStatus: "Open",
      createdAt: new Date().toISOString(),
      createdBy: {
        userId: user.user.id,
        email: user.user.email,
        firstName: user.user.firstName,
        middleName: user.user.middleName || "",
        lastName: user.user.lastName,
        phone: user.user.phoneNumber,
        userType: "shipper",
        businessType: shipperProfile.user.businessProfile.businessType,
        businessRegistrationNumber:
          shipperProfile.user.businessProfile.businessRegistrationNumber,
        companyName: shipperProfile.user.businessProfile.companyName,
        idCardOrDriverLicenceNumber:
          shipperProfile.user.businessProfile.idCardOrDriverLicenceNumber,
        shipperRole: mapShipperRole[shipperProfile.user.businessProfile.shipperRole as keyof typeof mapShipperRole],
      },
    };

    const response: any = await AddLoads(loadRequest, user.token);
    console.log("response: ", response);
    if (Object.keys(response).length > 0 && response.origin !== undefined) {
      return redirect("/shipper/dashboard/loads/view");
    } else {
      return json(
        { error: "Failed to add load. Please try again." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.log("add load error: ", error);
    
    // Handle the error object directly without parsing
    if (error.data && JSON.parse(error.data).status === 401) {
      return redirect("/logout/");
    }
    
    // Return a more detailed error message
    return json(
      { 
        error: error.data ? error.data.message : "Load Addition failed. An unexpected error occurred, Try again or contact support",
        status: error.data ? error.data.status : 500
      },
      { status: error.data ? error.data.status : 500 }
    );
  }
};

// Define the shape of our form data


const loadTypes = [
  "Clothing",
  "Furniture",
  "Electronics",
  "Food & Beverages",
  "Machinery",
  "Medical Supplies",
  "Paper Products",
  "Pharmaceuticals",
  "Plastics",
  "Textiles",
  "Mixed Load",
  "Goverment Load",
  "Classified Load",
  "Agricultural Produce",
  "Construction Materials",
  "Hazardous Materials",
  "Livestock",
  "Automobile",
  "Other",
];

interface OutletObject {
  theme: "light" | "dark";
  timeZone: string;
}

// Function to get theme-based class names
const themeClass = (theme: "light" | "dark", darkClass: string, lightClass: string) => {
  return theme === "dark" ? darkClass : lightClass;
};

export default function AddLoad() {
  const actionData = useActionData<{
    error?: string;
    status?: number;
  }>();
  var { hasAccess } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [offerType, setOfferType] = useState("flat");
  const today = new Date().toISOString().split("T")[0];
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedLoadType, setSelectedLoadType] = useState("");
  const { theme, timeZone } = useOutletContext<OutletObject>();

  console.log("Action Data: ", actionData);

  const [formData, setFormData] = useState({
    title: "",
    loadDetails: "",
    origin: "",
    destination: "",
    estimatedDistance: "",
    pickupDate: "",
    deliveryDate: "",
    commodity: "",
    weight: "",
    offerAmount: "",
  });

  if (!hasAccess) {
    return (
      <AccessDenied
        returnUrl="/shipper/dashboard/loads/view"
        message="You do not have enough access to add a load"
      />
    );
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoadTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedLoadType(value);
    setFormData((prev) => ({ ...prev, commodity: value }));
  };

  useEffect(() => {
    const requiredFields = [
      "origin",
      "destination",
      "pickupDate",
      "deliveryDate",
      "commodity",
      "weight",
      "offerAmount",
      "loadDetails",
    ];
    const isValid = requiredFields.every((field) => formData[field as keyof typeof formData] !== "");
    setIsFormValid(isValid);
  }, [formData]);

  const currency = "ETB";

  return (
    <div className={themeClass(theme, "container mx-auto p-4 max-w-4xl bg-[#1a1e2e] text-white", "container mx-auto p-4 max-w-4xl bg-white text-black")}>
      <h1 className={themeClass(theme, "text-3xl font-bold mb-6 text-center text-[#ff6b6b]", "text-3xl font-bold mb-6 text-center text-[#ff6b6b]")}>
        Add New Load Offer
      </h1>

      {actionData?.error && (
        <div
          className={themeClass(theme, "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4", "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4")}
          role="alert"
        >
          <strong className="font-bold">Error {actionData.status}: </strong>
          <span className="block sm:inline">{actionData.error}</span>
        </div>
      )}

      <Form method="post" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FloatingLabelInput
            name="title"
            placeholder="Title"
            required={false}
            onChange={handleInputChange}
            error={actionData?.errors?.title}
            className={themeClass(theme, "bg-[#2a2f3f] text-white border-[#3a3f4f] focus:border-[#ff6b6b]", "bg-white text-black border-gray-300 focus:border-blue-500")}
            theme={theme}
          />

          <FloatingLabelInput
            name="loadDetails"
            placeholder="Load Description"
            required
            onChange={handleInputChange}
            error={actionData?.errors?.loadDetails}
            theme={theme}
          />

          <FloatingLabelInput
            name="origin"
            placeholder="Origin"
            required
            onChange={handleInputChange}
            error={actionData?.errors?.origin}
            theme={theme}
          />

          <FloatingLabelInput
            name="destination"
            placeholder="Destination"
            required
            onChange={handleInputChange}
            error={actionData?.errors?.destination}
            theme={theme}
          />

          <DateInput
            name="pickupDate"
            label="Pick-up Date"
            required
            min={today}
            onChange={handleInputChange}
            error={actionData?.errors?.pickupDate}
            theme={theme}
          />

          <DateInput
            name="deliveryDate"
            label="Est. Delivery Date"
            required
            min={today}
            onChange={handleInputChange}
            error={actionData?.errors?.deliveryDate}
            theme={theme}
          />

          <FloatingLabelInput
            name="estimatedDistance"
            type="number"
            placeholder="Est. Distance (km)"
            min={1}
            step={0.1}
            required
            onChange={handleInputChange}
            error={actionData?.errors?.estimatedDistance}
            theme={theme}
          />

          <FloatingLabelInput
            name="weight"
            type="number"
            placeholder="Weight (kg)"
            required
            min={1}
            onChange={handleInputChange}
            error={actionData?.errors?.weight}
            theme={theme}
          />

          <div className="col-span-2 relative">
            <label
              htmlFor="commodity"
              className={themeClass(theme, "block text-sm font-medium text-white mb-1", "block text-sm font-medium text-black mb-1")}
            >
              Load Type (Commodity)
            </label>
            <div className="relative">
              <select
                id="commodity"
                name="commodity"
                value={selectedLoadType}
                onChange={handleLoadTypeChange}
                className={themeClass(theme, "block w-full pl-3 pr-10 py-2 text-base border-[#3a3f4f] focus:outline-none focus:ring-[#ff6b6b] focus:border-[#ff6b6b] sm:text-sm rounded-md appearance-none bg-[#2a2f3f] text-white", "block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none bg-white text-black")}
                required
              >
                <option value="">Select a load type</option>
                {loadTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className={themeClass(theme, "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#ff6b6b]", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500")}>
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            {actionData?.errors?.commodity && (
              <p className={themeClass(theme, "mt-1 text-sm text-red-400", "mt-1 text-sm text-red-400")}>
                {actionData.errors.commodity}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4 pb-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="offerType"
                value="flat"
                checked={offerType === "flat"}
                onChange={() => setOfferType("flat")}
                className={themeClass(theme, "form-radio h-4 w-4 text-[#ff6b6b] border-[#3a3f4f] focus:ring-[#ff6b6b]", "form-radio h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-500")}
              />
              <span className={themeClass(theme, "ml-2", "ml-2")}>Flat Offer</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="offerType"
                value="negotiable"
                checked={offerType === "negotiable"}
                onChange={() => setOfferType("negotiable")}
                className={themeClass(theme, "form-radio h-4 w-4 text-[#ff6b6b] border-[#3a3f4f] focus:ring-[#ff6b6b]", "form-radio h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-500")}
              />
              <span className={themeClass(theme, "ml-2", "ml-2")}>Negotiable</span>
            </label>
          </div>

          {offerType === "flat" && (
            <FloatingLabelInput
              name="offerAmount"
              type="number"
              placeholder={`Offer Amount (${currency})`}
              required
              min="1"
              onChange={handleInputChange}
              error={actionData?.errors?.offerAmount}
              className={themeClass(theme, "bg-[#2a2f3f] text-white border-[#3a3f4f] focus:border-[#ff6b6b]", "bg-white text-black border-gray-300 focus:border-blue-500")}
              theme={theme}
            />
          )}
        </div>

        <div>
          <button
            type="submit"
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isFormValid
                ? themeClass(theme, "bg-[#ff6b6b] hover:bg-[#ff8c8c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6b6b]", "bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500")
                : themeClass(theme, "bg-[#3a3f4f] cursor-not-allowed", "bg-gray-300 cursor-not-allowed")
            }`}
            disabled={!isFormValid || navigation.state === "submitting"}
          >
            {navigation.state === "submitting"
              ? "Submitting..."
              : "Submit Load"}
          </button>
        </div>
      </Form>
    </div>
  );
}

<ErrorBoundary />;
