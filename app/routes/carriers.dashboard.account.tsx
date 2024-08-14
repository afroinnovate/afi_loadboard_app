import { useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import AccountOverlay from "~/components/accountOverlay";
import { ErrorBoundary } from "~/components/errorBoundary";

export default function Account() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(true);
  const [closedOverlay, setClosedOverlay] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const baseUrl =
    location.pathname == "/dashboard/" ? "/dashboard" : "/carriers/dashboard";
  const closeOverlay = () => {
    setClosedOverlay(true);
    setIsOverlayOpen(false);
  };

  useEffect(() => {
    if (closedOverlay) {
      const goBack =
        baseUrl.split("/").length >= 5
          ? baseUrl.split("/").slice(0, -2).join("/")
          : baseUrl;
      navigate(goBack + "/");
    }
  }, [baseUrl, closedOverlay, navigate]);

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {isOverlayOpen && !closedOverlay && (
        <AccountOverlay onClose={closeOverlay} />
      )}
      <div
        className={`flex-1 transition-opacity ${
          isOverlayOpen ? "opacity-50" : "opacity-100"
        }`}
      >
      </div>
    </div>
  );
}


<ErrorBoundary />;