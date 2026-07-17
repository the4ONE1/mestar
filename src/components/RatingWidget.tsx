import { useState } from "react";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  orderId: string | null;
  customerEmail?: string;
  onSubmitted?: (stars: number, comment: string) => void;
}

/**
 * Single-click 5-star rating with optional comment.
 * Hovering a star previews; clicking submits immediately.
 * User can add a comment afterwards and hit "Send".
 */
export default function RatingWidget({ orderId, customerEmail, onSubmitted }: Props) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submitRating = async (stars: number, withComment: string = "") => {
    if (submitting || done) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("customer_ratings").insert({
        order_id: orderId,
        customer_email: customerEmail || null,
        stars,
        comment: withComment.trim() || null,
      });
      if (error) throw error;
      setDone(true);
      toast.success("Thanks for the rating! ⭐", { position: "top-center" });
      onSubmitted?.(stars, withComment.trim());
    } catch (e) {
      toast.error("Couldn't save your rating — please try again.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
        <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
        <p className="font-semibold text-foreground">Thank you for your feedback!</p>
        <p className="text-sm text-muted-foreground mt-1">
          Your {selected}-star rating helps other families find MESTAR.
        </p>
      </div>
    );
  }

  const activeCount = hover || selected;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 text-center">
      <h3 className="font-display text-lg font-bold mb-1">How was your experience?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Tap a star — that's it. (Add a comment if you'd like.)
      </p>

      <div
        className="flex justify-center gap-1 mb-4"
        onMouseLeave={() => setHover(0)}
        role="radiogroup"
        aria-label="Rate your experience from 1 to 5 stars"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            disabled={submitting}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onClick={() => {
              setSelected(n);
              // 1-click submit; comment can still be added after.
              if (!selected) submitRating(n, "");
            }}
            className="p-1 transition-transform hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                n <= activeCount
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>

      {selected > 0 && !done && (
        <div className="space-y-3 mt-4">
          <Textarea
            placeholder="Tell other parents what you loved (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            className="text-sm"
            rows={3}
          />
          <Button
            onClick={() => submitRating(selected, comment)}
            disabled={submitting}
            size="sm"
            variant="outline"
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Add my comment"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
