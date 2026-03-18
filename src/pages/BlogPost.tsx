import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { getPostBySlug } from "@/data/posts";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

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

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!post) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
          <p className="mt-3 text-body-muted">We couldn't find the post you're looking for.</p>
          <Link to="/blog" className="mt-6 inline-block text-sm text-accent hover:underline">
            ← Back to blog
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={post.title}
        description={post.excerpt}
        canonical={`/blog/${post.slug}`}
      />
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 h-0.5 bg-accent z-[60] transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/blog">Blog</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{post.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero strip */}
      <div className="bg-secondary/30">
        <motion.div
          className="container py-10 max-w-3xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 text-xs text-body-muted">
            <Badge variant="outline" className={`text-xs border ${getCategoryClass(post.category)}`}>
              {post.category}
            </Badge>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            {post.title}
          </h1>

          <p className="mt-4 text-lg text-body-muted leading-relaxed">
            {post.excerpt}
          </p>
        </motion.div>
      </div>

      <article className="container py-10 max-w-3xl">
        {/* Content */}
        <div
          className="max-w-none text-body text-sm leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mt-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Back link */}
        <div className="mt-12 border-t border-border pt-6">
          <Link to="/blog" className="text-sm text-accent hover:underline">
            ← All posts
          </Link>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
