import { useNavigation, Form, Link, useParams} from "@remix-run/react";
import { type MetaFunction, type LinksFunction, type ActionFunction, redirect } from "@remix-run/node";
import customStyles from "../styles/global.css";
import { User } from "~/api/models/user";
import { Register } from "~/api/services/auth";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Sign Up",
      description: "Sign up for a new account",
    },
  ];
};

export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

export const action: ActionFunction = async ({request, params }) => {
  // invariant(params.customer, "Missing customer parameter");
  const body = await request.formData();
  console.log('body -->', Object.fromEntries(body))

  const user: User = {
    id: 0,
    email: body.get("email") as string,
    password: body.get("password") as string,
  }

  await Register(user)

  return redirect(`/login/${params.customer}`)
}

export default function Signup() {
  const { customer } = useParams()
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const inputStyle = `border border-slate-400 rounded py-2 px-3 inline-block w-full`
  return (
    <>
      <div className="text-center mt-2 sm:mx-auto sm:w-full sm:max-w-xl">
        <h1 className="text-center text-2xl font-extrabold text-gray-900 py-4">
          <div className="font-mono text-center text-3xl text-black-600">Register as {customer?.toLocaleUpperCase()}</div>
         Create Account
          {/* Create your account */}
        </h1>
        <p className="text-center text-bold text-black">
          Already registered? {" "}
          <Link to={`/login/${customer}`} className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-lg rounded-xlg sm:px-10">
          <Form reloadDocument method="post" className="mb-0 space-y-6">
            <fieldset>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email"
                name="email" 
                className={inputStyle}
                required />
            </fieldset>
            <fieldset>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" 
                name="password" 
                id="password" className={inputStyle} 
                required/>
            </fieldset>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-orange-400 focus:outline-1 focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
            >
              {isSubmitting ? "Signing Up..." : "Create Account"}
            </button>

          </Form>
          {/* <Form reloadDocument method="post" className="mb-0 space-y-6">
            <div className="grid grid-cols-4 gap-12">
              <div className="col-span-2 col-start-0 col-end-1">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"

                  required
                  className="mt-1 block border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="col-span-2 col-start-1 col-end-4">
                <label
                  htmlFor="middleName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Middle Name
                </label>
                <input
                  id="middleName"
                  name="middleName"
                  type="text"
                  className="mt-1 block border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500  focus:border-indigo-500"
                />
              </div>
              <div className="col-span-2 col-start-0 col-end-1">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="mt-1 block border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="col-span-2 col-start-1 col-end-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  className="mt-1 block border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="col-span-4 col-start-0 col-end-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="col-span-4 col-start-0 col-end-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="col-span-4 col-start-0 col-end-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className=" col-span-4 col-start-0 col-end-4 flex items-center">
                <input
                  id="terms-and-privacy"
                  name="terms-and-privacy"
                  type="checkbox"
                  required
                  className="h-4 w-4 border-gray-300 rounded text-blue-700 focus:ring-orange-700"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-900"
                >
                  I agree to the{" "}
                  <Link to="/terms"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >Terms </Link>
                  and
                  <Link to="/terms"
                    className="font-medium text-blue-600 hover:text-blue-500"> Privacy Policy</Link>
                </label>
              </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-orange-400 focus:outline-1 focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
            >
              {isSubmitting ? "Signing Up..." : "Create Account"}
            </button>
          </Form> */}
        </div>
      </div>
    </>
  );
}
function invariant(customer: string | undefined, arg1: string) {
  throw new Error("Function not implemented.");
}

