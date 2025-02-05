import { XMarkIcon } from "@heroicons/react/24/outline";
import { Form } from "@remix-run/react";

interface PopupProps {
  title: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  theme?: "light" | "dark";
  buttonText?: string;
  actionValue?: string;
}

export default function Popup({
  title,
  message,
  type = "info",
  theme = "light",
  buttonText = "Close",
  actionValue = "close",
}: PopupProps) {
  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    overlay: "fixed inset-0 bg-black bg-opacity-50 z-[100]",
  };

  const typeClasses = {
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  return (
    <div className={themeClasses.overlay}>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={`${themeClasses.container} max-w-md w-full rounded-lg shadow-xl`}
        >
          <div
            className={`${typeClasses[type]} px-4 py-2 rounded-t-lg flex justify-between items-center`}
          >
            <h3 className="font-semibold">{title}</h3>
            <Form method="post">
              <button
                type="submit"
                name="_action"
                value={actionValue}
                className="p-1 hover:bg-opacity-20 hover:bg-black rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </Form>
          </div>
          <div className="p-4">
            <p className="mb-4">{message}</p>
            <div className="flex justify-end">
              <Form method="post">
                <button
                  type="submit"
                  name="_action"
                  value={actionValue}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  {buttonText}
                </button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
