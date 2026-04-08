import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X, Search, LogOut, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { tools } from "@/data/tools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface AffiliateRow {
  tool_slug: string;
  tool_name: string;
  category: string;
  affiliate_url: string;
  source: "supabase" | "static" | "none";
  dirty: boolean;
}

// Set VITE_ADMIN_PASSWORD in Lovable project settings → Environment Variables
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error('VITE_ADMIN_PASSWORD environment variable is not set');
}

function AdminLogin({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("admin_auth", "true");
      onAuth();
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm border border-border rounded-xl p-8"
      >
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="AppRival" className="h-8" />
        </div>
        <h1 className="text-xl font-bold text-foreground text-center">Admin Access</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`transition-all duration-200 ${error ? "border-destructive animate-[shake_0.3s_ease-in-out]" : ""}`}
          />
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Enter
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

const Admin = () => {
  const [authed, setAuthed] = useState(() => localStorage.getItem("admin_auth") === "true");
  const [rows, setRows] = useState<AffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [errorSlug, setErrorSlug] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!authed) return;
    loadData();
  }, [authed]);

  async function loadData() {
    setLoading(true);
    const { data: dbRows } = await supabase.from("affiliate_urls").select("*");
    const dbMap = new Map((dbRows || []).map((r) => [r.tool_slug, r]));

    const merged: AffiliateRow[] = tools.map((t) => {
      const dbEntry = dbMap.get(t.slug);
      return {
        tool_slug: t.slug,
        tool_name: t.name,
        category: t.category,
        affiliate_url: dbEntry?.affiliate_url || t.affiliateUrl || "",
        source: dbEntry ? "supabase" : t.affiliateUrl ? "static" : "none",
        dirty: false,
      };
    });

    // Add Supabase-only entries not in tools.ts
    (dbRows || []).forEach((r) => {
      if (!tools.find((t) => t.slug === r.tool_slug)) {
        merged.push({
          tool_slug: r.tool_slug,
          tool_name: r.tool_name,
          category: "Uncategorized",
          affiliate_url: r.affiliate_url,
          source: "supabase",
          dirty: false,
        });
      }
    });

    setRows(merged);
    setLoading(false);
  }

  function updateUrl(slug: string, url: string) {
    setRows((prev) =>
      prev.map((r) => (r.tool_slug === slug ? { ...r, affiliate_url: url, dirty: true } : r))
    );
  }

  async function saveRow(row: AffiliateRow) {
    if (!row.affiliate_url.trim()) return;
    setSavingSlug(row.tool_slug);
    const { error } = await supabase.from("affiliate_urls").upsert(
      {
        tool_slug: row.tool_slug,
        tool_name: row.tool_name,
        affiliate_url: row.affiliate_url.trim(),
      },
      { onConflict: "tool_slug" }
    );
    setSavingSlug(null);
    if (error) {
      setErrorSlug(row.tool_slug);
      setTimeout(() => setErrorSlug(null), 2000);
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      setSavedSlug(row.tool_slug);
      setRows((prev) =>
        prev.map((r) => (r.tool_slug === row.tool_slug ? { ...r, source: "supabase", dirty: false } : r))
      );
      setTimeout(() => setSavedSlug(null), 2000);
    }
  }

  async function saveAll() {
    const toSave = rows.filter((r) => r.affiliate_url.trim() && r.dirty);
    if (toSave.length === 0) {
      toast({ title: "Nothing to save", description: "No changes detected." });
      return;
    }
    setBulkSaving(true);
    const { error } = await supabase.from("affiliate_urls").upsert(
      toSave.map((r) => ({
        tool_slug: r.tool_slug,
        tool_name: r.tool_name,
        affiliate_url: r.affiliate_url.trim(),
      })),
      { onConflict: "tool_slug" }
    );
    setBulkSaving(false);
    if (error) {
      toast({ title: "Bulk save failed", description: error.message, variant: "destructive" });
    } else {
      setRows((prev) => prev.map((r) => (toSave.find((s) => s.tool_slug === r.tool_slug) ? { ...r, source: "supabase", dirty: false } : r)));
      toast({ title: "All changes saved", description: `${toSave.length} URLs updated.` });
    }
  }

  function logout() {
    localStorage.removeItem("admin_auth");
    setAuthed(false);
  }

  const filtered = useMemo(
    () => rows.filter((r) => r.tool_name.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  const stats = useMemo(() => {
    const total = rows.length;
    const configured = rows.filter((r) => r.source === "supabase").length;
    return { total, configured, missing: total - configured };
  }, [rows]);

  if (!authed) return <AdminLogin onAuth={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-3">
          <span className="font-bold text-foreground">AppRival Admin</span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
            <LogOut size={14} className="mr-1" /> Logout
          </Button>
        </div>
      </div>

      <div className="container py-8 max-w-5xl">
        <h1 className="text-2xl font-bold text-foreground">Affiliate URL Manager</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage affiliate tracking URLs for all tools. Changes go live instantly.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: "Total Tools", value: stats.total },
            { label: "URLs Configured", value: stats.configured },
            { label: "Missing URLs", value: stats.missing },
          ].map((s) => (
            <div key={s.label} className="border border-border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mt-8">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block mt-6 border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Tool</th>
                    <th className="text-left px-4 py-3 font-medium">Source</th>
                    <th className="text-left px-4 py-3 font-medium">Affiliate URL</th>
                    <th className="px-4 py-3 font-medium w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((row) => (
                    <tr key={row.tool_slug} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{row.tool_name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{row.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <SourceBadge source={row.source} />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={row.affiliate_url}
                          onChange={(e) => updateUrl(row.tool_slug, e.target.value)}
                          placeholder="https://your-affiliate-link.com"
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <SaveButton
                          row={row}
                          saving={savingSlug === row.tool_slug}
                          saved={savedSlug === row.tool_slug}
                          error={errorSlug === row.tool_slug}
                          onSave={() => saveRow(row)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden mt-6 space-y-3">
              {filtered.map((row) => (
                <div key={row.tool_slug} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-foreground text-sm">{row.tool_name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{row.category}</Badge>
                    </div>
                    <SourceBadge source={row.source} />
                  </div>
                  <Input
                    value={row.affiliate_url}
                    onChange={(e) => updateUrl(row.tool_slug, e.target.value)}
                    placeholder="https://your-affiliate-link.com"
                    className="h-8 text-xs"
                  />
                  <SaveButton
                    row={row}
                    saving={savingSlug === row.tool_slug}
                    saved={savedSlug === row.tool_slug}
                    error={errorSlug === row.tool_slug}
                    onSave={() => saveRow(row)}
                  />
                </div>
              ))}
            </div>

            {/* Save All */}
            <div className="mt-6 flex justify-end">
              <Button onClick={saveAll} disabled={bulkSaving} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {bulkSaving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
                Save All
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function SourceBadge({ source }: { source: "supabase" | "static" | "none" }) {
  if (source === "supabase")
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Supabase</Badge>;
  if (source === "static")
    return <Badge className="bg-secondary text-muted-foreground text-xs">Static</Badge>;
  return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">None</Badge>;
}

function SaveButton({
  row,
  saving,
  saved,
  error,
  onSave,
}: {
  row: AffiliateRow;
  saving: boolean;
  saved: boolean;
  error: boolean;
  onSave: () => void;
}) {
  if (saved) return <Check size={16} className="text-emerald-600" />;
  if (error) return <X size={16} className="text-destructive" />;
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onSave}
      disabled={saving || !row.affiliate_url.trim()}
      className="h-7 text-xs text-accent border-accent/30 hover:bg-accent hover:text-accent-foreground"
    >
      {saving ? <Loader2 size={12} className="animate-spin" /> : "Save"}
    </Button>
  );
}

export default Admin;
