import { Link } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import { Star } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <Star className="h-6 w-6 text-primary fill-primary group-hover:animate-twinkle" />
          <span className="font-display text-xl font-bold text-foreground">My <span className="text-star-yellow">Star</span> Stories</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/products" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
            Shop
          </Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
          <Link to="/reviews" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Reviews
          </Link>
          <Link to="/why-read-together" className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Why Read
          </Link>
          <CartDrawer />
        </div>
      </div>
    </nav>
  );
};
