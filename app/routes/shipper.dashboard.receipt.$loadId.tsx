import {
  json,
  LoaderFunction,
  redirect,
  ActionFunction,
} from "@remix-run/node";
import { useLoaderData, useNavigate, useOutletContext } from "@remix-run/react";
import { getInvoiceByLoadId } from "~/api/services/invoice.service";
import { getSession } from "~/api/services/session";
import { authenticator } from "~/api/services/auth.server";
import { Receipt } from "~/components/invoice/Receipt";
import type { Invoice } from "~/api/models/invoice";
import type { OutletContext as ShipperDashboardContext } from "~/routes/shipper.dashboard";

interface OutletContext extends ShipperDashboardContext {
  loads: any[];
  bidsDict: any[];
  theme: "light" | "dark";
  timezone: string;
}

interface LoaderData {
  invoice: Invoice | null;
  currentUser: any;
  error?: string;
  loadId: number;
}

export const loader: LoaderFunction = async ({ request, params }) => {
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
      loadId: 0,
    });
  }

  try {
    const invoice = await getInvoiceByLoadId(user.token, Number(params.loadId));
    console.log("Getting invoice:", invoice);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Get shipper info from session
    const shipperInfo = {
      firstName: user.user.firstName,
      middleName: user.user.middleName,
      lastName: user.user.lastName,
      email: user.user.email,
      phone: user.user.phoneNumber,
    };

    return json({
      invoice,
      currentUser: shipperInfo,
      loadId: Number(params.loadId),
    });
  } catch (error) {
    console.error("Error fetching receipt data:", error);
    return json({
      invoice: null,
      currentUser: user,
      error: "Failed to fetch receipt details",
      loadId: Number(params.loadId),
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const buttonType = formData.get("_action");

  switch (buttonType) {
    case "close":
      return redirect("/shipper/dashboard/invoices");
    case "print":
      // Handle print action if needed
      return null;
    case "download":
      // Handle download action if needed
      return null;
    default:
      return null;
  }
};

export default function ShipperReceiptView() {
  console.log("ShipperReceiptView rendering...");
  const { invoice, currentUser, loadId, error } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const outletContext = useOutletContext<OutletContext>();
  const { loads, theme } = outletContext;

  // Add debug logs
  console.log("Outlet Context:", outletContext);
  console.log("Available loads:", loads);

  // Find load details from context using loadId
  const loadDetails = loads?.find((load) => load.loadId === Number(loadId));
  console.log("LoadID being searched:", loadId);
  console.log("Load details found:", loadDetails);

  if (error || !invoice || !loadDetails) {
    console.log("Error condition met:", {
      error,
      hasInvoice: !!invoice,
      hasLoadDetails: !!loadDetails,
      loadsLength: loads?.length,
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
