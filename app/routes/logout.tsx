// app/routes/logout.tsx
import { redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/api/services/auth.server";
import { commitSession, destroySession, getSession } from "~/api/services/session";
import { ErrorBoundary } from "~/components/errorBoundary";

export const loader: LoaderFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));
  
  // Completely destroy the session
  return redirect("/login/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  let session = await getSession(request.headers.get("Cookie"));

  // Completely destroy the session
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

<ErrorBoundary />;