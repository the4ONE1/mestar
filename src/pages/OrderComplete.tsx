import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Download, ArrowLeft, Sparkles, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";

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
  const pdfOpenedRef = useRef(false);

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

      const { data, error: rpcError } = await supabase.rpc("get_order_status", { _order_id: orderId });

      if (cancelled) return;

      if (rpcError) {
        console.error("Polling error:", rpcError);
      } else if (data && data.length > 0) {
        const row = data[0];
        setStatus(row.status);
        if (row.story_title) setStoryTitle(row.story_title);
        if (row.child_name) setChildName(row.child_name);

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
          setError(row.error_message || "Something went wrong creating your storybook. We've been notified — please contact support.");
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
            <h3 className="font-display text-xl font-bold mb-2">Your PDF Storybook</h3>
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
        description="Your personalized storybook is being created."
        noindex
      />
      <div className="text-center max-w-md w-full">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-8">
          <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="font-display text-2xl font-bold mb-1">Order in progress!</h2>
          <p className="text-sm text-muted-foreground">
            {status === "pending_payment"
              ? "Complete your purchase in the Shopify tab — we'll start creating your story the moment payment is confirmed."
              : "Payment confirmed! Your personalized PDF storybook is being created now."}
          </p>
        </div>

        <div className="mb-6">
          <Sparkles className="h-12 w-12 text-primary mx-auto animate-pulse" />
        </div>
        <h3 className="font-display text-lg font-semibold mb-1">
          {childName ? `Creating ${childName}'s Storybook` : "Creating Your Storybook"}
        </h3>
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
