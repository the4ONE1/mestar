import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, Gift } from "lucide-react";
import { toast } from "sonner";

interface NewsletterFormProps {
  source: "footer" | "popup";
  variant?: "default" | "popup";
  className?: string;
}

export const NewsletterForm = ({ source, variant = "default", className = "" }: NewsletterFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email", { position: "top-center" });
      return;
    }
    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const resp = await fetch(`${supabaseUrl}/functions/v1/subscribe-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Something went wrong");
      setSuccess(true);
      setCode(data.code || "WELCOME");
      toast.success(
        data.alreadySubscribed
          ? "You're already on the list — code: WELCOME ⭐"
          : "Check your inbox for your discount code! ⭐",
        { position: "top-center" }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Try again in a moment";
      toast.error(msg, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  if (success && code) {
    return (
      <div className={`text-center ${className}`}>
        <div className="inline-flex items-center gap-2 text-primary mb-2">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-display font-bold">You're in!</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Use this code at checkout (orders $25+):
        </p>
        <div className="inline-block bg-primary/10 border-2 border-dashed border-primary rounded-xl px-6 py-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Your code</p>
          <p className="text-2xl font-display font-extrabold text-primary tracking-widest">{code}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-3">We've also emailed it to {email}.</p>
      </div>
    );
  }

  const isPopup = variant === "popup";

  return (
    <form onSubmit={handleSubmit} className={className}>
      {isPopup && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/30 mb-3">
            <Gift className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-extrabold mb-1">Get 20% Off Your First Story</h2>
          <p className="text-sm text-muted-foreground">
            Join our family of parents — we'll email your code instantly. Valid on orders $25+.
          </p>
        </div>
      )}
      {!isPopup && (
        <div className="mb-3">
          <p className="font-display font-bold text-foreground flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" /> Get 20% off your first story
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Email-only · orders $25+ · one-time use
          </p>
        </div>
      )}
      <div className={`flex gap-2 ${isPopup ? "flex-col sm:flex-row" : "flex-col sm:flex-row"}`}>
        <Input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-background"
          maxLength={255}
          aria-label="Email address"
        />
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-display rounded-full px-6 whitespace-nowrap"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send My Code"}
        </Button>
      </div>
      {isPopup && (
        <p className="text-[11px] text-muted-foreground text-center mt-3">
          No spam. Unsubscribe anytime.
        </p>
      )}
    </form>
  );
};
