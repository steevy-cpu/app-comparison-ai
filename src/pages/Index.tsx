import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Sparkles, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { comparisons } from "@/data/comparisons";
import { tools, getToolBySlug } from "@/data/tools";

const toolPills = ["Notion", "Asana", "Monday", "ClickUp", "Trello", "Airtable"];

const steps = [
  { icon: Search, label: "Pick two tools", desc: "Select any two SaaS products you're evaluating for your team." },
  { icon: Sparkles, label: "Get an AI comparison", desc: "Our engine analyzes pricing, features, reviews, and real-world usage data." },
  { icon: CheckCircle, label: "Make a confident decision", desc: "Walk away with a clear, data-backed recommendation you can trust." },
];

const Index = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? tools.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <Layout>
      <SEO
        title="SaaS Tool Comparisons"
        description="Compare the best SaaS productivity tools side by side. AI-powered, unbiased comparisons of Notion, Asana, ClickUp, Monday and more."
      />

      {/* Hero */}
      <section className="container pt-20 pb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight max-w-xl">
          Stop guessing.<br />Start comparing.
        </h1>
        <p className="mt-5 text-body-muted max-w-lg text-lg">
          AI-powered SaaS comparisons updated automatically. Find the right tool for your team in minutes.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            to="/compare"
            className="bg-accent text-accent-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity duration-150"
          >
            Compare Tools
          </Link>
          <Link to="/tools" className="text-sm font-medium text-accent hover:underline">
            Browse All Tools →
          </Link>
        </div>

        {/* Search */}
        <div ref={wrapperRef} className="mt-6 relative max-w-sm">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search tools... (e.g. Notion, Asana)"
            className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {open && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-sm z-10">
              {filtered.map((tool) => (
                <button
                  key={tool.slug}
                  onClick={() => { navigate(`/tools/${tool.slug}`); setOpen(false); setQuery(""); }}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary cursor-pointer"
                >
                  {tool.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {toolPills.map((name) => (
            <span key={name} className="text-xs border rounded-lg px-3 py-1 text-body-muted">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t">
        <div className="container py-16 grid grid-cols-1 sm:grid-cols-3 gap-10">
          {steps.map((step) => (
            <div key={step.label}>
              <step.icon className="text-accent mb-3" size={20} />
              <h3 className="text-sm font-bold text-foreground">{step.label}</h3>
              <p className="mt-1 text-sm text-body-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Comparisons */}
      <section className="border-t">
        <div className="container py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Popular Comparisons</h2>
            <Link to="/tools" className="text-sm text-accent hover:underline">View all →</Link>
          </div>
          <div className="divide-y">
            {comparisons.map((c) => {
              const a = getToolBySlug(c.toolA);
              const b = getToolBySlug(c.toolB);
              return (
                <Link
                  key={c.slug}
                  to={`/compare/${c.slug}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground group-hover:text-accent transition-colors duration-150">
                      {a?.name} vs {b?.name}
                    </span>
                    <span className="text-xs border rounded px-2 py-0.5 text-body-muted">{c.category}</span>
                  </div>
                  <p className="text-sm text-body-muted truncate max-w-md">{c.summary}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
