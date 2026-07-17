import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Fairy Tale samples (existing)
import fairy1 from "/images/sample-page-1.jpg";
import fairy2 from "/images/sample-page-2.jpg";
import fairy3 from "/images/sample-page-3.jpg";
import fairy4 from "/images/sample-page-4.jpg";
// Ocean
import ocean1 from "/images/samples/ocean-1.jpg";
import ocean2 from "/images/samples/ocean-2.jpg";
import ocean3 from "/images/samples/ocean-3.jpg";
import ocean4 from "/images/samples/ocean-4.jpg";
// Prince & Princess
import prince1 from "/images/samples/prince-1.jpg";
import prince2 from "/images/samples/prince-2.jpg";
import prince3 from "/images/samples/prince-3.jpg";
import prince4 from "/images/samples/prince-4.jpg";
// Space
import space1 from "/images/samples/space-1.jpg";
import space2 from "/images/samples/space-2.jpg";
import space3 from "/images/samples/space-3.jpg";
import space4 from "/images/samples/space-4.jpg";
// Dinosaurs
import dino1 from "/images/samples/dino-1.jpg";
import dino2 from "/images/samples/dino-2.jpg";
import dino3 from "/images/samples/dino-3.jpg";
import dino4 from "/images/samples/dino-4.jpg";

type SamplePage = { src: string; alt: string; pageNum: number };

const THEME_SAMPLES: Record<string, SamplePage[]> = {
  "Fairy Tale": [
    { src: fairy1, alt: "Fairy Tale sample - the stars have vanished", pageNum: 1 },
    { src: fairy2, alt: "Fairy Tale sample - entering the Whispering Woods", pageNum: 2 },
    { src: fairy3, alt: "Fairy Tale sample - meeting Oliver the Owl", pageNum: 3 },
    { src: fairy4, alt: "Fairy Tale sample - cliffhanger ending", pageNum: 4 },
  ],
  "Ocean Adventure & Pirates": [
    { src: ocean1, alt: "Ocean sample - the treasure map is missing pieces", pageNum: 1 },
    { src: ocean2, alt: "Ocean sample - sailing the pirate ship", pageNum: 2 },
    { src: ocean3, alt: "Ocean sample - meeting a friendly octopus", pageNum: 3 },
    { src: ocean4, alt: "Ocean sample - cliffhanger whirlpool", pageNum: 4 },
  ],
  "Prince & Princess": [
    { src: prince1, alt: "Prince sample - the crown's jewel is missing", pageNum: 1 },
    { src: prince2, alt: "Prince sample - walking the castle halls", pageNum: 2 },
    { src: prince3, alt: "Prince sample - meeting the wise royal advisor", pageNum: 3 },
    { src: prince4, alt: "Prince sample - cliffhanger hidden door", pageNum: 4 },
  ],
  "Outer Space": [
    { src: space1, alt: "Space sample - a star has gone dark", pageNum: 1 },
    { src: space2, alt: "Space sample - flying the rocket ship", pageNum: 2 },
    { src: space3, alt: "Space sample - meeting a friendly alien", pageNum: 3 },
    { src: space4, alt: "Space sample - cliffhanger swirling nebula", pageNum: 4 },
  ],
  Dinosaurs: [
    { src: dino1, alt: "Dinosaur sample - the empty nest", pageNum: 1 },
    { src: dino2, alt: "Dinosaur sample - exploring the jungle", pageNum: 2 },
    { src: dino3, alt: "Dinosaur sample - meeting the baby T-Rex", pageNum: 3 },
    { src: dino4, alt: "Dinosaur sample - cliffhanger hidden valley", pageNum: 4 },
  ],
};

const THEME_ORDER = [
  "Fairy Tale",
  "Ocean Adventure & Pirates",
  "Prince & Princess",
  "Outer Space",
  "Dinosaurs",
];

interface StoryPreviewProps {
  productHandle?: string;
  /** If provided, hides the theme selector and locks the preview to this theme. */
  theme?: string;
  /** Hide the section wrapper (padding + heading) for embedded use. */
  embedded?: boolean;
}

const StoryPreview = ({ productHandle, theme, embedded = false }: StoryPreviewProps) => {
  const [activeTheme, setActiveTheme] = useState<string>(
    theme && THEME_SAMPLES[theme] ? theme : "Fairy Tale"
  );
  const [currentPage, setCurrentPage] = useState(0);

  // Sync when parent-controlled theme changes
  useEffect(() => {
    if (theme && THEME_SAMPLES[theme]) {
      setActiveTheme(theme);
      setCurrentPage(0);
    }
  }, [theme]);

  const pages = THEME_SAMPLES[activeTheme] ?? THEME_SAMPLES["Fairy Tale"];
  const isLastPage = currentPage === pages.length - 1;
  const isControlled = !!theme;

  const goNext = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };
  const goPrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleThemeClick = (t: string) => {
    setActiveTheme(t);
    setCurrentPage(0);
  };

  const Wrapper: React.ElementType = embedded ? "div" : "section";

  return (
    <Wrapper className={embedded ? "" : "py-16"}>
      <div className={embedded ? "" : "container"}>
        {!embedded && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Sneak Peek</span>
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">See How the Adventure Begins…</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Every story starts with a problem only your child can solve. Pick a theme below to see a real sample — flip through to see how the adventure unfolds!
            </p>
          </div>
        )}

        {/* Theme pill selector — only when uncontrolled */}
        {!isControlled && (
          <div className="max-w-2xl mx-auto mb-6 flex flex-wrap justify-center gap-2">
            {THEME_ORDER.map(t => (
              <button
                key={t}
                onClick={() => handleThemeClick(t)}
                aria-pressed={t === activeTheme}
                className={`text-xs sm:text-sm font-bold rounded-full px-3 py-1.5 border transition-all ${
                  t === activeTheme
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-card text-foreground border-border hover:border-primary/60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Page flip carousel */}
        <div className="max-w-md mx-auto relative">
          <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-border bg-card shadow-xl">
            <img
              key={`${activeTheme}-${currentPage}`}
              src={pages[currentPage].src}
              alt={pages[currentPage].alt}
              className="w-full h-full object-cover transition-opacity duration-500"
              loading="lazy"
              width={1024}
              height={1024}
            />

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
                  <Link to={productHandle ? `/product/${productHandle}#personalize` : "#products"}>
                    Create Their Story ⭐
                  </Link>
                </Button>
              </div>
            )}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-muted-foreground">
              {activeTheme} · Page {pages[currentPage].pageNum} of {pages.length}
            </div>
          </div>

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

        {!embedded && (
          <p className="text-center text-xs text-muted-foreground mt-6 max-w-sm mx-auto">
            ✨ These are sample stories. Your child's one of a kind custom storybook will feature their name, photo, and a unique adventure created just for them!
          </p>
        )}
      </div>
    </Wrapper>
  );
};

export default StoryPreview;
