import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Check } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { tools } from "@/data/tools";
import { useState } from "react";

const AI_CATEGORIES = ["AI Writing", "AI Image", "AI Coding", "AI Productivity", "AI Video & Audio"];
const categories = Array.from(new Set(tools.map((t) => t.category)));
const saasCategories = categories.filter((c) => !AI_CATEGORIES.includes(c));
const aiCategories = categories.filter((c) => AI_CATEGORIES.includes(c));

const ToolsDirectory = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const filtered = filter ? tools.filter((t) => t.category === filter) : tools;

  return (
    <Layout>
      <SEO
        title="Browse SaaS Tools"
        description={`Browse our directory of ${tools.length} SaaS productivity tools with detailed reviews, pricing, and comparisons.`}
      />
      <div className="container py-16">
        <h1 className="text-3xl font-bold text-foreground">All Tools</h1>
        <p className="mt-2 text-body-muted">Browse our directory of SaaS tools with detailed reviews and comparisons.</p>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`text-xs border rounded-lg px-3 py-1 transition-all duration-200 ${!filter ? "bg-accent text-accent-foreground border-accent" : "text-body-muted hover:text-foreground"}`}
          >
            All
          </button>
          {saasCategories.length > 0 && (
            <span className="text-xs font-semibold uppercase tracking-wide text-body-muted mr-2 ml-2">SaaS Tools</span>
          )}
          {saasCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs border rounded-lg px-3 py-1 transition-all duration-200 ${filter === cat ? "bg-accent text-accent-foreground border-accent" : "text-body-muted hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
          {aiCategories.length > 0 && (
            <span className="text-xs font-semibold uppercase tracking-wide text-body-muted mr-2 ml-2">AI Tools</span>
          )}
          {aiCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs border rounded-lg px-3 py-1 transition-all duration-200 ${filter === cat ? "bg-accent text-accent-foreground border-accent" : "text-body-muted hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Card Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool, index) => (
            <motion.div
              key={tool.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/tools/${tool.slug}`}
                className="block border border-border rounded-xl p-5 hover:border-accent/50 hover:shadow-md transition-all duration-200 group cursor-pointer h-full"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-foreground group-hover:text-accent transition-colors duration-150">
                      {tool.name}
                    </span>
                    <span className="text-xs border rounded px-2 py-0.5 text-body-muted ml-2">{tool.category}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-body-muted shrink-0">
                    <Star size={12} className="text-accent fill-accent" />
                    {tool.rating}
                  </div>
                </div>
                <p className="text-sm text-body-muted mt-2 line-clamp-2">{tool.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-body-muted">
                    <Check size={12} className="text-accent" />
                    {tool.features.length} features
                  </div>
                  <span className="text-xs text-accent group-hover:underline">
                    Compare →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ToolsDirectory;
