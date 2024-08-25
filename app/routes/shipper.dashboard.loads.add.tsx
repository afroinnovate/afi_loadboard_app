import {
  Form,
  MetaFunction,
  useActionData,
  useLoaderData,
  useNavigation,
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

export const meta: MetaFunction = () => {
  return [
    {
      title: "Afroinnovate | Loadboard | Add Load",
      description: "Dashboard for Adding the loads",
    },
  ];
};

// Define the type for mapRoles
const mapRoles: { [key: number]: string } = {
  0: "independentShipper",
  1: "corporateShipper",
  2: "govtShipper",
};

// check if the user is authenticated
export const loader: LoaderFunction = async ({ request }) => {
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
      throw JSON.stringify({ message: "SESSION_EXPIRATION is not set or is not a valid number", status: 401 });
    }

    if (user.user.userType === "carrier") {
      return redirect("/carriers/dashboard/", {
        headers: {
          "Set-Cookie": await commitSession(session, { expires }),
        },
      });
    }
 
    const shipperRole = mapRoles[shipper.user.businessProfile.shipperRole];
    const hasAccess = ["independentShipper", "corporateShipper", "govtShipper"].includes(shipperRole);

    return json({ user, shipper, hasAccess });
  } catch (error: any) {
    console.error(" Add load  error: ", error);
    if (JSON.parse(error).data.status === 401) {
      return redirect("/logout/");
    }
    return error;
  }
};

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
         phone: user.user.phone,
         userType: "shipper",
         businessType: shipperProfile.user.businessProfile.businessType,
         businessRegistrationNumber:
           shipperProfile.user.businessProfile.businessRegistrationNumber,
         companyName: shipperProfile.user.businessProfile.companyName,
         idCardOrDriverLicenceNumber:
           shipperProfile.user.businessProfile.idCardOrDriverLicenceNumber,
         shipperRole: shipperProfile.user.businessProfile.shipperRole,
       },
     };

     const response: any = await AddLoads(loadRequest, user.token);
     if (Object.keys(response).length > 0 && response.origin !== undefined) {
       return redirect("/shipper/dashboard/loads/view");
     } else {
       return json(
         { error: "Failed to add load. Please try again." },
         { status: 500 }
       );
     }
   } catch (error: any) {
     if (JSON.parse(error).data.status === 401) {
       return redirect("/logout/");
     }
     return error;
   }
};

// Define the shape of our form data
interface formData {
  title: string;
  loadDetails: string;
  origin: string;
  destination: string;
  estimatedDistance: string;
  pickupDate: string;
  deliveryDate: string;
  commodities: string;
  weight: string;
  offerAmount: string;
  [key: string]: string; // Index signature to allow string indexing
}


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

export default function AddLoad() {
  const actionData = useActionData<{ errors?: { [key: string]: string }, error?: string }>();
  const { user, shipper, hasAccess } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [offerType, setOfferType] = useState("flat");
  const today = new Date().toISOString().split("T")[0];
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedLoadType, setSelectedLoadType] = useState("");

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
    const isValid = requiredFields.every((field) => formData[field] !== "");
    setIsFormValid(isValid);
  }, [formData]);

  const currency = 'ETB';

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-600">
        Add New Load Offer
      </h1>

      {actionData?.error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
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
          />

          <FloatingLabelInput
            name="loadDetails"
            placeholder="Load Description"
            required
            onChange={handleInputChange}
            error={actionData?.errors?.loadDetails}
          />

          <FloatingLabelInput
            name="origin"
            placeholder="Origin"
            required
            onChange={handleInputChange}
            error={actionData?.errors?.origin}
          />

          <FloatingLabelInput
            name="destination"
            placeholder="Destination"
            required
            onChange={handleInputChange}
            error={actionData?.errors?.destination}
          />

          <DateInput
            name="pickupDate"
            label="Pick-up Date"
            required
            min={today}
            onChange={handleInputChange}
            error={actionData?.errors?.pickupDate}
          />

          <DateInput
            name="deliveryDate"
            label="Est. Delivery Date"
            required
            min={today}
            onChange={handleInputChange}
            error={actionData?.errors?.deliveryDate}
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
          />

          <FloatingLabelInput
            name="weight"
            type="number"
            placeholder="Weight (kg)"
            required
            min={1}
            onChange={handleInputChange}
            error={actionData?.errors?.weight}
          />

          <div className="col-span-2 relative">
            <label
              htmlFor="commodity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Load Type (Commodity)
            </label>
            <div className="relative">
              <select
                id="commodity"
                name="commodity"
                value={selectedLoadType}
                onChange={handleLoadTypeChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md appearance-none bg-white"
                required
              >
                <option value="">Select a load type</option>
                {loadTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            {actionData?.errors?.commodity && (
              <p className="mt-1 text-sm text-red-600">
                {actionData.errors.commodity}
              </p>
            )}
          </div>

          {selectedLoadType === "Other" && (
            <FloatingLabelInput
              name="commodity"
              placeholder="Custom Load Type"
              required
              onChange={handleInputChange}
              error={actionData?.errors?.commodity}
            />
          )}
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
                className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-2">Flat Offer</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="offerType"
                value="negotiable"
                checked={offerType === "negotiable"}
                onChange={() => setOfferType("negotiable")}
                className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-2">Negotiable</span>
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
            />
          )}
        </div>

        <div>
          <button
            type="submit"
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isFormValid
                ? "bg-green-500 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                : "bg-gray-500 cursor-not-allowed"
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