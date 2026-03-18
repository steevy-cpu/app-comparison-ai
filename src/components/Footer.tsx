import { Link } from "react-router-dom";
import { tools } from "@/data/tools";
import { comparisons } from "@/data/comparisons";
import { getToolBySlug } from "@/data/tools";

const topComparisons = comparisons.slice(0, 4);
const topTools = tools.slice(0, 4);

const Footer = () => {
  return (
    <footer className="border-t mt-20 bg-secondary/30">
      {/* Rich columns */}
      <div className="container py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Column 1: Brand */}
        <div>
          <Link to="/">
            <img src="/logo.svg" alt="AppRival" className="h-7 w-auto" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.insertAdjacentHTML('afterend', '<span class="text-sm font-bold text-foreground">AppRival</span>'); }} />
          </Link>
          <p className="mt-3 text-sm text-body-muted">Find the right tool, faster.</p>
        </div>

        {/* Column 2: Compare */}
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3">Compare</h4>
          <ul className="space-y-2">
            {topComparisons.map((c) => {
              const a = getToolBySlug(c.toolA);
              const b = getToolBySlug(c.toolB);
              return (
                <li key={c.slug}>
                  <Link to={`/compare/${c.slug}`} className="text-sm text-body-muted hover:text-accent transition-colors duration-150">
                    {a?.name} vs {b?.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Column 3: Tools */}
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3">Tools</h4>
          <ul className="space-y-2">
            {topTools.map((t) => (
              <li key={t.slug}>
                <Link to={`/tools/${t.slug}`} className="text-sm text-body-muted hover:text-accent transition-colors duration-150">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom row */}
      <div className="border-t">
        <div className="container flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
          <div className="flex items-center gap-6">
            <Link to="/tools" className="text-sm text-body-muted hover:text-foreground transition-colors duration-150">Tools</Link>
            <Link to="/blog" className="text-sm text-body-muted hover:text-foreground transition-colors duration-150">Blog</Link>
          </div>
          <p className="text-xs text-body-muted">© 2026 AppRival. All rights reserved.</p>
          <p className="text-xs text-body-muted">Made with ♥ by AppRival</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
