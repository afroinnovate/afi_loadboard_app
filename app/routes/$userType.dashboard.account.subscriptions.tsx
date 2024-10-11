import { useLoaderData, useOutletContext } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";

interface OutletContext {
  theme: "light" | "dark";
}

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
  const { theme } = useOutletContext<OutletContext>();

  const isDarkTheme = theme === "dark";

  const themeClasses = {
    text: isDarkTheme ? "text-gray-200" : "text-gray-800",
    label: isDarkTheme ? "text-green-400" : "text-green-700",
    border: isDarkTheme ? "border-gray-700" : "border-gray-200",
    background: isDarkTheme ? "bg-gray-800" : "bg-white",
    cardBorder: isDarkTheme ? "border-green-700" : "border-green-500",
  };

  return (
    <div className={`w-full ${themeClasses.background} p-6 rounded-lg shadow-lg border-2 ${themeClasses.cardBorder}`}>
      <h2 className={`text-2xl font-bold mb-6 ${themeClasses.label}`}>Your Subscription Details</h2>
      <div className="space-y-6">
        <div className={`flex justify-between items-center border-b ${themeClasses.border} py-3`}>
          <span className={`font-semibold ${themeClasses.label}`}>Current Plan:</span>
          <span className={`text-lg ${themeClasses.text}`}>{subscription.plan}</span>
        </div>
        <div className={`flex justify-between items-center border-b ${themeClasses.border} py-3`}>
          <span className={`font-semibold ${themeClasses.label}`}>Status:</span>
          <span className={`text-lg ${themeClasses.text}`}>{subscription.status}</span>
        </div>
        <div className={`flex justify-between items-center border-b ${themeClasses.border} py-3`}>
          <span className={`font-semibold ${themeClasses.label}`}>Next Billing Date:</span>
          <span className={`text-lg ${themeClasses.text}`}>{subscription.nextBillingDate}</span>
        </div>
        <div className={`flex justify-between items-center border-b ${themeClasses.border} py-3`}>
          <span className={`font-semibold ${themeClasses.label}`}>Monthly Amount:</span>
          <span className={`text-lg ${themeClasses.text}`}>{subscription.amount}</span>
        </div>
      </div>

      <div className="mt-8">
        <p className={`${themeClasses.text} mb-4 text-lg`}>
          Your subscription is currently active. You're all set to enjoy our premium features!
        </p>
        <button 
          className={`bg-gray-400 text-white px-6 py-2 rounded cursor-not-allowed opacity-50`}
          disabled
        >
          Manage Subscription
        </button>
        <p className={`mt-2 text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
          Subscription management is currently unavailable. For any changes, please contact our support team.
        </p>
      </div>
    </div>
  );
}
