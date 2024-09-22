import { useOutletContext } from "@remix-run/react";

export default function Privacy() {
  const { theme } = useOutletContext<{ theme: "light" | "dark" }>();
  const bgColor = theme === "light" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "light" ? "text-gray-900" : "text-white";

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} p-8`}>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-lg">
        {/* Add your privacy policy content here */}
        <p>This is the privacy policy content.</p>
      </div>
    </div>
  );
}