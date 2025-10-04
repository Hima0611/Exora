import { Routes, Route } from "react-router-dom";
import Header from "./components/header/header.jsx";
import Features from "./components/features/features.jsx";
import Footer from "./components/footer/footer.jsx";
import BlogSection from "./components/blog/BlogSection.jsx";
import SingleBlog from "./components/blog/SingleBlog.jsx";
import RadialVelocityAnalysisWorking from "./components/pages/radialvelocity-working.jsx";
import RadialVelocityAnalysisOriginal from "./components/pages/radialvelocity.jsx";

function App() {
  return (
    <Routes>
      {/* Homepage - Main React landing page */}
      <Route
        path="/"
        element={
          <>
            <Header />
            <Features />
            <Footer />
          </>
        }
      />

      <Route path="/blog" element={<BlogSection />} />
      <Route path="/blog/:id" element={<SingleBlog />} />
      <Route
        path="/radial-velocity"
        element={<RadialVelocityAnalysisOriginal />}
      />
    </Routes>
  );
}

export default App;
