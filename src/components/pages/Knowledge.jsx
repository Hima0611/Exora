import React from "react";
import "../../styles/knowledge.css";

export default function KnowledgeHub() {
  return (
    <div className="knowledgePage">
      <header className="knowledgeHeader">
        <h1>🌌 Exora Knowledge Hub</h1>
        <p className="tagline">
          Explore the universe through science, AI, and imagination.  
          Learn how Exora uses NASA data to uncover hidden worlds beyond our solar system.
        </p>
      </header>

      {/* Introduction Section */}
      <section className="introSection">
        <div className="introContent">
          <p>
            Welcome to <strong>Exora’s Knowledge Hub</strong> — your cosmic learning center for understanding the mysteries of
            the universe. Here, you’ll discover how astronomers detect <strong>exoplanets</strong>,
            what makes a <strong>star</strong> shine, and how <strong>AI</strong> helps us decode celestial secrets from light-years away.
          </p>
        </div>
      </section>

      {/* Knowledge Cards */}
      <section className="knowledgeSections">
        <div className="knowledgeCard">
          <h2>🪐 Exoplanets</h2>
          <p>
            Exoplanets are worlds orbiting stars beyond our solar system.  
            Some are gas giants larger than Jupiter, while others are rocky Earth-like planets.  
            NASA’s <strong>Kepler</strong> and <strong>TESS</strong> missions have discovered thousands of them.
          </p>
          <p className="fact">
            🌍 Fact: Over <strong>5,600 exoplanets</strong> have been confirmed as of 2025!
          </p>
        </div>

        <div className="knowledgeCard">
          <h2>📡 Detection Methods</h2>
          <p>
            Astronomers use methods like:
          </p>
          <ul>
            <li><strong>Transit Method:</strong> Detects dips in starlight when a planet passes in front of its star.</li>
            <li><strong>Radial Velocity:</strong> Measures tiny wobbles in a star’s motion due to orbiting planets.</li>
            <li><strong>Direct Imaging:</strong> Captures rare images of planets themselves.</li>
          </ul>
        </div>

        <div className="knowledgeCard">
          <h2>🌟 Stars</h2>
          <p>
            Stars are massive spheres of plasma powered by nuclear fusion.  
            Their properties — temperature, size, and color — determine which kinds of planets they can host.
          </p>
          <p className="fact">
            💡 Did you know? The Sun is a <strong>G2V</strong> main-sequence star, an ideal type for habitability.
          </p>
        </div>

        <div className="knowledgeCard">
          <h2>🌌 Galaxies</h2>
          <p>
            Galaxies are colossal systems of stars, planets, and dark matter.  
            The <strong>Milky Way</strong> alone holds hundreds of billions of stars, many with exoplanets of their own.
          </p>
          <p className="fact">
            🌠 Fun Fact: Light from distant galaxies takes millions of years to reach us — we’re looking back in time!
          </p>
        </div>

        <div className="knowledgeCard">
          <h2>🚀 Space Missions</h2>
          <p>
            NASA and ESA missions like <strong>James Webb Space Telescope (JWST)</strong> and <strong>TESS</strong> are revolutionizing how we study exoplanets.
          </p>
          <p className="fact">
            🛰 JWST can analyze the <strong>atmospheres</strong> of distant worlds — even detecting signs of water or life.
          </p>
        </div>

        <div className="knowledgeCard">
          <h2>🤖 AI in Astronomy</h2>
          <p>
            AI models like Exora’s engine analyze astronomical datasets to predict potential exoplanets,  
            simulate their orbits, and classify stellar types automatically.
          </p>
          <p className="fact">
            🧠 Exora combines <strong>AI + NASA data</strong> to uncover hidden cosmic patterns faster than ever before.
          </p>
        </div>
      </section>

      

      <footer className="footer">
        <p>Created by <strong>Space Warriors</strong> | Powered by NASA Data & Exora AI 🌠</p>
      </footer>
    </div>
  );
}
