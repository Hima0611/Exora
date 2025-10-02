
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./blog.css";

export default function SingleBlog() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      const docRef = doc(db, "blogs", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Fetched blog data:", docSnap.data());
        setBlog({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchBlog();
  }, [id]);

  if (!blog) {
    return (
      <div className="blog-section">
        <div className="loading-container">
          <div className="loading-spinner">🌌</div>
          <p>Loading blog post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-section">
      <article className="single-blog">
        <div className="blog-header-content">
          <h1>{blog.title}</h1>
          <p className="blog-meta">📅 {blog.date} • ✍️ {blog.author}</p>
        </div>
        {blog.image && (
          <div className="blog-image-container">
            <img src={blog.image} alt={blog.title} className="blog-detail-image" />
          </div>
        )}
        <div className="blog-content-text">
          <p>{blog.content}</p>
        </div>
      </article>
    </div>
  );
}
