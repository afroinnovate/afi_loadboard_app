import { Outlet, useParams, useNavigate } from "@remix-run/react";
import { useState } from "react";
import AccountOverlay from "~/components/accountOverlay";
import { ErrorBoundary } from "~/components/errorBoundary";

export default function Account() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { userType } = useParams();
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
      />
    </div>
  );
}

<ErrorBoundary />;
