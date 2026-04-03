import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Palette, Download, ArrowLeft, Sparkles } from "lucide-react";
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

const GENERATION_STEPS = [
  { label: "Reading your personalization details...", icon: "✨" },
  { label: "Crafting your unique story...", icon: "📖" },
  { label: "Creating coloring page designs...", icon: "🎨" },
  { label: "Finalizing your storybook...", icon: "🌟" },
];

const OrderComplete = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [storyResult, setStoryResult] = useState<StoryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Get personalization data from localStorage (saved before checkout)
    const savedData = localStorage.getItem("mestar-pending-story");
    if (!savedData) {
      setError("No personalization data found. Please go back and create your story.");
      return;
    }

    const personalization = JSON.parse(savedData) as Personalization & { strength?: string; supportingCharacterName?: string };
    generateStory(personalization);
  }, []);

  // Animate through steps
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const generateStory = async (personalization: Personalization & { strength?: string; supportingCharacterName?: string }) => {
    setIsGenerating(true);
    setCurrentStep(0);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-story", {
        body: {
          childName: personalization.childName,
          childAge: personalization.childAge,
          theme: personalization.theme,
          strength: personalization.strength || "",
          hasSupportingCharacter: !!personalization.supportingCharacterPhotoUrl,
          supportingCharacterName: personalization.supportingCharacterName || "",
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Story generation failed");
      }

      if (data?.error && !data?.success) {
        throw new Error(data.error);
      }

      setStoryResult(data as StoryResult);
      setCurrentStep(GENERATION_STEPS.length - 1);

      // Clear pending data
      localStorage.removeItem("mestar-pending-story");
      toast.success("Your story is ready! ⭐", { position: "top-center" });
    } catch (err) {
      console.error("Story generation failed:", err);
      setError(err instanceof Error ? err.message : "Something went wrong generating your story.");
      toast.error("Story generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

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

  if (!storyResult) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="mb-8">
            <Sparkles className="h-16 w-16 text-primary mx-auto animate-pulse" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Creating Your Story</h2>
          <p className="text-muted-foreground mb-8">This usually takes about 30 seconds...</p>

          <div className="space-y-4 text-left">
            {GENERATION_STEPS.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                  i === currentStep
                    ? "bg-primary/10 border border-primary/20"
                    : i < currentStep
                    ? "opacity-50"
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
                <span className={`text-sm font-medium ${i === currentStep ? "text-foreground" : ""}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-3xl">
        <div className="text-center mb-10">
          <p className="text-5xl mb-4">🎉</p>
          <h1 className="font-display text-3xl font-bold mb-2">Your Story is Ready!</h1>
          <p className="text-muted-foreground">Here's a preview of your personalized storybook</p>
        </div>

        {/* Story Title */}
        <div className="bg-card rounded-2xl border border-border p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="font-display text-2xl font-bold">{storyResult.title}</h2>
          </div>
          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
            {storyResult.story}
          </div>
        </div>

        {/* Coloring Page Prompts Preview */}
        {storyResult.coloringPrompts?.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="h-6 w-6 text-primary" />
              <h3 className="font-display text-xl font-bold">5 Bonus Coloring Pages</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your coloring pages are designed to match each scene of the story!
            </p>
            <div className="grid grid-cols-5 gap-2">
              {storyResult.scenes.map((scene, i) => (
                <div key={i} className="aspect-[8.5/11] bg-secondary/30 rounded-lg flex items-center justify-center p-2 border border-border">
                  <p className="text-[10px] text-muted-foreground text-center leading-tight">
                    Page {i + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6">
          <p className="text-sm text-center text-muted-foreground">
            📧 Your full PDF storybook with illustrations and coloring pages will be delivered to your email shortly.
            Thank you for creating something magical!
          </p>
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
