import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t mt-20">
      <div className="container flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
        <Link to="/">
          <img src="/logo.svg" alt="AppRival" className="h-7 w-auto" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.insertAdjacentHTML('afterend', '<span class="text-sm font-bold text-foreground">AppRival</span>'); }} />
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/tools" className="text-sm text-body-muted hover:text-foreground transition-colors duration-150">Tools</Link>
          <Link to="/blog" className="text-sm text-body-muted hover:text-foreground transition-colors duration-150">Blog</Link>
        </div>
        <p className="text-xs text-body-muted">© 2026 AppRival. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
