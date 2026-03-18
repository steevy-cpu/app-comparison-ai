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
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-background/90 backdrop-blur-sm shadow-sm border-b border-border"
          : "bg-background border-b border-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-14">
        <Link to="/">
          <img
            src="/logo.svg"
            alt="AppRival"
            className="h-8 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.insertAdjacentHTML(
                "afterend",
                '<span class="text-lg font-bold text-foreground tracking-tight">AppRival</span>'
              );
            }}
          />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative text-sm text-body-muted hover:text-foreground transition-colors duration-150 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-200 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          to="/tools"
          className="hidden md:inline-flex bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-all duration-200 hover:shadow-md"
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
      <div
        className={`md:hidden bg-background border-b border-border overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-80 opacity-100 py-4" : "max-h-0 opacity-0 py-0 border-b-0"
        }`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setOpen(false)}
            className="block px-6 py-3 text-sm font-medium text-foreground hover:text-accent transition-colors duration-150"
          >
            {link.label}
          </Link>
        ))}
        <div className="px-6 pt-2">
          <Link
            to="/tools"
            onClick={() => setOpen(false)}
            className="block w-full text-center text-sm font-medium bg-accent text-accent-foreground rounded-lg px-4 py-2.5 hover:bg-accent/90 transition-all duration-200"
          >
            Start Comparing
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
