import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="text-lg font-bold text-foreground tracking-tight">
          AppRival
        </Link>
        <div className="hidden sm:flex items-center gap-8">
          <Link to="/compare/notion-vs-asana" className="text-sm text-body-muted hover:text-foreground transition-colors duration-150">
            Compare
          </Link>
          <Link to="/tools" className="text-sm text-body-muted hover:text-foreground transition-colors duration-150">
            Tools
          </Link>
          <Link to="/blog" className="text-sm text-body-muted hover:text-foreground transition-colors duration-150">
            Blog
          </Link>
        </div>
        <Link
          to="/tools"
          className="text-sm font-medium border border-accent text-accent rounded-lg px-4 py-1.5 hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
        >
          Start Comparing
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
