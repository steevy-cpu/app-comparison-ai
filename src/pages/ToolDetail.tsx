import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, Star, Check } from "lucide-react";
import { getToolUrl } from "@/lib/affiliate";
import { useAffiliateUrl } from "@/hooks/useAffiliateUrl";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { tools, getToolBySlug } from "@/data/tools";
import { comparisons } from "@/data/comparisons";
import NotFound from "./NotFound";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < Math.round(rating) ? "text-accent fill-accent" : "text-border"}
        />
      ))}
      <span className="text-sm text-body-muted ml-1">{rating}</span>
    </div>
  );
}

const ToolDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? getToolBySlug(slug) : undefined;
  const affiliateUrl = useAffiliateUrl(tool?.slug ?? "", tool ? getToolUrl(tool) : "");

  if (!tool) return <NotFound />;

  const relatedComparisons = comparisons.filter(
    (c) => c.toolA === tool.slug || c.toolB === tool.slug
  );

  const otherTools = tools.filter((t) => t.slug !== tool.slug).slice(0, 6);

  return (
    <Layout>
      <SEO
        title={`${tool.name} Review`}
        description={`${tool.name} review: features, pricing, pros and cons. ${tool.description}`}
        canonical={`/tools/${tool.slug}`}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Hero strip */}
        <div className="bg-secondary/30 py-10">
          <div className="container max-w-3xl">
            <Link to="/tools" className="text-sm text-accent hover:underline">← All tools</Link>

            <div className="mt-6 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{tool.name}</h1>
                <span className="text-xs border rounded px-2 py-0.5 text-body-muted mt-2 inline-block">{tool.category}</span>
              </div>
              <StarRating rating={tool.rating} />
            </div>
          </div>
        </div>

        <div className="container py-10 max-w-3xl">
          <p className="text-body">{tool.description}</p>

          <div className="mt-6 flex items-center gap-6 text-sm">
            <span className="text-body-muted">Pricing: <span className="text-foreground font-medium">{tool.pricing}</span></span>
            <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
              {tool.website} <ExternalLink size={12} />
            </a>
          </div>

          {/* Features */}
          <div className="mt-10 border-t pt-8">
            <h2 className="text-lg font-bold text-foreground">Key Features</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {tool.features.map((f) => (
                <span key={f} className="flex items-center gap-2 text-sm text-body">
                  <Check size={14} className="text-accent shrink-0" />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 border-t pt-8">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">Pros</h3>
              <ul className="space-y-2">
                {tool.pros.map((p) => (
                  <li key={p} className="text-sm text-body flex items-start gap-2">
                    <Check size={14} className="text-success mt-0.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">Cons</h3>
              <ul className="space-y-2">
                {tool.cons.map((c) => (
                  <li key={c} className="text-sm text-body flex items-start gap-2">
                    <span className="text-danger mt-0.5 shrink-0">✕</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Best For */}
          <div className="mt-10 border-t pt-8">
            <h2 className="text-lg font-bold text-foreground">Best For</h2>
            <p className="mt-2 text-body">{tool.bestFor}</p>
          </div>

          {/* Related Comparisons */}
          {relatedComparisons.length > 0 && (
            <div className="mt-10 border-t pt-8">
              <h2 className="text-lg font-bold text-foreground">Comparisons</h2>
              <div className="mt-4 divide-y">
                {relatedComparisons.map((c) => {
                  const a = getToolBySlug(c.toolA);
                  const b = getToolBySlug(c.toolB);
                  return (
                    <Link key={c.slug} to={`/compare/${c.slug}`} className="block py-3 text-sm text-accent hover:underline">
                      {a?.name} vs {b?.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Compare CTAs */}
          <div className="mt-10 border-t pt-8">
            <h2 className="text-lg font-bold text-foreground">Compare {tool.name} With Another Tool</h2>
            <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto">
              {otherTools.map((other) => (
                <Link
                  key={other.slug}
                  to={`/compare?toolA=${tool.slug}`}
                  className="text-xs border border-border rounded-lg px-3 py-1.5 text-body hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-200"
                >
                  {tool.name} vs {other.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default ToolDetail;
