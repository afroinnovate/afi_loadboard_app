import React from 'react';
import { Form } from '@remix-run/react';
import { PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, XMarkIcon } from "@heroicons/react/20/solid";

interface ContactShipperViewProps {
  shipper: {
    companyName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null | undefined;
  load?: any;
  onClose?: () => void;
  onChat?: () => void;
  theme?: 'light' | 'dark';
}

export default function ContactShipperView({ shipper, load, onClose, onChat, theme = 'dark' }: ContactShipperViewProps) {
  const shipperName = shipper?.companyName || `${shipper?.firstName || 'Unknown'} ${shipper?.lastName || 'Shipper'}`;
  const shipperEmail = shipper?.email || 'Not provided';
  const shipperPhone = shipper?.phone || 'Not provided';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  const themeClasses = theme === 'light' 
    ? 'bg-white text-gray-800'
    : 'bg-gray-800 text-white';

  const closeButtonClasses = theme === 'light'
    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
    : 'bg-gray-700 hover:bg-gray-600 text-white';

  const chatButtonClasses = 'border border-green-500 text-green-500 hover:bg-green-500 hover:text-white';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className={`p-4 sm:p-6 border rounded-lg shadow-xl ${themeClasses} w-full max-w-sm sm:max-w-md`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-semibold">Contact Shipper</h3>
          <button onClick={onClose} className={`p-1 rounded-full ${closeButtonClasses}`}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <p className="font-medium">{shipperName}</p>
          {load && (
            <p className="text-sm opacity-75">
              Load: {load.origin} to {load.destination}
            </p>
          )}
          <div className="flex items-center space-x-2">
            <EnvelopeIcon className="w-5 h-5 opacity-75 flex-shrink-0" />
            <a href={`mailto:${shipperEmail}`} className="hover:underline truncate text-sm sm:text-base">{shipperEmail}</a>
            <button 
              onClick={() => copyToClipboard(shipperEmail)} 
              className={`ml-auto text-xs sm:text-sm ${closeButtonClasses} px-2 py-1 rounded flex-shrink-0`}
            >
              Copy
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <PhoneIcon className="w-5 h-5 opacity-75 flex-shrink-0" />
            <a href={`tel:${shipperPhone}`} className="hover:underline text-sm sm:text-base">{shipperPhone}</a>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Form method="post" className="flex-1">
              <input type="hidden" name="shipperId" value={shipper?.id || ''} />
              <input type="hidden" name="loadId" value={load?.id || ''} />
              <button
                type="submit"
                name="_action"
                value="sendMessage"
                onClick={onChat}
                className={`flex items-center justify-center w-full ${chatButtonClasses} px-4 py-2 rounded-md transition duration-300 ease-in-out text-sm sm:text-base`}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                Chat
              </button>
            </Form>
            <Form method="post" className="flex-1">
              <button
                type="submit"
                name="_action"
                value="closeContact"
                onClick={onClose}
                className={`flex items-center justify-center w-full ${closeButtonClasses} px-4 py-2 rounded-md transition duration-300 ease-in-out text-sm sm:text-base`}
              >
                <XMarkIcon className="w-5 h-5 mr-2" />
                Close
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
