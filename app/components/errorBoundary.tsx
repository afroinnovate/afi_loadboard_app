import { useRouteError } from "@remix-run/react";
import ErrorDisplay from "./ErrorDisplay";

export function ErrorBoundary() {
  const error: any = useRouteError();
  let errorMessage =
    JSON.parse(error.message).data.message || "An error occurred";
  let errorStatus = JSON.parse(error.message).data.status || 500;
  let errorResponse = {
    message: errorMessage,
    status: errorStatus,
  };
  if (error instanceof Error) {
    errorMessage = JSON.parse(error.message).data.message;
  } else if (typeof error === "string") {
    try {
      const parsedError = JSON.parse(error);
      if (parsedError && parsedError.data) {
        errorMessage = parsedError.data.message || errorMessage;
        errorStatus = parsedError.data.status || errorStatus;
      }
      errorResponse = {
        message: errorMessage,
        status: errorStatus,
      };
    } catch (e) {
      // If parsing fails, use the error string as is
      errorMessage = error;
    }
  }

  return <ErrorDisplay error={errorResponse} />;
}
