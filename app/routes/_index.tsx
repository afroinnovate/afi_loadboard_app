import React, { useEffect, useState } from "react";
import { Link, useOutletContext, useRouteError, isRouteErrorResponse } from "@remix-run/react";

export default function Index() {
  const { theme } = useOutletContext<{ theme: string }>();
  const [randomWord, setRandomWord] = useState("");

  useEffect(() => {
    const words = [
      "Innovation", "Culture", "Technology", "Talent", "Borderless",
      "Shipment", "Future", "Creativity", "Africa", "Growth", "Unity", "Progress",
    ];
    const interval = setInterval(() => {
      setRandomWord(words[Math.floor(Math.random() * words.length)]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const themeClasses = {
    background: theme === "dark" ? "bg-gradient-to-br from-gray-900 to-black" : "bg-gradient-to-br from-yellow-100 via-green-100 to-red-100",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    subtext: theme === "dark" ? "text-gray-300" : "text-gray-700",
    card: theme === "dark" ? "bg-gray-800 bg-opacity-50" : "bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg",
    cardHover: theme === "dark" ? "hover:bg-gray-700" : "hover:bg-opacity-90",
    link: theme === "dark" ? "text-yellow-400 hover:text-yellow-300" : "text-green-700 hover:text-green-600",
    button: theme === "dark" ? "bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-white" : "bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-500 hover:to-yellow-400 text-white",
    outlineButton: theme === "dark" ? "border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900" : "border-green-700 text-green-700 hover:bg-green-700 hover:text-white",
  };

  return (
    <div className={`font-sans ${themeClasses.background} ${themeClasses.text} min-h-screen flex flex-col`}>
      <style>
        {`
          @keyframes textCycle {
            0% { transform: translate(0, 0) scale(0.5); opacity: 0.5; }
            20% { transform: translate(0, 0) scale(1); opacity: 1; }
            40% { transform: translate(var(--scatter-x), var(--scatter-y)) scale(1); opacity: 1; }
            60% { transform: translate(var(--scatter-x), var(--scatter-y)) scale(0.5); opacity: 0.5; }
            80% { transform: translate(var(--scatter-x), var(--scatter-y)) scale(1.5); opacity: 0.7; }
            100% { transform: translate(0, 0) scale(0.5) rotate(360deg); opacity: 0.5; }
          }

          @keyframes glow {
            0%, 100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 223, 0, 0.5), 0 0 30px rgba(0, 128, 0, 0.5), 0 0 40px rgba(255, 0, 0, 0.5); }
            50% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 223, 0, 0.7), 0 0 40px rgba(0, 128, 0, 0.7), 0 0 50px rgba(255, 0, 0, 0.7); }
          }

          @keyframes whirlpool {
            0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0; }
            50% { transform: translateY(-100px) rotate(180deg) scale(1.5); opacity: 1; }
            100% { transform: translateY(-200px) rotate(360deg) scale(0.5); opacity: 0; }
          }

          .swirl-container { position: relative; overflow: hidden; width: 100%; height: 100%; }
          .map-mask { position: relative; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-image: url('/assets/images/africa-map.png'); background-size: cover; background-position: center; }
          .swirl-text { 
            position: absolute; 
            font-size: 1.5rem; 
            white-space: nowrap; 
            animation: 
              textCycle 10s ease-in-out infinite, 
              glow 2s ease-in-out infinite, 
              whirlpool 5s ease-in-out infinite;
            animation-delay: 0s, 0s, 20s;
          }
          .swirl-text-small { font-size: 1rem; opacity: 0.5; }

          .swirl-text-0 { --scatter-x: 50px; --scatter-y: -50px; animation-delay: 0s, 0s, 20s; }
          .swirl-text-1 { --scatter-x: 60px; --scatter-y: -40px; animation-delay: 1s, 1s, 21s; }
          .swirl-text-2 { --scatter-x: 70px; --scatter-y: -30px; animation-delay: 2s, 2s, 22s; }
          .swirl-text-3 { --scatter-x: 80px; --scatter-y: -20px; animation-delay: 3s, 3s, 23s; }
          .swirl-text-4 { --scatter-x: 90px; --scatter-y: -10px; animation-delay: 4s, 4s, 24s; }
          .swirl-text-5 { --scatter-x: 50px; --scatter-y: 10px; animation-delay: 5s, 5s, 25s; }
          .swirl-text-6 { --scatter-x: 40px; --scatter-y: 20px; animation-delay: 6s, 6s, 26s; }
          .swirl-text-7 { --scatter-x: 30px; --scatter-y: 30px; animation-delay: 7s, 7s, 27s; }
          .swirl-text-8 { --scatter-x: 20px; --scatter-y: 40px; animation-delay: 8s, 8s, 28s; }
          .swirl-text-9 { --scatter-x: 10px; --scatter-y: 50px; animation-delay: 9s, 9s, 29s; }
          .swirl-text-10 { --scatter-x: 20px; --scatter-y: 60px; animation-delay: 10s, 10s, 30s; }
          .swirl-text-11 { --scatter-x: 40px; --scatter-y: 70px; animation-delay: 11s, 11s, 31s; }
        `}
      </style>
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl w-full space-y-8">
          <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-yellow-500">
              AFI LoadBoard
            </h1>
            <p className={`text-xl sm:text-2xl ${themeClasses.subtext} mb-4`}>
              Your One-Stop Solution for Freight Transportation
            </p>
            <blockquote className="text-2xl sm:text-3xl italic font-medium mb-4 relative">
              <span className="absolute top-0 left-0 transform -translate-x-4 -translate-y-4 text-4xl sm:text-5xl text-yellow-500 opacity-25">
                "
              </span>
              Creating one Africa, one load at a time.
              <span className="absolute bottom-0 right-0 transform translate-x-4 translate-y-4 text-4xl sm:text-5xl text-yellow-500 opacity-25">
                "
              </span>
            </blockquote>
            <p className="text-lg sm:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-green-500">
              AfroInnovate: Where Africa's trade meets the world.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BenefitCard
              title="For Shippers"
              description="List loads effortlessly and connect with top carriers instantly."
              action="Post a Load"
              theme={theme}
              randomWord={randomWord}
            />
            <BenefitCard
              title="For Carriers"
              description="Access premium loads, optimize routes for maximum profit."
              action="Find Loads"
              theme={theme}
              randomWord={randomWord}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/signup/"
              className={`px-8 py-3 text-center text-lg font-medium ${themeClasses.button} rounded-full transition duration-300 shadow-lg transform hover:scale-105`}
            >
              Get Started
            </Link>
            <Link
              to="/login/"
              className={`px-8 py-3 text-center text-lg font-medium ${themeClasses.outlineButton} bg-transparent border-2 rounded-full transition duration-300 transform hover:scale-105`}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ title, description, action, theme, randomWord }: any) {
  const themeClasses = {
    card: theme === "dark" ? "bg-gray-800 bg-opacity-50" : "bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg",
    cardHover: theme === "dark" ? "hover:bg-gray-700" : "hover:bg-opacity-90",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    subtext: theme === "dark" ? "text-gray-300" : "text-gray-700",
    link: theme === "dark" ? "text-yellow-400 hover:text-yellow-300" : "text-green-700 hover:text-green-600",
  };

  const words = [
    "Innovation", "Culture", "Technology", "Talent", "Borderless",
    "Shipment", "Future", "Creativity", "Africa", "Growth", "Unity", "Progress",
  ];

  const africanColors = [
    "text-red-500", "text-yellow-500", "text-green-500",
    "text-blue-500", "text-purple-500", "text-pink-500",
  ];

  return (
    <div className={`${themeClasses.card} rounded-2xl p-4 space-y-3 ${themeClasses.cardHover} transition duration-300 transform hover:scale-105 shadow-lg border border-opacity-20 ${theme === "dark" ? "border-yellow-400" : "border-green-500"}`}>
      <div className="relative h-48 rounded-xl overflow-hidden mb-3">
        <div className="swirl-container relative h-full w-full flex items-center justify-center">
          <div className="map-mask relative">
            {words.map((word, index) => (
              <span
                key={index}
                className={`swirl-text swirl-text-${index} ${index % 2 === 0 ? "swirl-text-small" : ""} ${africanColors[index % africanColors.length]} font-bold`}
                style={{
                  textShadow: theme === "dark" 
                    ? "0 0 3px #fff, 0 0 5px #fff" 
                    : "0 0 3px #000, 0 0 5px #000",
                }}
              >
                {word}
              </span>
            ))}
            <span 
              className={`whirlpool-text ${africanColors[0]} font-bold`}
              style={{
                textShadow: theme === "dark" 
                  ? "0 0 3px #fff, 0 0 5px #fff" 
                  : "0 0 3px #000, 0 0 5px #000",
              }}
            >
              {randomWord}
            </span>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
        <h2 className={`absolute bottom-4 left-4 text-3xl font-bold text-white`}>
          {title}
        </h2>
      </div>
      <p className={`${themeClasses.subtext} text-sm leading-relaxed`}>
        {description}
      </p>
      <Link
        to="/signup/"
        className={`inline-block ${themeClasses.link} text-sm font-medium`}
      >
        {action} →
      </Link>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-container">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="error-container">
        <h1>Error</h1>
        <p>{error.message}</p>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}