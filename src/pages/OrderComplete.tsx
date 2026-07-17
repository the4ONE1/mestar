import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Download, ArrowLeft, Sparkles, CheckCircle2, Mail, Volume2, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import RatingWidget from "@/components/RatingWidget";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { supabase } from "@/integrations/supabase/client";


const PROGRESS_STAGES = [
  { status: "pending_payment", label: "Waiting for payment to finish...", icon: "💳" },
  { status: "queued", label: "Payment confirmed — queueing your story...", icon: "✨" },
  { status: "generating_story", label: "Crafting your unique story...", icon: "📖" },
  { status: "generating_images", label: "Creating beautiful illustrations...", icon: "🎨" },
  { status: "assembling_pdf", label: "Assembling your PDF storybook...", icon: "📄" },
  { status: "complete", label: "Ready!", icon: "🌟" },
];

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const SUPABASE_FN_BASE = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;

const OrderComplete = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get("order_id");

  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("pending_payment");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [storyTitle, setStoryTitle] = useState<string>("");
  const [childName, setChildName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [hasAudiobook, setHasAudiobook] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [confirming, setConfirming] = useState<boolean>(false);
  const pdfOpenedRef = useRef(false);

  const handleConfirmReceived = async (extra?: { stars?: number; comment?: string }) => {
    if (!orderId || confirmed) return;
    setConfirming(true);
    try {
      // 1. Mark order fulfilled in DB (via edge function using service role)
      const { data: confirmData, error: rpcErr } = await supabase.functions.invoke(
        "confirm-pdf-received",
        { body: { order_id: orderId } },
      );
      if (rpcErr) throw rpcErr;
      if (!confirmData?.ok) throw new Error("Order not found or not complete yet");

      // 2. Send fulfillment email to shop owner
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "order-fulfilled",
          recipientEmail: "mestar.orders@gmail.com",
          idempotencyKey: `order-fulfilled-${orderId}`,
          templateData: {
            orderId,
            childName,
            storyTitle,
            customerEmail,
            stars: extra?.stars,
            ratingComment: extra?.comment,
            confirmedAt: new Date().toISOString(),
          },
        },
      });

      setConfirmed(true);
      toast.success("Thanks for confirming! 💛", { position: "top-center" });
    } catch (e) {
      console.error("Confirm failed:", e);
      toast.error("Couldn't save confirmation — please try again.");
    } finally {
      setConfirming(false);
    }
  };

  // Resolve which order id to poll
  useEffect(() => {
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
      return;
    }
    // Fallback: read from localStorage (handles older flows)
    const saved = localStorage.getItem("mestar-pending-story");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.orderId) {
          setOrderId(parsed.orderId);
          if (parsed.customerEmail) setCustomerEmail(parsed.customerEmail);
          if (parsed.selectedAddons?.audiobook) setHasAudiobook(true);
        } else {
          setError("We couldn't find your order. If you just paid, check your email — your storybook will arrive there shortly.");
        }
      } catch {
        setError("We couldn't read your order details. Please check your email for your storybook.");
      }
    } else {
      setError("No order found. If you just paid, check your email — your storybook will arrive there shortly.");
    }
  }, [orderIdFromUrl]);

  // Poll the database for order status
  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    const startedAt = Date.now();

    const poll = async () => {
      if (cancelled) return;

      const res = await fetch(`${SUPABASE_FN_BASE}/get-order-status?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json().catch(() => null);

      if (cancelled) return;

      if (!res.ok) {
        console.error("Polling error:", data?.error || res.statusText);
      } else if (data) {
        const row = data;
        setStatus(row.status);
        if (row.story_title) setStoryTitle(row.story_title);
        if (row.child_name) setChildName(row.child_name);
        if (row.customer_email) setCustomerEmail(row.customer_email);
        setHasAudiobook(!!row.has_audiobook);

        if (row.status === "complete" && row.pdf_url) {
          setPdfUrl(row.pdf_url);
          if (!pdfOpenedRef.current) {
            pdfOpenedRef.current = true;
            window.open(row.pdf_url, "_blank");
            toast.success("Your storybook PDF is ready! 🎉", { position: "top-center" });
            localStorage.removeItem("mestar-pending-story");
          }
          return; // stop polling
        }

        if (row.status === "failed") {
          setError("Something went wrong creating your storybook. We've been notified — please contact support.");
          return; // stop polling
        }
      }

      // Timeout safety — stop after 5 minutes
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        setError("Your storybook is taking longer than expected. Don't worry — we'll email you the PDF as soon as it's ready.");
        return;
      }

      setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const currentStageIndex = PROGRESS_STAGES.findIndex((s) => s.status === status);
  const activeStageIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <SEO title="Your Order — MESTAR" description="Check your order status for your MESTAR personalized PDF storybook. We'll email your download link as soon as it's ready." noindex />
        <h1 className="sr-only">Your Order Status</h1>
        <div className="text-center max-w-md">
          <p className="text-4xl mb-4">📬</p>
          <h2 className="font-display text-2xl font-bold mb-4">Check your email</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  // ── Complete State ──
  if (pdfUrl) {
    return (
      <div className="min-h-screen py-8">
        <PaymentTestModeBanner />
        <div className="container max-w-lg">

          <div className="text-center mb-8">
            <p className="text-5xl mb-4">🎉</p>
            <h1 className="font-display text-3xl font-bold mb-2">
              {childName ? `${childName}'s Storybook is Ready!` : "Your Storybook is Ready!"}
            </h1>
            {storyTitle && (
              <p className="text-lg text-muted-foreground font-medium">"{storyTitle}"</p>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border p-8 mb-6 text-center">
            <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">Your PDF Storybook</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Includes the personalized story plus any add-ons you selected.
            </p>
            <Button asChild size="lg" className="w-full">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="h-5 w-5 mr-2" />
                Download Your PDF
              </a>
            </Button>
          </div>

          {hasAudiobook && orderId && (
            <div className="bg-card rounded-2xl border-2 border-primary/40 p-6 mb-6 text-center shadow-lg shadow-primary/10">
              <Volume2 className="h-10 w-10 text-primary mx-auto mb-3" />
              <h2 className="font-display text-lg font-bold mb-1">Your Karaoke Audiobook</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Listen along with word-by-word highlighting — great for early readers.
                (Audio may take 1–2 extra minutes to finish recording.)
              </p>
              <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to={`/library/${orderId}`}>
                  <Volume2 className="h-5 w-5 mr-2" />
                  Listen Now
                </Link>
              </Button>
            </div>
          )}

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  A copy of your PDF was also emailed to{" "}
                  {customerEmail ? (
                    <span className="font-semibold text-foreground">{customerEmail}</span>
                  ) : (
                    "the email on your order"
                  )}
                  . Check your inbox (and spam folder).
                </p>
              </div>
            </div>
          </div>

          {/* Confirm PDF received */}
          {!confirmed ? (
            <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 mb-6 text-center">
              <ThumbsUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-display text-lg font-bold mb-1">Got your PDF?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                One tap lets us know your order arrived safely.
              </p>
              <Button
                onClick={() => handleConfirmReceived()}
                disabled={confirming}
                size="lg"
                className="w-full"
              >
                {confirming ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Yes, I got my storybook!
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 mb-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-semibold">Delivery confirmed — thank you!</p>
            </div>
          )}

          {/* 5-star rating */}
          <div className="mb-6">
            <RatingWidget
              orderId={orderId}
              customerEmail={customerEmail}
              onSubmitted={(stars, comment) => {
                // If they haven't confirmed yet, do it now with the rating attached.
                if (!confirmed) handleConfirmReceived({ stars, comment });
              }}
            />
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Generating / Waiting State ──
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <SEO
        title="Your Order — MESTAR"
        description="Your personalized MESTAR PDF storybook is being created right now. We'll email your download link as soon as it's ready — usually within minutes."
        noindex
      />
      <h1 className="sr-only">
        {childName ? `Creating ${childName}'s Storybook` : "Creating Your Storybook"}
      </h1>
      <div className="text-center max-w-md w-full">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-8">
          <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="font-display text-2xl font-bold mb-1">Order in progress!</h2>
          <p className="text-sm text-muted-foreground">
            {status === "pending_payment"
              ? "Payment received — we're just waiting on Stripe to confirm, then your story starts generating (usually a few seconds)."
              : "Payment confirmed! Your personalized PDF storybook is being created now."}
          </p>
        </div>

        <div className="mb-6">
          <Sparkles className="h-12 w-12 text-primary mx-auto animate-pulse" />
        </div>
        <h2 className="font-display text-lg font-semibold mb-1">
          {childName ? `Creating ${childName}'s Storybook` : "Creating Your Storybook"}
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          This usually takes 1–2 minutes after payment.
        </p>

        <div className="space-y-3 text-left">
          {PROGRESS_STAGES.slice(0, -1).map((stage, i) => (
            <div
              key={stage.status}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                i === activeStageIndex
                  ? "bg-primary/10 border border-primary/20"
                  : i < activeStageIndex
                  ? "opacity-60"
                  : "opacity-30"
              }`}
            >
              {i < activeStageIndex ? (
                <span className="text-lg">✅</span>
              ) : i === activeStageIndex ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <span className="text-lg">{stage.icon}</span>
              )}
              <span
                className={`text-sm font-medium ${
                  i === activeStageIndex ? "text-foreground" : ""
                }`}
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          You can safely close this tab — we'll email the PDF to you when it's ready.
        </p>
      </div>
    </div>
  );
};

export default OrderComplete;
