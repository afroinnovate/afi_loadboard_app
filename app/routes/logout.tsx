// app/routes/logout.tsx
import type { ActionFunction } from "@remix-run/node";
import { authenticator } from "~/api/services/auth.server";

export const action: ActionFunction = async ({ request, params }) => {
    await authenticator.logout(request, {
        redirectTo: "/login/",
    });
};
