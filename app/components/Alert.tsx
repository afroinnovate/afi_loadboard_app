import Popup from "~/components/popup";

interface AlertProps {
  message: string;
  type?: "info" | "warning" | "error" | "success";
  theme?: "light" | "dark";
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function Alert({
  message,
  type = "info",
  theme = "light",
  onClose,
  autoClose = true,
  duration = 5000,
}: AlertProps) {
  return (
    <Popup
      title={type.charAt(0).toUpperCase() + type.slice(1)}
      message={message}
      type={type}
      theme={theme}
      onClose={onClose}
      autoClose={autoClose}
      duration={duration}
    />
  );
}
