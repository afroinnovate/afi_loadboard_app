import { Outlet } from "@remix-run/react";

export default function LoadsIndex() {
  return (
    <div className="flex flex-col md:flex-row">
      <div>Loads page</div>
      <main className="flex-1 p-4">
        {/* The Outlet will render the component for the nested route */}
        <Outlet />
      </main>
    </div>
  );
}
