import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { getComparisonBySlug } from "@/data/comparisons";
import { getToolBySlug } from "@/data/tools";
import NotFound from "./NotFound";

const ComparePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const comparison = slug ? getComparisonBySlug(slug) : undefined;

  if (!comparison) return <NotFound />;

  const toolA = getToolBySlug(comparison.toolA);
  const toolB = getToolBySlug(comparison.toolB);

  if (!toolA || !toolB) return <NotFound />;

  return (
    <Layout>
      <div className="container py-16 max-w-3xl">
        <Link to="/" className="text-sm text-accent hover:underline">← Back to home</Link>
        <h1 className="text-3xl font-bold text-foreground mt-6">
          {toolA.name} vs {toolB.name}
        </h1>
        <span className="text-xs border rounded px-2 py-0.5 text-body-muted mt-2 inline-block">{comparison.category}</span>
        <p className="mt-6 text-body">{comparison.summary}</p>

        {/* Comparison Table */}
        <div className="mt-10 border rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 text-sm font-semibold text-foreground bg-secondary px-4 py-3">
            <span>Criteria</span>
            <span>{toolA.name}</span>
            <span>{toolB.name}</span>
          </div>
          {comparison.criteria.map((row, i) => (
            <div key={i} className="grid grid-cols-3 text-sm px-4 py-3 border-t">
              <span className="font-medium text-foreground">{row.label}</span>
              <span className="text-body">{row.toolA}</span>
              <span className="text-body">{row.toolB}</span>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div className="mt-10 border-t pt-8">
          <h2 className="text-lg font-bold text-foreground">Our Verdict</h2>
          <p className="mt-3 text-body">{comparison.verdict}</p>
        </div>

        {/* Links to individual tools */}
        <div className="mt-10 flex gap-4">
          <Link to={`/tools/${toolA.slug}`} className="text-sm text-accent hover:underline">
            Read {toolA.name} review →
          </Link>
          <Link to={`/tools/${toolB.slug}`} className="text-sm text-accent hover:underline">
            Read {toolB.name} review →
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ComparePage;
