import { Link } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import { Star } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <Star className="h-6 w-6 text-primary fill-primary group-hover:animate-twinkle" />
          <span className="font-display text-xl font-bold text-foreground">Star Stories</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
          <CartDrawer />
        </div>
      </div>
    </nav>
  );
};
