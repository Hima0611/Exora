import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./blog.css";
// We'll use the script on component mount rather than importing it

export default function BlogSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch blog data
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "blogs"));
        setBlogs(
          querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();

    // Function to handle blog card interactions
    const initializeBlogCardInteractions = () => {
      const blogCards = document.querySelectorAll(".blog-card");

      // Add mouse movement tracking to each card
      blogCards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          // Calculate mouse position relative to card
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / card.clientWidth) * 100;
          const y = ((e.clientY - rect.top) / card.clientHeight) * 100;

          // Update CSS variables for the glow effect position
          card.style.setProperty("--x", `${x}%`);
          card.style.setProperty("--y", `${y}%`);
        });

        // Reset on mouse leave
        card.addEventListener("mouseleave", () => {
          card.style.setProperty("--x", "50%");
          card.style.setProperty("--y", "50%");
        });
      });
    };

    // Initialize card interactions after a short delay to ensure DOM is ready
    const interactionsTimer = setTimeout(() => {
      initializeBlogCardInteractions();
    }, 500);

    return () => {
      clearTimeout(interactionsTimer);
    };
  }, []);

  if (loading) {
    return (
      <section className="blog-section">
        <div className="loading-container">
          <div className="loading-spinner">🌌</div>
          <p>Loading our space blogs...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="blog-section">
        <div className="error-container">
          <h2>⚠️ Oops!</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="blog-section">
      <div className="blog-section-background">
        <div className="blog-header">
          <h2>🚀 Exora Space Blogs</h2>
          <p>
            Explore the latest discoveries and insights about space exploration
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="no-blogs">
            <h3>🌟 No blogs available yet</h3>
            <p>Check back soon for exciting space content!</p>
          </div>
        ) : (
          <div className="blog-grid">
            {blogs.map((blog, index) => (
              <div
                key={blog.id}
                className="blog-card glass-card"
                style={{ "--index": index }}
                onClick={() => navigate(`/blog/${blog.id}`)}
                data-card-id={blog.id}
              >
                {blog.image && (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="blog-card-image"
                    loading="lazy"
                  />
                )}
                <div className="blog-content">
                  <h3>{blog.title}</h3>
                  <p className="blog-excerpt">
                    {blog.excerpt || blog.content?.substring(0, 120) + "..."}
                  </p>
                  <p className="blog-meta">
                    <span>📅 {blog.date}</span> • <span>✍️ {blog.author}</span>
                    {blog.category && <span> • 🏷️ {blog.category}</span>}
                  </p>
                  <button className="read-more-btn">
                    <span>Read Article</span> <span className="arrow">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
