console.log("Loading receipt route file...");

import {
  json,
  LoaderFunction,
  redirect,
  ActionFunction,
} from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useOutletContext,
  useLocation,
} from "@remix-run/react";
import { getInvoiceByLoadId } from "~/api/services/invoice.service";
import { getSession } from "~/api/services/session";
import { authenticator } from "~/api/services/auth.server";
import { Receipt } from "~/components/invoice/Receipt";
import type { Invoice } from "~/api/models/invoice";
import type { Load } from "~/api/models/load";
import type { OutletContext } from "~/routes/shipper.dashboard";

interface LoaderData {
  invoice: Invoice | null;
  currentUser: any;
  error?: string;
  loadId: string | number;
}

// Add console log before loader
console.log("Setting up loader...");

// Add route ID to help with debugging
export const routeId = "$userType.dashboard.receipt.$loadId";

console.log(`Route ${routeId} loading...`);

export const loader: LoaderFunction = async ({ request, params }) => {
  console.log("Loader executing...");
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);

  if (!user) {
    return redirect("/login");
  }

  if (!params.loadId) {
    return json({
      invoice: null,
      currentUser: user,
      error: "Load ID is required",
      loadId: params.loadId,
    });
  }

  try {
    const invoice = await getInvoiceByLoadId(user.token, Number(params.loadId));

    if (invoice === undefined) {
      throw new Error("Invoice not found");
    }

    // Get user info from session
    const userInfo = {
      firstName: user.user.firstName,
      middleName: user.user.middleName,
      lastName: user.user.lastName,
      email: user.user.email,
      phone: user.user.phoneNumber,
    };

    return json({
      invoice,
      currentUser: userInfo,
      loadId: Number(params.loadId),
    });
  } catch (error) {
    console.error("Error fetching receipt data:", error);
    return json({
      invoice: null,
      currentUser: user,
      error: "Failed to fetch receipt details",
      loadId: params.loadId,
    });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const buttonType = formData.get("_action");

  switch (buttonType) {
    case "close":
      return redirect(`/${params.userType}/dashboard/invoices`);
    case "print":
      // Handle print action if needed
      return null;
    case "download":
      // Handle download action if needed
      // create the download as print (pdf) save of the receipt

      return null;
    default:
      return null;
  }
};

// Add console log before component
console.log("Defining ReceiptView component...");

export default function ReceiptView() {
  console.log("ReceiptView component rendering...");
  const { invoice, currentUser, loadId, error } = useLoaderData<LoaderData>();

  // Add console log after data load
  console.log("Data loaded in ReceiptView:", { invoice, currentUser, loadId });

  const navigate = useNavigate();
  const { loads, theme } = useOutletContext<OutletContext>();

  // Convert loadId to number for comparison
  const loadDetails = loads?.find((load: Load) => load.id === Number(loadId));

  // Add more detailed logging
  console.log("LoadID from params:", loadId);
  console.log("Available loads:", loads);
  console.log("Found load details:", loadDetails);
  console.log("Current user:", currentUser);
  console.log("Invoice details:", invoice);

  if (error || !invoice || !loadDetails) {
    console.log("Error condition met:", {
      error,
      invoice: !!invoice,
      loadDetails: !!loadDetails,
    });
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">
            {error || "Failed to load receipt. Please try again."}
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Receipt invoice={invoice} load={loadDetails} theme={theme} />
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error("Receipt route error:", error);
  return (
    <div className="error-container">
      <h1>Error</h1>
      <p>{error.message}</p>
    </div>
  );
}
