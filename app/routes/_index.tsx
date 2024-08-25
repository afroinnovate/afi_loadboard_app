import React from "react";
import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="font-sans bg-[#1e1e2d] min-h-screen text-white flex items-center justify-center py-12">
      <div className="w-full max-w-2xl p-8 space-y-10">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-3">AFI LoadBoard</h1>
          <p className="text-xl text-gray-300 mb-4">
            Your One-Stop Solution for Freight Transportation
          </p>
          <blockquote className="text-2xl italic text-white shadow-md font-medium mb-8">
            Creating one Africa one load at a time.
          </blockquote>
          <p> AfroInnovate: Where Africa's trade meets the world.</p>
        </div>

        <div className="bg-[#2b2b40] rounded-lg p-8 space-y-8 shadow-lg">
          <BenefitCard
            title="For Shippers"
            description="List loads effortlessly and connect with top carriers instantly. Our streamlined process ensures your cargo moves without delay."
            action="Post a Load"
          />
          <BenefitCard
            title="For Carriers"
            description="Access premium loads, optimize your routes for maximum profit, and reduce empty miles. Find the perfect hauls for your fleet."
            action="Find Loads"
          />
        </div>

        <div className="space-y-4">
          <Link
            to="/signup/"
            className="block w-full px-6 py-4 text-center text-lg font-medium text-white bg-[#ff4d4f] rounded-md hover:bg-[#ff7875] transition duration-300 shadow-md"
          >
            Get Started
          </Link>
          <Link
            to="/login/"
            className="block w-full px-6 py-4 text-center text-lg font-medium text-[#ff4d4f] bg-transparent border-2 border-[#ff4d4f] rounded-md hover:bg-[#ff4d4f] hover:text-white transition duration-300"
          >
            Sign In
          </Link>
        </div>

        <p className="text-center text-lg text-gray-300">
          Experience the future of freight transportation. Join AFI LoadBoard
          today!
        </p>
      </div>
    </div>
  );
}

function BenefitCard({ title, description, action }: any) {
  return (
    <div className="bg-[#323248] rounded-lg p-6 space-y-4 hover:bg-[#3a3a54] transition duration-300">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-gray-300 text-lg leading-relaxed">{description}</p>
      <Link
        to="/signup/"
        className="inline-block text-[#ff4d4f] hover:text-[#ff7875] text-lg font-medium"
      >
        {action} →
      </Link>
    </div>
  );
}
