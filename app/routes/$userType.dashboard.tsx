import { Outlet } from "@remix-run/react";

export default function DashboardLayout() {
  console.log("Dashboard layout rendering...");
  // ... other code

  return (
    <div>
      {/* ... other layout elements ... */}
      <Outlet />
    </div>
  );
}
