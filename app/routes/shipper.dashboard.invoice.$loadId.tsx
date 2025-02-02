import { json, LoaderFunction, redirect } from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useLocation,
  useOutletContext,
} from "@remix-run/react";
import { getInvoiceByLoadId } from "~/api/services/invoice.service";
import { getSession } from "~/api/services/session";
import { authenticator } from "~/api/services/auth.server";
import { ShipperInvoiceDetail } from "~/components/invoice/ShipperInvoiceDetail";
import { Alert } from "~/components/Alert";
import type { Invoice } from "~/api/models/invoice";
import type { Load } from "~/api/models/load";
import type { OutletContext } from "~/routes/shipper.dashboard";

interface LoaderData {
  invoice: Invoice | null;
  currentUser: any;
  error?: string;
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
    });
  }

  try {
    const invoice = await getInvoiceByLoadId(user.token, Number(params.loadId));
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Get shipper info from session
    const shipperInfo = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      businessProfile: user.businessProfile || {
        companyName: "Not provided",
        address: "Not provided",
        taxId: "Not provided",
      },
    };

    return json({
      invoice,
      currentUser: shipperInfo,
    });
  } catch (error) {
    console.error("Error fetching invoice data:", error);
    return json({
      invoice: null,
      currentUser: user,
      error: "Failed to fetch invoice details",
    });
  }
};

export default function InvoiceLoadView() {
  const { invoice, currentUser, error } = useLoaderData<LoaderData>();
  const location = useLocation();
  const navigate = useNavigate();
  const loadDetails = location.state?.loadDetails;
  const { theme } = useOutletContext<OutletContext>();

  if (error || !invoice || !loadDetails) {
    return (
      <Alert
        message={error || "Failed to load invoice details. Please try again."}
        type="warning"
        theme={theme}
        onClose={() => navigate("/shipper/dashboard/loads/view")}
        autoClose={false}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ShipperInvoiceDetail
        invoice={invoice}
        load={loadDetails}
        currentUser={currentUser}
        theme={theme}
        onClose={() => navigate("/shipper/dashboard/loads/view")}
      />
    </div>
  );
}
