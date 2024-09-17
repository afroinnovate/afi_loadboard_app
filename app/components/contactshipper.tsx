import React from 'react';
import { Form } from '@remix-run/react';

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
}

export default function ContactShipperView({ shipper, load, onClose, onChat }: ContactShipperViewProps) {
  const shipperName = shipper?.companyName || `${shipper?.firstName || 'Unknown'} ${shipper?.lastName || 'Shipper'}`;
  const shipperEmail = shipper?.email || 'Not provided';
  const shipperPhone = shipper?.phone || 'Not provided';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Contact Shipper</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Shipper: {shipperName}
            </p>
            <p className="text-sm text-gray-500">
              Email: {shipperEmail}
            </p>
            <p className="text-sm text-gray-500">
              Phone: {shipperPhone}
            </p>
            {load && (
              <p className="text-sm text-gray-500">
                Load: {load.origin} to {load.destination}
              </p>
            )}
          </div>
          <div className="items-center px-4 py-3">
            <Form method="post">
              <input type="hidden" name="shipperId" value={shipper?.id || ''} />
              <input type="hidden" name="loadId" value={load?.id || ''} />
              <button
                type="submit"
                name="_action"
                value="sendMessage"
                onClick={onChat}
                className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Send Message
              </button>
            </Form>
            <Form method="post">
              <button
                type="submit"
                name="_action"
                value="closeContact"
                onClick={onClose}
                className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Close
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
