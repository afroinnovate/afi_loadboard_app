import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/20/solid";

export default function AccountHelp() {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6 text-green-800">Need Help?</h2>
      <div className="space-y-6">
        <div className="flex items-center space-x-4 border-b pb-4">
          <EnvelopeIcon className="h-6 w-6 text-green-700 flex-shrink-0" />
          <p className="text-lg flex-grow">
            Email us at:{" "}
            <a
              href="mailto:afroinnovate@gmail.com"
              className="text-blue-600 hover:text-blue-800 hover:underline transition duration-300"
            >
              afroinnovate@gmail.com
            </a>
          </p>
        </div>
        <div className="flex items-center space-x-4 border-b pb-4">
          <PhoneIcon className="h-6 w-6 text-green-700 flex-shrink-0" />
          <p className="text-lg flex-grow">
            Call us at:{" "}
            <a
              href="tel:+25171234578"
              className="text-blue-600 hover:text-blue-800 transition duration-300 hover:underline hover:italic"
            >
              (+251)912-345-678
            </a>
          </p>
        </div>
      </div>
      <div className="mt-8 text-sm text-gray-600">
        Our support team is available Monday to Friday, 9 AM to 5 PM (Ethiopian
        Time).
      </div>
    </div>
  );
}
