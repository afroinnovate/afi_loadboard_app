// ContactShipperView.jsx
import { ChatBubbleLeftIcon, ClipboardIcon } from "@heroicons/react/16/solid";
import { Form, Link } from "@remix-run/react";
import React from "react";

const ContactShipperView = ({ shipper }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => alert("Copied to clipboard!"),
      (err) => alert("Failed to copy to clipboard", err)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4">
        <h3 className="text-lg font-bold">Contact Shipper</h3>
        <div>
          <p className="font-semibold"><p>{shipper.firstName} {shipper.lastName}</p></p>
          <span className="text-sm italic ">Company: </span><p className="text-green-500 font-semibold">{shipper.companyName}</p>    
          <span className="text-sm italic">Registration Number: </span><p className="text-green-500 font-semibold">{shipper.dotNumber}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p>Email: <span className="text-blue-600 underline italic cursor-pointer">{shipper.email}</span></p>
            <button
              onClick={() => copyToClipboard(shipper.email)}
              className="text-blue-500 hover:text-blue-700 underline"
            >
              <ClipboardIcon className="text-gray-700 w-5 h-5 mr-2"/>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p>Phone:  <span className="text-blue-600 underline italic cursor-none">{shipper.phoneNumber}</span></p>
            <button
              onClick={() => copyToClipboard(shipper.phoneNumber)}
              className="text-blue-500 hover:text-blue-700 underline"
            >
              <ClipboardIcon className="text-gray-700 w-5 h-5 mr-2"/>
            </button>
          </div>
        </div>
        <Form method="post">
          <div className="flex space-x-4">
            <Link
              to="/shipper/dashboard/chat"
              className="flex items-center px-4 py-2 text-sm font-medium text-green-400 bg-gray-700 border border-green-400 rounded hover:bg-green-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
            <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
              Chat
            </Link>
            <button
              type="submit"
              name="_action"
              value="closeContact"
              className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ContactShipperView;
