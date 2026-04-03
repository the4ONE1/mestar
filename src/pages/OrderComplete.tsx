import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Download, ArrowLeft, Sparkles, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";
import type { Personalization } from "@/stores/cartStore";

interface StoryResult {
  success: boolean;
  title: string;
  story: string;
  scenes: string[];
  coloringPrompts: string[];
  error?: string;
}

interface StorybookResult {
  success: boolean;
  pdfUrl: string;
  orderId: string;
  imagesGenerated: number;
}

const GENERATION_STEPS = [
  { label: "Reading your personalization details...", icon: "✨", key: "reading" },
  { label: "Crafting your unique story...", icon: "📖", key: "story" },
  { label: "Creating coloring page illustrations...", icon: "🎨", key: "images" },
  { label: "Assembling your PDF storybook...", icon: "📄", key: "pdf" },
  { label: "Preparing your download...", icon: "🌟", key: "finalizing" },
];

const OrderComplete = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [storyTitle, setStoryTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("mestar-pending-story");
    if (!savedData) {
      setError("No personalization data found. Please go back and create your story.");
      return;
    }

    const personalization = JSON.parse(savedData) as Personalization & {
      strength?: string;
      supportingCharacterName?: string;
      customerEmail?: string;
    };
    runFullPipeline(personalization);
  }, []);

  const runFullPipeline = async (
    personalization: Personalization & {
      strength?: string;
      supportingCharacterName?: string;
      customerEmail?: string;
    }
  ) => {
    setIsGenerating(true);
    setCurrentStep(0);

    try {
      // Step 1: Generate story text + coloring prompts
      setCurrentStep(1);
      const { data: storyData, error: storyError } = await supabase.functions.invoke(
        "generate-story",
        {
          body: {
            childName: personalization.childName,
            childAge: personalization.childAge,
            theme: personalization.theme,
            strength: personalization.strength || "",
            hasSupportingCharacter: !!personalization.supportingCharacterPhotoUrl,
            supportingCharacterName: personalization.supportingCharacterName || "",
          },
        }
      );

      if (storyError) throw new Error(storyError.message || "Story generation failed");
      if (storyData?.error && !storyData?.success) throw new Error(storyData.error);

      const story = storyData as StoryResult;
      setStoryTitle(story.title);

      // Step 2: Generate images + assemble PDF
      setCurrentStep(2);

      const { data: pdfData, error: pdfError } = await supabase.functions.invoke(
        "create-storybook",
        {
          body: {
            title: story.title,
            story: story.story,
            coloringPrompts: story.coloringPrompts,
            customerEmail: personalization.customerEmail || "",
            childName: personalization.childName,
            childAge: personalization.childAge,
            theme: personalization.theme,
            strength: personalization.strength || "",
            hasSupportingCharacter: !!personalization.supportingCharacterPhotoUrl,
            supportingCharacterName: personalization.supportingCharacterName || "",
          },
        }
      );

      if (pdfError) throw new Error(pdfError.message || "PDF generation failed");
      if (pdfData?.error && !pdfData?.success) throw new Error(pdfData.error);

      setCurrentStep(4);
      setPdfUrl((pdfData as StorybookResult).pdfUrl);

      localStorage.removeItem("mestar-pending-story");
      toast.success("Your storybook PDF is ready! 🎉", { position: "top-center" });
    } catch (err) {
      console.error("Pipeline failed:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      toast.error("Storybook generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Animate step progress during long waits
  useEffect(() => {
    if (!isGenerating || currentStep >= 4) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev === 1) return 1; // Wait on story until it finishes
        if (prev === 2) return 3; // Move to assembling after images
        return prev;
      });
    }, 12000);
    return () => clearInterval(interval);
  }, [isGenerating, currentStep]);

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-4xl mb-4">😔</p>
          <h2 className="font-display text-2xl font-bold mb-4">Oops!</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  // ── Generating State ──
  if (!pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          {/* Order Confirmed Banner */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-8">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
            <h2 className="font-display text-2xl font-bold mb-1">Order Confirmed!</h2>
            <p className="text-sm text-muted-foreground">
              Your personalized PDF storybook is being created now.
            </p>
          </div>

          <div className="mb-6">
            <Sparkles className="h-12 w-12 text-primary mx-auto animate-pulse" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-1">Creating Your Storybook</h3>
          <p className="text-sm text-muted-foreground mb-8">
            This usually takes 1–2 minutes...
          </p>

          <div className="space-y-3 text-left">
            {GENERATION_STEPS.map((step, i) => (
              <div
                key={step.key}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                  i === currentStep
                    ? "bg-primary/10 border border-primary/20"
                    : i < currentStep
                    ? "opacity-60"
                    : "opacity-30"
                }`}
              >
                {i < currentStep ? (
                  <span className="text-lg">✅</span>
                ) : i === currentStep ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <span className="text-lg">{step.icon}</span>
                )}
                <span
                  className={`text-sm font-medium ${
                    i === currentStep ? "text-foreground" : ""
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Complete State ──
  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-lg">
        <div className="text-center mb-8">
          <p className="text-5xl mb-4">🎉</p>
          <h1 className="font-display text-3xl font-bold mb-2">Your Storybook is Ready!</h1>
          {storyTitle && (
            <p className="text-lg text-muted-foreground font-medium">"{storyTitle}"</p>
          )}
        </div>

        {/* Download Card */}
        <div className="bg-card rounded-2xl border border-border p-8 mb-6 text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold mb-2">Your PDF Storybook</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Includes your personalized story + 5 bonus coloring pages
          </p>
          <Button asChild size="lg" className="w-full">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download>
              <Download className="h-5 w-5 mr-2" />
              Download Your PDF
            </a>
          </Button>
        </div>

        {/* Email Notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              A copy of your PDF storybook will also be emailed to you shortly.
              Check your inbox (and spam folder) within the next few minutes.
            </p>
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
};

export default OrderComplete;
