// app/root.tsx
import { type LinksFunction, type LoaderFunction, json, type MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useLoaderData,
  useLocation,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import rootStyle from './tailwindcss.css';
import ErrorDisplay from "./components/ErrorDisplay";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { commitSession, getSession } from "./api/services/session";
import Header from "./components/headers";
import { authenticator } from "./api/services/auth.server";


export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Home",
      description: "Home page for Loadboard.",
    },
  ];
};

export const links: LinksFunction = () => [
  ...(rootStyle ? [{ rel: "stylesheet", href: rootStyle }, ] : []),
];

export const loader: LoaderFunction = async ({ request }) => {
  try{
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get(authenticator.sessionKey);

    const session_expiration: any = process.env.SESSION_EXPIRATION;
    const EXPIRES_IN = parseInt(session_expiration) * 1000; // Convert seconds to milliseconds
    if (isNaN(EXPIRES_IN)) {
      throw new Error("SESSION_EXPIRATION is not set or is not a valid number");
    }

    if (!user) {
      return "/";
    }

    const expires = new Date(Date.now() + EXPIRES_IN);
    session.set(authenticator.sessionKey, user);
    await commitSession(session, { expires});

    return json({ user });
  } catch (e: any) {
    if(JSON.parse(e).data.status === 401){
      return "/";
    }
    throw e;
  }
}

export default function App() {  
  const loaderData: any = useLoaderData();
  const location = useLocation();
  let user = loaderData?.user;
  if(loaderData === "/" || location.pathname === "/"){
    user = null;
  }else{
    user = loaderData?.user;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-100 text-gray-800">
        <header className="top-0 left-0 right-0 z-10 bg-white shadow-md">
          <Header user={ user } />
        </header>
        <main className="flex-grow">
          <Outlet />
        </main>
        <footer className="bg-gray-800 text-white py-6">
          <div className="container mx-auto text-center">
            <nav className="flex justify-center space-x-4">
              <Link to="/features" className="hover:text-blue-400">Features</Link>
              <Link to="/how-it-works" className="hover:text-blue-400">How It Works</Link>
              <Link to="/pricing" className="hover:text-blue-400">Pricing</Link>
              <Link to="/contact" className="hover:text-blue-400">Contacts</Link>
            </nav>
            <p className="mt-4">
              © 2023 AfroInnovate LoadBoard. All rights reserved.
            </p>
          </div>
        </footer>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const errorResponse: any = useRouteError();
  if (isRouteErrorResponse(errorResponse)) {
    // const jsonError = JSON.parse(errorResponse);
    const error = {
      message: errorResponse.data.message,
      status: errorResponse.data.status,
    };

    return <ErrorDisplay error={error} />;
  }
  return (
    <div className="flex content-center bg-red-800 text-white">
      <h1>Uh oh ...</h1>
      <p>Something went wrong.</p>
      <pre>{errorResponse}</pre>
    </div>
  );
}

// export function ErrorBoundary() {
//   const errorResponse: any = useRouteError();
//   const handleReload = () => {
//     window.location.reload();
//   };

//   let error = null;

//   if (typeof errorResponse === "string") {
//     const parsedError = JSON.parse(errorResponse);
//     error = {
//       message: parsedError.data.message,
//       status: parsedError.data.status,
//     };
//   }

//   return (
//     <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
//       <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 shadow-lg text-center animate__animated animate__fadeInDown">
//         {error?.message && error?.status ? (
//           <ErrorDisplay error={error} />
//         ) : (
//           <>
//             <strong className="font-bold text-red-500 text-lg">Oops!</strong>
//             <p className="text-red-700 mt-2 text-sm">
//               Something went wrong. Please try again or visit later.
//             </p>
//             <div className="mt-4">
//               <button
//                 onClick={handleReload}
//                 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
//               >
//                 <FontAwesomeIcon icon={faRedo} className="mr-2" />
//                 Try Again
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
