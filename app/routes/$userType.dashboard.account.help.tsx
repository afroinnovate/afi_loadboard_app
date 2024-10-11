import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/20/solid";
import { useOutletContext, useParams, Link } from "@remix-run/react";

interface OutletContext {
  theme: "light" | "dark";
}

export default function AccountHelp() {
  const { theme } = useOutletContext<OutletContext>();
  const { userType } = useParams();
  const isDarkTheme = theme === "dark";

  const themeClasses = {
    container: isDarkTheme ? "bg-gray-900 text-white" : "bg-white text-gray-900",
    header: isDarkTheme ? "text-green-400" : "text-green-800",
    text: isDarkTheme ? "text-gray-300" : "text-gray-600",
    link: isDarkTheme ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800",
    icon: isDarkTheme ? "text-green-400" : "text-green-700",
    border: isDarkTheme ? "border-gray-700" : "border-gray-200",
    cardBorder: isDarkTheme ? "border-green-700" : "border-green-500",
    button: isDarkTheme ? "bg-green-700 text-white hover:bg-green-600" : "bg-green-500 text-white hover:bg-green-400",
  };

  return (
    <div className={`w-full ${themeClasses.container} p-6 rounded-lg shadow-lg border-2 ${themeClasses.cardBorder}`}>
      <div className="mb-4">
        <Link
          to={`/${userType}/dashboard/`}
          className={`inline-block px-4 py-2 rounded ${themeClasses.button}`}
        >
          Back to Dashboard
        </Link>
      </div>

      <h2 className={`text-2xl font-semibold mb-6 ${themeClasses.header}`}>Need Help?</h2>
      <div className="space-y-6">
        <div className={`flex items-center space-x-4 border-b pb-4 ${themeClasses.border}`}>
          <EnvelopeIcon className={`h-6 w-6 ${themeClasses.icon} flex-shrink-0`} />
          <p className={`text-lg flex-grow ${themeClasses.text}`}>
            Email us at:{" "}
            <a
              href="mailto:afroinnovate@gmail.com"
              className={`${themeClasses.link} hover:underline transition duration-300`}
            >
              afroinnovate@gmail.com
            </a>
          </p>
        </div>
        <div className={`flex items-center space-x-4 border-b pb-4 ${themeClasses.border}`}>
          <PhoneIcon className={`h-6 w-6 ${themeClasses.icon} flex-shrink-0`} />
          <p className={`text-lg flex-grow ${themeClasses.text}`}>
            Call us at:{" "}
            <a
              href="tel:+25171234578"
              className={`${themeClasses.link} transition duration-300 hover:underline hover:italic`}
            >
              (+251)912-345-678
            </a>
          </p>
        </div>
      </div>
      <div className={`mt-8 text-sm ${themeClasses.text}`}>
        Our support team is available Monday to Friday, 9 AM to 5 PM (Ethiopian
        Time).
      </div>
    </div>
  );
}
