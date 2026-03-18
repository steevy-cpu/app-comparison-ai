import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { posts } from "@/data/posts";
import { Badge } from "@/components/ui/badge";

const POSTS_PER_PAGE = 10;

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    []
  );

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / POSTS_PER_PAGE));
  const paginatedPosts = sortedPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <Layout>
      <SEO
        title="Blog"
        description="Guides, deep dives, and analysis on SaaS tools and productivity software. Updated regularly by the AppRival team."
      />
      <div className="container py-16 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground">Blog</h1>
        <p className="mt-2 text-body-muted">Guides, deep dives, and analysis on SaaS tools and productivity.</p>

        <div className="mt-10 divide-y">
          {paginatedPosts.map((post) => (
            <article key={post.slug} className="py-6">
              <div className="flex items-center gap-3 text-xs text-body-muted">
                <Badge variant="outline" className="text-xs">{post.category}</Badge>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readingTime}</span>
              </div>
              <h2 className="text-lg font-bold text-foreground mt-2 hover:text-accent transition-colors duration-150">
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-2 text-sm text-body">{post.excerpt}</p>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-sm font-medium text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-sm font-medium text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Blog;
