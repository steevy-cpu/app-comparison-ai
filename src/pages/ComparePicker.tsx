import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { tools, Tool } from "@/data/tools";
import { getComparisonBySlug } from "@/data/comparisons";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const ComparePicker = () => {
  const navigate = useNavigate();
  const [toolA, setToolA] = useState<Tool | null>(null);
  const [toolB, setToolB] = useState<Tool | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canCompare = toolA !== null && toolB !== null;

  const handleCompare = () => {
    if (!toolA || !toolB) return;
    setError(null);

    const slug1 = `${toolA.slug}-vs-${toolB.slug}`;
    const slug2 = `${toolB.slug}-vs-${toolA.slug}`;

    if (getComparisonBySlug(slug1)) {
      navigate(`/compare/${slug1}`);
    } else if (getComparisonBySlug(slug2)) {
      navigate(`/compare/${slug2}`);
    } else {
      setError("We don't have this comparison yet — try another combination.");
    }
  };

  return (
    <Layout>
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
                <BreadcrumbPage>Compare</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container py-16 max-w-5xl">
        <h1 className="text-3xl font-bold text-foreground">Compare Tools</h1>
        <p className="mt-2 text-body-muted">
          Select two tools below to see a detailed side-by-side breakdown.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ToolColumn
            heading="Pick Tool A"
            selected={toolA}
            disabled={toolB}
            onSelect={(t) => { setToolA(t); setError(null); }}
          />
          <ToolColumn
            heading="Pick Tool B"
            selected={toolB}
            disabled={toolA}
            onSelect={(t) => { setToolB(t); setError(null); }}
          />
        </div>

        <div className="mt-8">
          <button
            onClick={handleCompare}
            disabled={!canCompare}
            className={`w-full md:w-auto text-sm font-medium px-6 py-2.5 rounded-lg transition-opacity duration-150 ${
              canCompare
                ? "bg-accent text-accent-foreground hover:opacity-90 cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            Compare Now →
          </button>
          {error && (
            <p className="mt-3 text-sm text-danger">{error}</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

function ToolColumn({
  heading,
  selected,
  disabled,
  onSelect,
}: {
  heading: string;
  selected: Tool | null;
  disabled: Tool | null;
  onSelect: (tool: Tool) => void;
}) {
  return (
    <div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
        {heading}
      </h3>
      <div className="border border-border rounded-lg overflow-y-auto max-h-[420px]">
        {tools.map((tool, i) => {
          const isSelected = selected?.slug === tool.slug;
          const isDisabled = disabled?.slug === tool.slug;

          return (
            <button
              key={tool.slug}
              onClick={() => !isDisabled && onSelect(tool)}
              disabled={isDisabled}
              className={`w-full text-left px-4 py-3 transition-colors duration-150 ${
                i < tools.length - 1 ? "border-b border-border" : ""
              } ${
                isSelected
                  ? "border-l-2 border-l-accent bg-verdict-bg"
                  : isDisabled
                  ? "opacity-40 pointer-events-none"
                  : "hover:bg-secondary cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">
                  {tool.name}
                </span>
                <Badge variant="outline" className="text-xs">
                  {tool.category}
                </Badge>
              </div>
              <p className="text-xs text-body-muted mt-1 truncate">
                {tool.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ComparePicker;
