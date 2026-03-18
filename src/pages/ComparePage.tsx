import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
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
import { Check, Minus, CheckCircle, XCircle, Star, ExternalLink } from "lucide-react";
import { getToolUrl } from "@/lib/affiliate";

/** Map qualitative scores to a 1–10 numeric value for the bar chart */
function scoreToNumber(score: string): number {
  const lower = score.toLowerCase();
  if (lower === "excellent" || lower === "blazing fast") return 9;
  if (lower === "good" || lower === "fast" || lower === "generous" || lower === "easy") return 7;
  if (lower === "moderate" || lower === "basic" || lower === "steep") return 5;
  if (lower === "limited" || lower === "none") return 3;
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
        <motion.div
          className="h-full rounded-sm bg-accent"
          initial={{ width: 0 }}
          whileInView={{ width: `${(num / 10) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
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
      <SEO
        title={`${toolA.name} vs ${toolB.name}`}
        description={`${toolA.name} vs ${toolB.name}: detailed comparison of features, pricing, pros and cons. Find out which tool is right for your team.`}
        canonical={`/compare/${comparison.slug}`}
      />
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
                  <Link to="/compare">Compare</Link>
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
        {/* Last updated */}
        <p className="text-xs text-body-muted text-right mb-6">Last updated: {comparison.updatedAt}</p>
        {/* 2. Comparison Header */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-8 items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ToolHeaderBlock tool={toolA} />
          <span className="hidden md:flex items-center justify-center select-none">
            <span className="bg-secondary text-muted-foreground font-black text-2xl px-4 py-2 rounded-xl">VS</span>
          </span>
          <span className="flex md:hidden items-center justify-center select-none">
            <span className="bg-secondary text-muted-foreground font-black text-xl px-3 py-1.5 rounded-xl">VS</span>
          </span>
          <ToolHeaderBlock tool={toolB} />
        </motion.div>
        <p className="mt-8 text-body-muted text-sm leading-relaxed">{comparison.summary}</p>

        {/* 3. Verdict Banner */}
        <motion.div
          className="mt-10 bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20 rounded-lg p-5 md:p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wide">
              <Star size={13} className="fill-accent text-accent" /> Our Verdict
            </span>
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
        </motion.div>

        {/* 4. Criteria Comparison Table */}
        <SectionHeading>Head-to-Head Breakdown</SectionHeading>
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="w-[30%] text-xs uppercase tracking-wide text-body-muted">Criteria</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-body-muted">{toolA.name}</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-body-muted">{toolB.name}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparison.criteria.map((row, i) => (
              <TableRow key={i} className={`hover:bg-secondary/30 transition-colors duration-100 ${i % 2 === 1 ? "bg-row-alt" : ""}`}>
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
            <TableRow className="bg-secondary/50">
              <TableHead className="text-xs uppercase tracking-wide text-body-muted">{toolA.name}</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-body-muted">{toolB.name}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: maxFeatures }).map((_, i) => (
              <TableRow key={i} className={`hover:bg-secondary/30 transition-colors duration-100 ${i % 2 === 1 ? "bg-row-alt" : ""}`}>
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
                <Link to={`/compare/${c.slug}`} className="font-semibold text-sm text-foreground hover:text-accent transition-colors duration-150">
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
        href={getToolUrl(tool)}
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
    <div className="border border-border rounded-lg p-5 hover:shadow-sm transition-shadow duration-200">
      <h4 className="font-bold text-foreground mb-4">{tool.name}</h4>
      <div className="mb-4">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-success mb-2">
          <CheckCircle size={13} /> Pros
        </span>
        <ul className="space-y-1.5">
          {tool.pros.map((p, i) => (
            <li key={i} className="text-sm text-body flex items-start gap-2">
              <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-danger mb-2">
          <XCircle size={13} /> Cons
        </span>
        <ul className="space-y-1.5">
          {tool.cons.map((c, i) => (
            <li key={i} className="text-sm text-body flex items-start gap-2">
              <XCircle size={14} className="text-danger mt-0.5 shrink-0" />
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
    <div className="border border-border rounded-lg p-5 hover:shadow-sm transition-shadow duration-200">
      <h4 className="font-bold text-foreground text-sm">{tool.name}</h4>
      <p className="mt-2 text-lg font-semibold text-foreground">{tool.pricing}</p>
      <a
        href={getToolUrl(tool)}
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
