import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { tools } from "@/data/tools";
import { useState } from "react";

const categories = Array.from(new Set(tools.map((t) => t.category)));

const ToolsDirectory = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const filtered = filter ? tools.filter((t) => t.category === filter) : tools;

  return (
    <Layout>
      <div className="container py-16">
        <h1 className="text-3xl font-bold text-foreground">All Tools</h1>
        <p className="mt-2 text-body-muted">Browse our directory of SaaS tools with detailed reviews and comparisons.</p>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`text-xs border rounded-lg px-3 py-1 transition-colors duration-150 ${!filter ? "bg-foreground text-background" : "text-body-muted hover:text-foreground"}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs border rounded-lg px-3 py-1 transition-colors duration-150 ${filter === cat ? "bg-foreground text-background" : "text-body-muted hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="mt-8 divide-y">
          {filtered.map((tool) => (
            <div
              key={tool.slug}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2 group"
            >
              <Link to={`/tools/${tool.slug}`} className="flex-1 min-w-0">
                <span className="font-semibold text-foreground group-hover:text-accent transition-colors duration-150">
                  {tool.name}
                </span>
                <span className="text-xs border rounded px-2 py-0.5 text-body-muted ml-3">{tool.category}</span>
                <p className="text-sm text-body-muted truncate max-w-md mt-1 sm:mt-0">{tool.description}</p>
              </Link>
              <Link
                to="/compare"
                className="text-xs text-accent hover:underline shrink-0"
              >
                Compare
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ToolsDirectory;
