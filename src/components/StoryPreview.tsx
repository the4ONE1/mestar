import { useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import samplePage1 from "/images/sample-page-1.jpg";
import samplePage2 from "/images/sample-page-2.jpg";
import samplePage3 from "/images/sample-page-3.jpg";
import samplePage4 from "/images/sample-page-4.jpg";

const pages = [
  { src: samplePage1, alt: "Sample storybook page - Leo notices the stars have vanished", pageNum: 1 },
  { src: samplePage2, alt: "Sample storybook page - Leo enters the Whispering Woods", pageNum: 2 },
  { src: samplePage3, alt: "Sample storybook page - Leo meets Oliver the Owl", pageNum: 3 },
  { src: samplePage4, alt: "Sample storybook page - Cliffhanger! What happens next?", pageNum: 4 },
];

interface StoryPreviewProps {
  productHandle?: string;
}

const StoryPreview = ({ productHandle }: StoryPreviewProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const isLastPage = currentPage === pages.length - 1;

  const goNext = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };

  const goPrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">Sneak Peek</span>
          </div>
          <h2 className="font-display text-3xl font-bold mb-3">See How the Adventure Begins…</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every story starts with a problem only your child can solve. Here's a sample — flip through to see how the adventure unfolds!
          </p>
        </div>

        {/* Page flip carousel */}
        <div className="max-w-md mx-auto relative">
          <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-border bg-card shadow-xl">
            {/* Page image */}
            <img
              src={pages[currentPage].src}
              alt={pages[currentPage].alt}
              className="w-full h-full object-cover transition-opacity duration-500"
              loading="lazy"
              width={1024}
              height={1024}
            />

            {/* Lock overlay on last page */}
            {isLastPage && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center">
                <Lock className="h-12 w-12 text-primary" />
                <h3 className="font-display text-2xl font-bold">How does it end?</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Only your child can solve the mystery! Create their one of a kind custom story to discover the ending.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-display rounded-full px-8 py-6 shadow-lg shadow-primary/30 hover:scale-105 transition-all"
                >
                  <Link to={productHandle ? `/product/${productHandle}` : "#products"}>
                    Create Their Story ⭐
                  </Link>
                </Button>
              </div>
            )}

            {/* Page number */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-muted-foreground">
              Page {pages[currentPage].pageNum} of {pages.length}
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={goPrev}
            disabled={currentPage === 0}
            aria-label="Previous page"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 text-foreground disabled:opacity-30 hover:bg-card transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            disabled={isLastPage}
            aria-label="Next page"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 text-foreground disabled:opacity-30 hover:bg-card transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                aria-label={`Go to page ${i + 1}`}
                aria-current={i === currentPage ? "true" : undefined}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentPage ? "bg-primary w-6" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-6 max-w-sm mx-auto">
          ✨ This is a sample story. Your child's one of a kind custom storybook will feature their name, photo, and a unique adventure created just for them!
        </p>
      </div>
    </section>
  );
};

export default StoryPreview;
