import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { posts } from "@/data/posts";
import { Badge } from "@/components/ui/badge";

const Blog = () => {
  return (
    <Layout>
      <div className="container py-16 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground">Blog</h1>
        <p className="mt-2 text-body-muted">Guides, deep dives, and analysis on SaaS tools and productivity.</p>

        <div className="mt-10 divide-y">
          {posts.map((post) => (
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
      </div>
    </Layout>
  );
};

export default Blog;
