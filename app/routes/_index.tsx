import React from "react";
import { Link, useOutletContext } from "@remix-run/react";

export default function Index() {
  const { theme } = useOutletContext<{ theme: string }>();

  const themeClasses = {
    background: theme === "dark" ? "bg-[#1e1e2d]" : "bg-gray-100",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    subtext: theme === "dark" ? "text-gray-300" : "text-gray-600",
    card: theme === "dark" ? "bg-[#2b2b40]" : "bg-white",
    cardHover: theme === "dark" ? "hover:bg-[#3a3a54]" : "hover:bg-gray-50",
    benefitCard: theme === "dark" ? "bg-[#323248]" : "bg-gray-200",
    benefitCardHover: theme === "dark" ? "hover:bg-[#3a3a54]" : "hover:bg-gray-300",
    link: theme === "dark" ? "text-[#ff4d4f] hover:text-[#ff7875]" : "text-green-800 hover:text-green-600",
    button: theme === "dark" 
      ? "bg-[#ff4d4f] hover:bg-[#ff7875] text-white" 
      : "bg-green-700 hover:bg-green-600 text-white",
    outlineButton: theme === "dark"
      ? "border-[#ff4d4f] text-[#ff4d4f] hover:bg-[#ff4d4f] hover:text-white"
      : "border-green-700 text-green-700 hover:bg-green-700 hover:text-white",
  };

  return (
    <div className={`font-sans ${themeClasses.background} ${themeClasses.text} min-h-screen flex items-center justify-center py-12`}>
      <div className="w-full max-w-2xl p-8 space-y-10">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-3">AFI LoadBoard</h1>
          <p className={`text-xl ${themeClasses.subtext} mb-4`}>
            Your One-Stop Solution for Freight Transportation
          </p>
          <blockquote className="text-2xl italic shadow-md font-medium mb-8">
            Creating one Africa one load at a time.
          </blockquote>
          <p> AfroInnovate: Where Africa's trade meets the world.</p>
        </div>

        <div className={`${themeClasses.card} rounded-lg p-8 space-y-8 shadow-lg`}>
          <BenefitCard
            title="For Shippers"
            description="List loads effortlessly and connect with top carriers instantly. Our streamlined process ensures your cargo moves without delay."
            action="Post a Load"
            theme={theme}
          />
          <BenefitCard
            title="For Carriers"
            description="Access premium loads, optimize your routes for maximum profit, and reduce empty miles. Find the perfect hauls for your fleet."
            action="Find Loads"
            theme={theme}
          />
        </div>

        <div className="space-y-4">
          <Link
            to="/signup/"
            className={`block w-full px-6 py-4 text-center text-lg font-medium ${themeClasses.button} rounded-md transition duration-300 shadow-md`}
          >
            Get Started
          </Link>
          <Link
            to="/login/"
            className={`block w-full px-6 py-4 text-center text-lg font-medium ${themeClasses.outlineButton} bg-transparent border-2 rounded-md transition duration-300`}
          >
            Sign In
          </Link>
        </div>

        <p className={`text-center text-lg ${themeClasses.subtext}`}>
          Experience the future of freight transportation. Join AFI LoadBoard
          today!
        </p>
      </div>
    </div>
  );
}

function BenefitCard({ title, description, action, theme }: any) {
  const themeClasses = {
    card: theme === "dark" ? "bg-[#323248]" : "bg-gray-200",
    cardHover: theme === "dark" ? "hover:bg-[#3a3a54]" : "hover:bg-gray-300",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    subtext: theme === "dark" ? "text-gray-300" : "text-gray-600",
    link: theme === "dark" ? "text-[#ff4d4f] hover:text-[#ff7875]" : "text-green-800 hover:text-green-600",
  };

  return (
    <div className={`${themeClasses.card} rounded-lg p-6 space-y-4 ${themeClasses.cardHover} transition duration-300`}>
      <h2 className={`text-2xl font-semibold ${themeClasses.text}`}>{title}</h2>
      <p className={`${themeClasses.subtext} text-lg leading-relaxed`}>{description}</p>
      <Link
        to="/signup/"
        className={`inline-block ${themeClasses.link} text-lg font-medium`}
      >
        {action} →
      </Link>
    </div>
  );
}
