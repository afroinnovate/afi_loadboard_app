import React from "react";
import { Form, redirect } from "@remix-run/react";
import { type ActionFunction } from "@remix-run/node";

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}


export const action: ActionFunction = async ({ request }) => {
  return redirect("/logout/");
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, message, onClose }) => {

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-800 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center pb-3">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <p className="text-gray-700">{message}</p>
        <div className="mt-4 flex justify-end">
          <Form method="post">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              name="_action"
              value="updated"
            >
              Confirm and Logout
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Modal;
