import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
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
      <section className="container pt-20 pb-16 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(79,70,229,0.08),transparent)]">
        <motion.h1
          className="text-4xl sm:text-5xl font-bold text-foreground leading-tight max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Compare any tool.<br />Pick the right one.
        </motion.h1>
        <motion.p
          className="mt-5 text-body-muted max-w-lg text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          AI-powered SaaS comparisons updated automatically. Find the right tool for your team in minutes.
        </motion.p>
        <motion.div
          className="mt-8 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            to="/compare"
            className="bg-accent text-accent-foreground text-sm font-medium px-6 py-3 rounded-lg hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 transition-all duration-200"
          >
            Compare Tools
          </Link>
          <Link to="/tools" className="text-sm font-medium text-accent hover:underline">
            Browse All Tools →
          </Link>
        </motion.div>

        {/* Search */}
        <motion.div
          ref={wrapperRef}
          className="mt-6 relative max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search tools... (e.g. Notion, Asana)"
            className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
          />
          {open && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-sm z-10 animate-fade-in">
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
        </motion.div>

        <motion.div
          className="mt-6 flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          {toolPills.map((name) => (
            <span
              key={name}
              className="text-sm border border-border rounded-full px-4 py-1.5 text-body-muted hover:border-accent hover:text-accent transition-all duration-200 cursor-pointer"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="border-t bg-secondary/30">
        <div className="container py-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              className="border border-border rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <div className="rounded-xl bg-accent/10 p-3 w-fit">
                <step.icon className="text-accent" size={20} />
              </div>
              <h3 className="mt-4 text-sm font-bold text-foreground">{step.label}</h3>
              <p className="mt-1 text-sm text-body-muted">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Comparisons */}
      <section className="border-t">
        <motion.div
          className="container py-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2 group hover:bg-secondary/50 transition-colors duration-150 rounded-lg px-3 -mx-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground group-hover:text-accent transition-colors duration-150">
                      {a?.name} vs {b?.name}
                    </span>
                    <span className="text-xs border rounded px-2 py-0.5 text-body-muted">{c.category}</span>
                  </div>
                  <p className="text-sm text-body-muted truncate max-w-md">{c.summary}</p>
                  <span className="hidden sm:flex items-center gap-1 text-xs text-body-muted shrink-0">
                    {c.updatedAt}
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-150" />
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </section>
    </Layout>
  );
};

export default Index;
