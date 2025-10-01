import React from "react";
import StarryBackground from "../starrybg/starrybackground.jsx";

const StarMap = () => {
  return (
    <div className="starMapPage relative w-full h-screen overflow-hidden">
      {/* Starry background */}
      <StarryBackground />

      {/* Foreground content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-4xl mb-4">🌌 Star Map</h1>
        <p className="mb-8">Navigate through stars and exoplanets.</p>

        {/* Semi-transparent Feature Card */}
        <div className="relative w-3/4 md:w-1/2 bg-white/20 backdrop-blur-md rounded-3xl p-10 shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-semibold mb-4">✨ Feature Card ✨</h2>
          <p className="text-center mb-6">
            This is a big feature card floating above the starry background.
            The transparency allows you to see stars behind it.
          </p>
          <button className="px-6 py-3 bg-pink-500/70 hover:bg-pink-500 rounded-full text-white font-medium transition">
            Explore Features
          </button>
        </div>

        {/* Small stars inside container (optional) */}
        <div className="starMapContainer relative z-10 w-full h-full mt-12">
          <div className="star" style={{ position: "absolute", top: "20%", left: "30%" }}>⭐</div>
          <div className="star" style={{ position: "absolute", top: "50%", left: "60%" }}>✨</div>
          <div className="star" style={{ position: "absolute", top: "70%", left: "40%" }}>🌟</div>
        </div>
      </div>
    </div>
  );
};

export default StarMap;
