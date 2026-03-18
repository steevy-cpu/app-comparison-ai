import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const posts = [
  { title: "How to Choose a Project Management Tool in 2026", date: "Mar 12, 2026", slug: "#", excerpt: "A framework for evaluating PM tools based on team size, workflow complexity, and budget." },
  { title: "Notion vs ClickUp: A Deep Dive for Remote Teams", date: "Mar 5, 2026", slug: "#", excerpt: "We break down the key differences for distributed teams managing docs and tasks." },
  { title: "The True Cost of SaaS: Beyond Per-Seat Pricing", date: "Feb 28, 2026", slug: "#", excerpt: "Why the sticker price only tells half the story when comparing productivity tools." },
  { title: "Why We Built AppRival", date: "Feb 20, 2026", slug: "#", excerpt: "The story behind our AI-powered comparison engine and why existing review sites fall short." },
];

const Blog = () => {
  return (
    <Layout>
      <div className="container py-16 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground">Blog</h1>
        <p className="mt-2 text-body-muted">Guides, deep dives, and analysis on SaaS tools and productivity.</p>

        <div className="mt-10 divide-y">
          {posts.map((post) => (
            <article key={post.title} className="py-6">
              <span className="text-xs text-body-muted">{post.date}</span>
              <h2 className="text-lg font-bold text-foreground mt-1 hover:text-accent transition-colors duration-150">
                <Link to={post.slug}>{post.title}</Link>
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
