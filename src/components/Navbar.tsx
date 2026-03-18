import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { to: "/compare", label: "Compare" },
  { to: "/tools", label: "Tools" },
  { to: "/blog", label: "Blog" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav ref={navRef} className="sticky top-0 z-50 bg-background border-b">
      <div className="container flex items-center justify-between h-14">
        <Link to="/">
          <img src="/logo.svg" alt="AppRival" style={{ height: 28, width: 'auto' }} />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-body-muted hover:text-foreground transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          to="/tools"
          className="hidden md:inline-flex text-sm font-medium border border-accent text-accent rounded-lg px-4 py-1.5 hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
        >
          Start Comparing
        </Link>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-background border-b border-border py-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm font-medium text-foreground hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <div className="px-6 pt-2">
            <Link
              to="/tools"
              onClick={() => setOpen(false)}
              className="block w-full text-center text-sm font-medium bg-accent text-accent-foreground rounded-lg px-4 py-2.5 hover:opacity-90 transition-opacity duration-150"
            >
              Start Comparing
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
