import { redirect, type ActionFunction } from "@remix-run/node";
import { generateInvoice } from "~/api/services/invoice.service";
import { authenticator } from "~/api/services/auth.server";
import { getSession } from "~/api/services/session";
import { json } from "@remix-run/node";

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(authenticator.sessionKey);

  if (!params.loadId) {
    return json({ error: "Load ID is required" }, { status: 400 });
  }

  try {
    const invoice = await generateInvoice(user.token, parseInt(params.loadId));
    return redirect(`/shipper/dashboard/invoices/${invoice.id}`);
  } catch (error) {
    return json({ error: "Failed to generate invoice" }, { status: 500 });
  }
};
