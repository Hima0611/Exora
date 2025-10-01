import { Routes, Route } from "react-router-dom";
import Header from "./components/header/header.jsx";
import Features from "./components/features/features.jsx";
import Footer from "./components/footer/footer.jsx";
import StarMap from "./components/pages/starmap.jsx";


function App() {
  return (
    <Routes>
      {/* Homepage */}
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

      {/* Star Map page */}
      <Route path="/starmap" element={<StarMap />} />
      
    </Routes>
  );
}

export default App;
