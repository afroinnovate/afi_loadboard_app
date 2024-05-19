import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import AccountOverlay from "~/components/accountOverlay";

export default function Account() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(true);
  const [closedOverlay, setClosedOverlay] = useState(false);

  const location = useLocation();
  const navigate = useNavigate()
  // const baseUrl = location.pathname.split("/").slice(0, -1).join("/")+"/";
  const baseUrl = location.pathname == "/dashboard/" ? "/dashboard" : "/carriers/dashboard";
  const closeOverlay = () => {
    setClosedOverlay(true);
    setIsOverlayOpen(false);
  };

  useEffect(() => {
    if (closedOverlay) {
      const goBack = baseUrl.split("/").length >= 5 ? baseUrl.split("/").slice(0, -2).join("/") : baseUrl
      navigate(goBack+"/");
    }
  },[baseUrl, closedOverlay, navigate]);

  return (
    <div className="relative">
      {isOverlayOpen && !closedOverlay && (
        <AccountOverlay onClose={closeOverlay} /> // Update this line
      )}
      <div className={`transition-opacity ${isOverlayOpen ? 'opacity-50' : 'opacity-100'}`}>
        <Outlet />
      </div>
    </div>
  );
}
