import Popup from "~/components/popup";

interface AlertProps {
  message: string;
  type?: "info" | "warning" | "error" | "success";
  theme?: "light" | "dark";
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  buttonText?: string;
}

export function Alert({
  message,
  type = "info",
  theme = "light",
  onClose,
  autoClose = false,
  duration = 100,
  buttonText,
}: AlertProps) {
  console.log("Rendering Alert:", { message, type, theme, buttonText });

  if (!message) {
    console.warn("Alert rendered without message");
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <Popup
        title={type.charAt(0).toUpperCase() + type.slice(1)}
        message={message}
        type={type}
        theme={theme}
        onClose={onClose}
        autoClose={autoClose}
        duration={duration}
        buttonText={buttonText}
      />
    </div>
  );
}
