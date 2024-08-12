// app/routes/logout.tsx
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/api/services/auth.server";
import { commitSession, getSession } from "~/api/services/session";

export const loader: LoaderFunction = async ({ request }) => {
  var session = await getSession(request.headers.get("Cookie"));
  session.set(authenticator.sessionKey, null);
  session.set(authenticator.sessionErrorKey, null);
  session.set("carrier", null);
  session.set("shipper", null);
  await commitSession(session);
  await authenticator.logout(request, {
    redirectTo: "/login/",
  });
};
export const action: ActionFunction = async ({ request, params }) => {
  var session = await getSession(request.headers.get("Cookie"));
  session.set(authenticator.sessionKey, null);
  session.set(authenticator.sessionErrorKey, null);
  session.set("carrier", null);
  session.set("shipper", null);
  await commitSession(session);
  await authenticator.logout(request, {
      redirectTo: "/login/",
  });
};

