import { Form, Link, useLoaderData, useParams } from "@remix-run/react";
import type {
  MetaFunction,
  LinksFunction,
  ActionFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import customStyles from "../styles/global.css";
import { authenticator } from "~/api/services/auth.server";
import { getSession } from "~/api/services/session";

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
    failureRedirect: "/login/",
  });
  if (user) {
    return json(user.user);
  }
  // if not check the session
  const session = await getSession(request.headers.get("Cookie"));

  const error = session.get("_auth_error");
  return json<any>({ error });
};

export const action: ActionFunction = async ({ request, params }) => {
  await authenticator.logout(request, {
    redirectTo: "/login/",
  });
};

export default function CarrierDashboard() {
  const loaderData = useLoaderData();
  
  return (
    <>
      <div className="flex justify-end sm:mx-auto sm:w-full sm:max-w-lg">
        <Form reloadDocument method="post" className="mb-0 space-y-6">
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-orange-400 p-3 rounded-md text-center transform hover:scale-110 transition duration-150 ease-in-out"
          >
            Logout
          </button>
        </Form>
      </div>
      <div className="text-center mt-2 sm:mx-auto sm:w-full sm:max-w-xl">
        <h1 className="text-center text-2xl font-extrabold text-gray-900 py-4">
          <div className="font-mono text-center text-3xl text-black-600">
            {" "}
            Carrier Dashboard
          </div>
          Manage Your Loads with Ease.
        </h1>
        <p className="text-center text-bold text-black">
          Login as shipper instead?{" "}
          <Link
            to={`/login/shipper`}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
