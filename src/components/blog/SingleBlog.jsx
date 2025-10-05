import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./blog.css";

export default function SingleBlog() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such blog found");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading || !blog) {
    return (
      <div className="blog-section">
        <div className="loading-container">
          <div className="loading-spinner">🌌</div>
          <p>Loading cosmic insights...</p>
        </div>
      </div>
    );
  }

  // Format the content paragraphs
  const formatContent = (content) => {
    if (!content) return [];
    return content.split("\n\n").filter((para) => para.trim() !== "");
  };

  const paragraphs = formatContent(blog.content);

  return (
    <div className="blog-section">
      <button className="back-to-blogs" onClick={() => navigate("/blog")}>
        ← Back to all blogs
      </button>

      <article className="single-blog glass-card">
        <div className="blog-header-content">
          <h1>{blog.title}</h1>
          <p className="blog-meta">
            📅 {blog.date} • ✍️ {blog.author}
          </p>
        </div>

        {blog.image && (
          <div className="blog-image-container">
            <img
              src={blog.image}
              alt={blog.title}
              className="blog-detail-image"
            />
          </div>
        )}

        <div className="blog-content-text">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p>{blog.content}</p>
          )}
        </div>
      </article>
    </div>
  );
}
