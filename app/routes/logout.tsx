// app/routes/logout.tsx
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/api/services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
   await authenticator.logout(request, {
     redirectTo: "/login/",
   });
};
export const action: ActionFunction = async ({ request, params }) => {
    await authenticator.logout(request, {
        redirectTo: "/login/",
    });
};

