import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./blog.css";

export default function BlogSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "blogs"));
        setBlogs(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
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
      <div className="blog-header">
        <h2>🚀 Exora Space Blogs</h2>
        <p>Explore the latest discoveries and insights about space exploration</p>
      </div>
      
      {blogs.length === 0 ? (
        <div className="no-blogs">
          <h3>🌟 No blogs available yet</h3>
          <p>Check back soon for exciting space content!</p>
        </div>
      ) : (
        <div className="blog-grid">
          {blogs.map(blog => (
            <div 
              key={blog.id} 
              className="blog-card" 
              onClick={() => navigate(`/blog/${blog.id}`)}
            >
              {blog.image && (
                <img src={blog.image} alt={blog.title} className="blog-card-image" />
              )}
              <div className="blog-content">
                <h3>{blog.title}</h3>
                <p className="blog-excerpt">{blog.excerpt || blog.content?.substring(0, 100) + '...'}</p>
                <p className="blog-meta">📅 {blog.date} • ✍️ {blog.author}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}