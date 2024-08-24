import React, { useState } from "react";
import { ChatBubbleLeftIcon, ClipboardIcon } from "@heroicons/react/16/solid";
import { Form, Link } from "@remix-run/react";

// Subtle Alert Component
const SubtleAlert = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md transition-opacity duration-300">
      {message}
    </div>
  );
};

const ContactShipperView = ({ shipper, load }: any) => {
  const [alertVisible, setAlertVisible] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setAlertVisible(true);
        setTimeout(() => setAlertVisible(false), 2000);
      },
      (err) => console.error(`Failed to copy to clipboard: ${err}`)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full space-y-4 text-green-900">
        <div className="p-6 space-y-4">
          <h3 className="text-2xl font-bold text-green-700">Contact Shipper</h3>
          <div>
            <p className="font-semibold text-lg">
              {shipper.firstName} {shipper.lastName}
            </p>
            <p className="text-sm text-green-600 italic">
              Company: {shipper.businessProfile.companyName}
            </p>
            <p className="text-sm text-green-500 italic">
              Registration Number:{" "}
              {shipper.businessProfile.businessRegistrationNumber}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-green-50 p-3 rounded">
              <p className="text-green-700">
                Email: <span className="font-medium">{shipper.email}</span>
              </p>
              <button
                onClick={() => copyToClipboard(shipper.email)}
                className="text-green-600 hover:text-green-800"
              >
                <ClipboardIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-between bg-green-50 p-3 rounded">
              <p className="text-green-700">
                Phone: <span className="font-medium">{shipper.phone}</span>
              </p>
              <button
                onClick={() => copyToClipboard(shipper.phone)}
                className="text-green-600 hover:text-green-800"
              >
                <ClipboardIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between">
          <Link
            to="/carriers/dashboard/view"
            className="flex items-center px-4 py-2 text-sm font-medium text-green-500 border border-green-700 rounded hover:bg-green-700  hover:text-white transition-colors duration-200"
          >
            <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
            Chat
          </Link>
          <Form method="post">
            <button
              type="submit"
              name="_action"
              value="closeContact"
              className="px-4 py-2 text-sm font-medium text-green-600 bg-gray-200 border border-green-600 rounded hover:bg-green-700 hover:text-white transition-colors duration-200"
            >
              Close
            </button>
          </Form>
        </div>
      </div>
      <SubtleAlert message="Copied to clipboard!" isVisible={alertVisible} />
    </div>
  );
};

export default ContactShipperView;
