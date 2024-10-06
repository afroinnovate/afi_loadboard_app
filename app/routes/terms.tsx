import { useOutletContext } from "@remix-run/react";

export default function Terms() {
  const { theme } = useOutletContext<{ theme: "light" | "dark" }>();
  const bgColor = theme === "light" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "light" ? "text-gray-900" : "text-white";

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} p-8`}>
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-lg">
        {/* Add your terms of service content here */}
        <p>This is the terms of service content.</p>
      </div>
    </div>
  );
}