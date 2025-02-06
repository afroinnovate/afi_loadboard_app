export default function DashboardLayout() {
  console.log("Dashboard layout rendering...");
  // ... other code

  return (
    <div>
      {/* ... other layout elements ... */}
      <Outlet context={{ loads, theme }} />
    </div>
  );
}
