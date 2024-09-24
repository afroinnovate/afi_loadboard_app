import { useParams, useNavigate, useOutletContext } from "@remix-run/react";
import { useState } from "react";
import AccountOverlay from "~/components/accountOverlay";
import { ErrorBoundary } from "~/components/errorBoundary";

interface OutletContext {
  theme: "light" | "dark";
}

export default function Account() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme } = useOutletContext<OutletContext>();
  const isDarkTheme = theme === "dark";
  
  const { userType } = useParams();
  console.log("User type from URL: ", userType);
  const navigate = useNavigate();

  const baseUrl = `/${userType}/dashboard`;

  const closeOverlay = () => {
    navigate(baseUrl);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full bg-white mt-14">
      <AccountOverlay
        onClose={closeOverlay}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        theme={theme}
      />
    </div>
  );
}

<ErrorBoundary />;
