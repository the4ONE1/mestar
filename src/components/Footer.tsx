import { Star, Shield, Download, Lock, Mail } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container">
        {/* Email signup */}
        <div className="max-w-xl mx-auto mb-10 bg-background/60 border border-border rounded-2xl p-6">
          <NewsletterForm source="footer" />
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
          {[
            { icon: Shield, text: "Secure Checkout" },
            { icon: Download, text: "Instant PDF" },
            { icon: Lock, text: "Privacy First" },
            { icon: Star, text: "Family Loved" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-1 text-center">
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary fill-primary" />
            <span className="font-display text-lg font-bold">My <span className="text-star-yellow">Star</span> Stories</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Where every child becomes the hero of their own bedtime adventure. ⭐
          </p>

          {/* Contact block — visible & prominent */}
          <div className="bg-background/60 border border-border rounded-2xl px-6 py-4 mt-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Questions? We'd love to hear from you
            </p>
            <a
              href="mailto:hello@mestar.pro"
              className="inline-flex items-center gap-2 text-base font-semibold text-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4 text-primary" />
              hello@mestar.pro
            </a>
            <p className="text-xs text-muted-foreground mt-1">
              We reply within 24 hours, 7 days a week.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground mt-2">
            <a href="/about" className="hover:text-foreground transition-colors">About</a>
            <a href="/faq" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="/reviews" className="hover:text-foreground transition-colors">Reviews</a>
            <a href="/why-read-together" className="hover:text-foreground transition-colors">Why Read</a>
            <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="mailto:hello@mestar.pro" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
              <Mail className="h-3 w-3" /> Contact
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} My <span className="text-star-yellow">Star</span> Stories. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
