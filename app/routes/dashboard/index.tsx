import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import type {
  MetaFunction,
  LinksFunction,
  ActionFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import customStyles from "../../styles/global.css";
import { authenticator } from "~/api/services/auth.server";
import { getSession } from "~/api/services/session";
import Sidebar from "~/components/sidebar";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Carrier dashboard",
      description: "Sign up for a new account",
    },
  ];
};
export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

//protect this route with authentication
export const loader: LoaderFunction = async ({ request }) => {
  //check if the sessoon is already set
  let user = await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard/",
  });
  console.log("I came to the dashboard page");
  if (user) {
    return json(user.user);
  }
  // if not check the session
  const session = await getSession(request.headers.get("Cookie"));

  const error = session.get("_auth_error");
  console.log("logging error", error);
  return json<any>({ error });
};

export default function Dashboard() {
  const loaderData = useLoaderData();
  console.log("dashboard logging loader data", loaderData);
  return (
    <div className="flex flex-col sm:flex-row">
      <Sidebar />
      <main className="flex-1">
        <h1 className="text-3xl font-bold underline">
          Carrier Dashboard
        </h1>
        <p className="text-xl font-bold">
           Welcome to the carrier dashboard
        </p>
        <Outlet />
      </main>
    </div>
  );
}
