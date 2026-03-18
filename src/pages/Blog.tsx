import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { posts } from "@/data/posts";
import { Badge } from "@/components/ui/badge";

const POSTS_PER_PAGE = 10;

const categoryColors: Record<string, string> = {
  Guide: "bg-accent/10 text-accent border-accent/20",
  "Deep Dive": "bg-purple-50 text-purple-700 border-purple-200",
  Analysis: "bg-amber-50 text-amber-700 border-amber-200",
  Tips: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cost: "bg-red-50 text-red-700 border-red-200",
};

function getCategoryClass(category: string) {
  return categoryColors[category] || "bg-secondary text-body-muted border-border";
}

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
          {paginatedPosts.map((post, index) => (
            <motion.article
              key={post.slug}
              className="py-6 hover:bg-secondary/30 rounded-xl px-4 -mx-4 transition-colors duration-150"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-3 text-xs text-body-muted">
                <Badge variant="outline" className={`text-xs border ${getCategoryClass(post.category)}`}>
                  {post.category}
                </Badge>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readingTime}</span>
              </div>
              <h2 className="text-lg font-bold text-foreground mt-2 hover:text-accent transition-colors duration-150">
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-2 text-sm text-body">{post.excerpt}</p>
            </motion.article>
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
