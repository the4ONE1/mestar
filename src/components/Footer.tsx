import { Star } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-10">
      <div className="container">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary fill-primary" />
            <span className="font-display text-lg font-bold">My Star Stories</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Where every child becomes the hero of their own bedtime adventure. ⭐
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link to="/reviews" className="hover:text-foreground transition-colors">Reviews</Link>
            <Link to="/why-read-together" className="hover:text-foreground transition-colors">Why Read</Link>
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} My Star Stories. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
