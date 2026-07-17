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
 * Clear star rating input. Stars are required; the submit button is disabled
 * until the customer selects a rating, and shows a helper message if they
 * try to submit without one.
 */
export default function RatingWidget({ orderId, customerEmail, onSubmitted }: Props) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);

  const isValid = selected >= 1 && selected <= 5;

  const submitRating = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setTouched(true);
    if (!isValid || submitting || done) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("customer_ratings").insert({
        order_id: orderId,
        customer_email: customerEmail || null,
        stars: selected,
        comment: comment.trim() || null,
      });
      if (error) throw error;
      setDone(true);
      toast.success("Thanks for the rating! ⭐", { position: "top-center" });
      onSubmitted?.(selected, comment.trim());
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
    <form
      onSubmit={submitRating}
      className="bg-card border border-border rounded-2xl p-6 text-center"
      noValidate
    >
      <h3 className="font-display text-lg font-bold mb-1">How was your experience?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select a star rating to continue. Your comment is optional.
      </p>

      <div
        className="flex justify-center gap-1 mb-2"
        onMouseLeave={() => setHover(0)}
        role="radiogroup"
        aria-required="true"
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
              setTouched(true);
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

      <p className="text-sm font-medium mb-4" aria-live="polite">
        {selected > 0 ? (
          <span className="text-primary">
            {selected} star{selected > 1 ? "s" : ""} selected
          </span>
        ) : (
          <span className="text-muted-foreground">Tap a star to rate</span>
        )}
      </p>

      {touched && !isValid && (
        <p className="text-sm text-destructive mb-4" role="alert">
          Please select a star rating before submitting.
        </p>
      )}

      <div className="space-y-3">
        <Textarea
          placeholder="Tell other parents what you loved (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          className="text-sm"
          rows={3}
          disabled={submitting}
        />
        <Button
          type="submit"
          disabled={submitting || !isValid}
          size="lg"
          className="w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Star className="h-4 w-4 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
