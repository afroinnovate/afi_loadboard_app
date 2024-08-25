import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ params, request }) => {
  const { userType } = params;
  // TODO: Fetch actual subscription data
  const mockSubscriptionData = {
    plan: "Premium",
    status: "Active",
    nextBillingDate: "2023-09-01",
    amount: "$99.99",
  };
  return json({ userType, subscription: mockSubscriptionData });
};

export default function Subscriptions() {
  const { userType, subscription } = useLoaderData();

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b py-3">
          <span className="font-semibold text-green-700">Current Plan:</span>
          <span>{subscription.plan}</span>
        </div>
        <div className="flex justify-between items-center border-b py-3">
          <span className="font-semibold text-green-700">Status:</span>
          <span>{subscription.status}</span>
        </div>
        <div className="flex justify-between items-center border-b py-3">
          <span className="font-semibold text-green-700">
            Next Billing Date:
          </span>
          <span>{subscription.nextBillingDate}</span>
        </div>
        <div className="flex justify-between items-center border-b py-3">
          <span className="font-semibold text-green-700">Monthly Amount:</span>
          <span>{subscription.amount}</span>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-green-700 mb-4">
          Your subscription is currently active. You can manage your
          subscription or upgrade your plan at any time.
        </p>
        <button className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition duration-300">
          Manage Subscription
        </button>
      </div>
    </div>
  );
}
