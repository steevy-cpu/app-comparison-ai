import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { comparisons, getComparisonBySlug } from "@/data/comparisons";
import { getToolBySlug } from "@/data/tools";
import NotFound from "./NotFound";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, Minus, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";

/** Map qualitative scores to a 1–10 numeric value for the bar chart */
function scoreToNumber(score: string): number {
  const lower = score.toLowerCase();
  if (lower === "excellent" || lower === "blazing fast") return 9;
  if (lower === "good" || lower === "fast" || lower === "generous" || lower === "easy") return 7;
  if (lower === "moderate" || lower === "basic" || lower === "steep") return 5;
  if (lower === "limited" || lower === "none") return 3;
  // For pricing or freeform text, return 0 (no bar)
  return 0;
}

function ScoreBar({ score }: { score: string }) {
  const num = scoreToNumber(score);
  if (num === 0) {
    return <span className="text-sm text-body">{score}</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-sm bg-secondary overflow-hidden">
        <div
          className="h-full rounded-sm bg-accent"
          style={{ width: `${(num / 10) * 100}%` }}
        />
      </div>
      <span className="text-xs text-body-muted">{score}</span>
    </div>
  );
}

const ComparePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const comparison = slug ? getComparisonBySlug(slug) : undefined;

  if (!comparison) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Comparison not found</h1>
          <p className="mt-3 text-body-muted">We couldn't find the comparison you're looking for.</p>
          <Link to="/tools" className="mt-6 inline-block text-sm text-accent hover:underline">
            ← Browse all tools
          </Link>
        </div>
      </Layout>
    );
  }

  const toolA = getToolBySlug(comparison.toolA);
  const toolB = getToolBySlug(comparison.toolB);

  if (!toolA || !toolB) return <NotFound />;

  const maxFeatures = Math.max(toolA.features.length, toolB.features.length);

  const related = comparisons
    .filter((c) => c.slug !== comparison.slug)
    .slice(0, 3);

  return (
    <Layout>
      {/* 1. Breadcrumb */}
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
                  <Link to="/">Compare</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {toolA.name} vs {toolB.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container py-10 max-w-4xl">
        {/* 2. Comparison Header */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-8 items-start">
          <ToolHeaderBlock tool={toolA} />
          <span className="hidden md:flex items-center justify-center text-4xl font-bold text-muted-foreground pt-2 select-none">
            VS
          </span>
          <span className="flex md:hidden items-center justify-center text-2xl font-bold text-muted-foreground select-none">
            VS
          </span>
          <ToolHeaderBlock tool={toolB} />
        </div>
        <p className="mt-8 text-body-muted text-sm leading-relaxed">{comparison.summary}</p>

        {/* 3. Verdict Banner */}
        <div className="mt-10 border border-verdict-border rounded-lg bg-verdict-bg p-5 md:p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Our Verdict</h3>
            <p className="mt-2 text-sm text-body leading-relaxed">{comparison.verdict}</p>
          </div>
          <div className="flex gap-6 md:gap-8 shrink-0">
            <div className="text-center">
              <span className="text-xs text-body-muted">{toolA.name}</span>
              <p className="text-xl font-bold text-foreground">{toolA.rating}<span className="text-sm font-normal text-body-muted">/5</span></p>
            </div>
            <div className="text-center">
              <span className="text-xs text-body-muted">{toolB.name}</span>
              <p className="text-xl font-bold text-foreground">{toolB.rating}<span className="text-sm font-normal text-body-muted">/5</span></p>
            </div>
          </div>
        </div>

        {/* 4. Criteria Comparison Table */}
        <SectionHeading>Head-to-Head Breakdown</SectionHeading>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Criteria</TableHead>
              <TableHead>{toolA.name}</TableHead>
              <TableHead>{toolB.name}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparison.criteria.map((row, i) => (
              <TableRow key={i} className={i % 2 === 1 ? "bg-row-alt" : ""}>
                <TableCell className="font-medium text-foreground">{row.label}</TableCell>
                <TableCell><ScoreBar score={row.toolA} /></TableCell>
                <TableCell><ScoreBar score={row.toolB} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 5. Features Comparison Table */}
        <SectionHeading>Features</SectionHeading>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{toolA.name}</TableHead>
              <TableHead>{toolB.name}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: maxFeatures }).map((_, i) => (
              <TableRow key={i} className={i % 2 === 1 ? "bg-row-alt" : ""}>
                <TableCell>
                  {toolA.features[i] ? (
                    <span className="flex items-center gap-2 text-sm">
                      <Check size={15} className="text-accent shrink-0" />
                      {toolA.features[i]}
                    </span>
                  ) : (
                    <Minus size={15} className="text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell>
                  {toolB.features[i] ? (
                    <span className="flex items-center gap-2 text-sm">
                      <Check size={15} className="text-accent shrink-0" />
                      {toolB.features[i]}
                    </span>
                  ) : (
                    <Minus size={15} className="text-muted-foreground" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 6. Pros & Cons */}
        <SectionHeading>Pros &amp; Cons</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProConBox tool={toolA} />
          <ProConBox tool={toolB} />
        </div>

        {/* 7. Best For */}
        <SectionHeading>Who Should Use Each Tool?</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-foreground">{toolA.name}</h4>
            <p className="mt-2 text-sm text-body leading-relaxed">{toolA.bestFor}</p>
          </div>
          <div>
            <h4 className="font-bold text-foreground">{toolB.name}</h4>
            <p className="mt-2 text-sm text-body leading-relaxed">{toolB.bestFor}</p>
          </div>
        </div>

        {/* 8. Pricing */}
        <SectionHeading>Pricing</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PricingBox tool={toolA} />
          <PricingBox tool={toolB} />
        </div>

        {/* 9. Related Comparisons */}
        <SectionHeading>Related Comparisons</SectionHeading>
        <div className="divide-y divide-border">
          {related.map((c) => {
            const rA = getToolBySlug(c.toolA);
            const rB = getToolBySlug(c.toolB);
            if (!rA || !rB) return null;
            return (
              <div key={c.slug} className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <Link to={`/compare/${c.slug}`} className="font-semibold text-sm text-foreground hover:text-accent">
                  {rA.name} vs {rB.name}
                </Link>
                <Badge variant="outline" className="text-xs w-fit">{c.category}</Badge>
                <span className="text-xs text-body-muted hidden sm:inline flex-1">{c.summary.slice(0, 80)}…</span>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

/* ---- Sub-components ---- */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 pt-8 border-t border-border text-lg font-bold text-foreground mb-4">
      {children}
    </h2>
  );
}

function ToolHeaderBlock({ tool }: { tool: ReturnType<typeof getToolBySlug> }) {
  if (!tool) return null;
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{tool.name}</h1>
      <Badge variant="outline" className="mt-2 text-xs">{tool.category}</Badge>
      <p className="mt-3 text-sm text-body leading-relaxed">{tool.description}</p>
      <a
        href={`https://${tool.website}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
      >
        Visit site <ExternalLink size={12} />
      </a>
    </div>
  );
}

function ProConBox({ tool }: { tool: ReturnType<typeof getToolBySlug> }) {
  if (!tool) return null;
  return (
    <div className="border border-border rounded-lg p-5">
      <h4 className="font-bold text-foreground mb-4">{tool.name}</h4>
      <div className="mb-4">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-success mb-2">
          <ThumbsUp size={13} /> Pros
        </span>
        <ul className="space-y-1.5">
          {tool.pros.map((p, i) => (
            <li key={i} className="text-sm text-body flex items-start gap-2">
              <ThumbsUp size={12} className="text-success mt-1 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-danger mb-2">
          <ThumbsDown size={13} /> Cons
        </span>
        <ul className="space-y-1.5">
          {tool.cons.map((c, i) => (
            <li key={i} className="text-sm text-body flex items-start gap-2">
              <ThumbsDown size={12} className="text-danger mt-1 shrink-0" />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PricingBox({ tool }: { tool: ReturnType<typeof getToolBySlug> }) {
  if (!tool) return null;
  return (
    <div className="border border-border rounded-lg p-5">
      <h4 className="font-bold text-foreground text-sm">{tool.name}</h4>
      <p className="mt-2 text-lg font-semibold text-foreground">{tool.pricing}</p>
      <a
        href={`https://${tool.website}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
      >
        View pricing <ExternalLink size={12} />
      </a>
    </div>
  );
}

export default ComparePage;
