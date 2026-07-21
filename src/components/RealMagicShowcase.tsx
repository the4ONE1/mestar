import { ArrowRight, Sparkles, Camera, Wand2 } from "lucide-react";
import izzyReal from "@/assets/izzy-real.jpg.asset.json";
import izzyStory from "@/assets/izzy-storybook.jpg";
import jaedanFishing from "@/assets/jaedan-fishing.jpg.asset.json";
import jaedanFishingStory from "@/assets/jaedan-fishing-story.jpg";
import jaedanCowboy from "@/assets/jaedan-cowboy.jpg.asset.json";
import jaedanCowboyStory from "@/assets/jaedan-cowboy-story.jpg";

type Example = {
  name: string;
  realPhoto: string;
  characterImage: string;
  caption: string;
  themeLabel: string;
};

const EXAMPLES: Example[] = [
  {
    name: "Izzy",
    realPhoto: izzyReal.url,
    characterImage: izzyStory,
    caption: "Same bow. Same big eyes. Same little hero.",
    themeLabel: "Fairy Tale",
  },
  {
    name: "Jaedan",
    realPhoto: jaedanFishing.url,
    characterImage: jaedanFishingStory,
    caption: "His real fishing day — reimagined as a pirate captain's adventure.",
    themeLabel: "Ocean Adventure & Pirates",
  },
  {
    name: "Jaedan",
    realPhoto: jaedanCowboy.url,
    characterImage: jaedanCowboyStory,
    caption: "One photo becomes a young prince he actually recognizes.",
    themeLabel: "Prince & Princess",
  },
];

const RealMagicShowcase = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-card/40">
      <div className="container">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-4">
            <Wand2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">
              Real Kids, Real Magic
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            One Photo. One Hero. One Unforgettable Story.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            These are real MESTAR kids. Upload one photo — we turn your child into
            the hero of their own storybook, keeping the face, features and little
            details that make them <em>them</em>.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {EXAMPLES.map((ex, i) => (
            <figure
              key={i}
              className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-lg hover:shadow-xl hover:border-primary/50 transition-all"
            >
              <div className="grid grid-cols-2 gap-0.5 bg-border">
                <div className="relative bg-background">
                  <img
                    src={ex.realPhoto}
                    alt={`${ex.name} — real photo uploaded by parent`}
                    className="w-full h-48 sm:h-56 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/85 backdrop-blur-sm border border-border rounded-full px-2 py-0.5">
                    <Camera className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Real Photo
                    </span>
                  </div>
                </div>
                <div className="relative bg-background">
                  <img
                    src={ex.characterImage}
                    alt={`${ex.name} illustrated as a storybook hero`}
                    className="w-full h-48 sm:h-56 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary/90 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <Sparkles className="h-3 w-3 text-primary-foreground" />
                    <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
                      Story Hero
                    </span>
                  </div>
                </div>
              </div>
              <figcaption className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-display font-bold text-foreground">
                    {ex.name}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2 py-0.5">
                    {ex.themeLabel}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-snug">
                  {ex.caption}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground">
          <ArrowRight className="h-4 w-4 text-primary" />
          <span>
            Upload → Preview in seconds → Full 20+ page storybook delivered to your inbox.
          </span>
        </div>
      </div>
    </section>
  );
};

export default RealMagicShowcase;
