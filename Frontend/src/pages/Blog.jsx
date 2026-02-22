import { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, User, Search, Loader, AlertCircle, ArrowRight, ChevronRight } from "lucide-react";
import "../styles/Blog.css";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("https://hyderabadtrader.com/wp-json/wp/v2/posts?_embed&per_page=20");
      setBlogs(response.data);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blog posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getAuthorName = (post) => {
    return post._embedded?.author?.[0]?.name || "Hyderabad Trader";
  };

  const filteredBlogs = blogs.filter(post =>
    post.title.rendered.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stripHtml(post.excerpt.rendered).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedPost) {
    return (
      <div className="blog-page">
        <section className="single-post-hero">
          <div className="container">
            <button 
              className="back-btn"
              onClick={() => setSelectedPost(null)}
            >
              <ChevronRight size={20} /> Back to All Articles
            </button>
          </div>
        </section>

        <section className="single-post-section">
          <div className="container">
            <article className="single-post">
              <div className="post-header">
                <h1 dangerouslySetInnerHTML={{ __html: selectedPost.title.rendered }} />
                
                <div className="post-meta-single">
                  <span className="meta-badge">
                    <Calendar size={16} />
                    {formatDate(selectedPost.date)}
                  </span>
                  <span className="meta-badge">
                    <User size={16} />
                    {getAuthorName(selectedPost)}
                  </span>
                </div>
              </div>

              {selectedPost._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
                <div className="featured-image-wrapper">
                  <img 
                    src={selectedPost._embedded["wp:featuredmedia"][0].source_url} 
                    alt={selectedPost.title.rendered}
                    className="featured-image"
                  />
                </div>
              )}

              <div className="post-content" dangerouslySetInnerHTML={{ __html: selectedPost.content.rendered }} />

              <div className="post-footer">
                <button 
                  className="back-btn-bottom"
                  onClick={() => setSelectedPost(null)}
                >
                  <ChevronRight size={20} /> Back to Articles
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Trading Insights & Tips</h1>
            <p>Stay updated with the latest trading strategies, market analysis, and expert advice</p>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="blog-controls-section">
        <div className="container">
          <div className="controls-wrapper">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="results-count">
              {filteredBlogs.length} article{filteredBlogs.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="blog-content-section">
        <div className="container">
          {error && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <p>{error}</p>
              <button onClick={fetchBlogs} className="retry-btn">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <Loader size={48} className="spinner" />
              <p>Loading articles...</p>
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="blog-grid">
              {filteredBlogs.map(post => (
                <article key={post.id} className="blog-card">
                  <div className="blog-card-image">
                    {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ? (
                      <img
                        src={post._embedded["wp:featuredmedia"][0].source_url}
                        alt={stripHtml(post.title.rendered)}
                      />
                    ) : (
                      <div className="placeholder-image"></div>
                    )}
                    <div className="card-overlay"></div>
                  </div>

                  <div className="blog-card-content">
                    <div className="blog-card-meta">
                      <span className="meta-item">
                        <Calendar size={14} />
                        {formatDate(post.date)}
                      </span>
                      <span className="meta-item">
                        <User size={14} />
                        {getAuthorName(post)}
                      </span>
                    </div>

                    <h2 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />

                    <p className="blog-card-excerpt">
                      {stripHtml(post.excerpt.rendered).substring(0, 120)}...
                    </p>

                    <button 
                      className="read-more-btn"
                      onClick={() => setSelectedPost(post)}
                    >
                      Read Article
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-results-state">
              <div className="no-results-icon">🔍</div>
              <h3>No articles found</h3>
              <p>Try adjusting your search terms</p>
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}