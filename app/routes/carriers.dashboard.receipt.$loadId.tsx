import {
  json,
  type LoaderFunction,
  redirect,
  type ActionFunction,
} from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useOutletContext,
  useActionData,
} from "@remix-run/react";
import { getSession } from "~/api/services/session";
import { authenticator } from "~/api/services/auth.server";
import { Receipt } from "~/components/invoice/Receipt";
import type { Invoice } from "~/api/models/invoice";
import { useEffect } from "react";

interface OutletContext {
  loads: any[];
  invoices: Invoice[];
  theme: "light" | "dark";
  timezone: string;
}

interface LoaderData {
  currentUser: any;
  carrierProfile: any;
  loadId: number;
  error?: string;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);
  const carrierProfile = session.get("carrier");

  if (!user) {
    return redirect("/login");
  }

  if (!params.loadId) {
    return json({
      currentUser: user,
      carrierProfile,
      error: "Load ID is required",
      loadId: 0,
    });
  }

  try {
    // Get carrier info from session
    const carrierInfo = {
      firstName: carrierProfile.user.firstName,
      middleName: carrierProfile.user.middleName,
      lastName: carrierProfile.user.lastName,
      email: carrierProfile.user.email,
      phone: carrierProfile.user.phoneNumber,
      businessProfile: carrierProfile.user.businessProfile,
    };

    return json({
      currentUser: carrierInfo,
      carrierProfile,
      loadId: Number(params.loadId),
    });
  } catch (error) {
    console.error("Error fetching receipt data:", error);
    return json({
      currentUser: user,
      carrierProfile,
      error: "Failed to fetch receipt details",
      loadId: Number(params.loadId),
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const buttonType = formData.get("_action");
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);

  switch (buttonType) {
    case "close":
      // Get user type from session and redirect accordingly
      const userType = user?.user?.userType || "carrier";
      return redirect(`/${userType}s/dashboard/invoices`);
    case "print":
    case "download":
      return json({ action: buttonType });
    default:
      return null;
  }
};

export default function CarrierReceiptView() {
  const { currentUser, carrierProfile, loadId, error } =
    useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const { loads, theme, invoices } = useOutletContext<OutletContext>();
  const actionData = useActionData();

  console.log("loads: ", loads);
  console.log("invoices: ", invoices);

  const loadDetails = loads?.find((load) => load.loadId === Number(loadId));
  const invoice = invoices?.find((inv) => inv.loadId === Number(loadId));

  console.log("invoice: ", invoice);
  console.log("load: ", loadDetails);
  // Handle print/download action
  useEffect(() => {
    if (actionData?.action === "print" || actionData?.action === "download") {
      setTimeout(() => {
        window.print();
      }, 100);
    }
  }, [actionData]);

  // Only check error and loadDetails - invoice comes from context
  if (error || !loadDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">
            {error || "Failed to load receipt details. Please try again."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if we have the invoice from context
  if (!invoice) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Receipt Not Found
          </h2>
          <p className="text-gray-700">
            Could not find the receipt for this load. Please try again.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <Receipt
          invoice={invoice}
          load={loadDetails}
          theme={theme}
          userType="carrier"
        />
      </div>
    </div>
  );
}
