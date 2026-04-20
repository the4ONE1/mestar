import { Star, Sparkles, Download } from "lucide-react";

type Mood = {
  letter: "A" | "B" | "C";
  name: string;
  vibe: string;
  bg: string; // hsl
  card: string;
  border: string;
  primary: string; // gold-ish
  primaryFg: string;
  cream: string;
  muted: string;
  accent?: string;
  accentLabel?: string;
};

const moods: Mood[] = [
  {
    letter: "A",
    name: "Magical Bedtime / Dreamy",
    vibe: "Cozy, nighttime, storybook",
    bg: "hsl(220 30% 6%)",
    card: "hsl(220 25% 12%)",
    border: "hsl(220 25% 22%)",
    primary: "hsl(43 90% 55%)",
    primaryFg: "hsl(220 30% 6%)",
    cream: "hsl(45 80% 95%)",
    muted: "hsl(45 30% 80%)",
    accent: "hsl(260 60% 70%)",
    accentLabel: "Soft Lavender",
  },
  {
    letter: "B",
    name: "Warm & Playful",
    vibe: "Friendlier, daytime-friendly, kid-energy",
    bg: "hsl(200 35% 8%)",
    card: "hsl(200 30% 14%)",
    border: "hsl(200 25% 24%)",
    primary: "hsl(40 90% 60%)",
    primaryFg: "hsl(200 35% 8%)",
    cream: "hsl(40 70% 94%)",
    muted: "hsl(30 35% 82%)",
    accent: "hsl(10 75% 65%)",
    accentLabel: "Coral Pink",
  },
  {
    letter: "C",
    name: "Premium & Calm",
    vibe: "High-end gift, Apple-like calm",
    bg: "hsl(220 20% 10%)",
    card: "hsl(220 18% 16%)",
    border: "hsl(220 15% 28%)",
    primary: "hsl(40 60% 70%)",
    primaryFg: "hsl(220 20% 10%)",
    cream: "hsl(40 30% 96%)",
    muted: "hsl(220 10% 75%)",
  },
];

const MiniMockup = ({ mood, headingStyle }: { mood: Mood; headingStyle: 1 | 2 }) => {
  const heading =
    headingStyle === 1 ? (
      <h3
        className="font-display font-extrabold text-3xl leading-tight"
        style={{ color: mood.primary }}
      >
        Your Child Is the Star
      </h3>
    ) : (
      <h3
        className="font-display font-extrabold text-3xl leading-tight"
        style={{ color: mood.cream }}
      >
        Your Child Is the <span style={{ color: mood.primary }}>Star</span>
      </h3>
    );

  return (
    <div
      className="rounded-2xl overflow-hidden border p-6 space-y-5"
      style={{ background: mood.bg, borderColor: mood.border }}
    >
      {/* Badge */}
      <div
        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold"
        style={{
          background: (mood.accent ?? mood.primary) + "33",
          color: mood.accent ?? mood.primary,
          border: `1px solid ${(mood.accent ?? mood.primary)}55`,
        }}
      >
        <Sparkles className="h-3 w-3" />
        Personalized Bedtime Magic
      </div>

      {/* Heading */}
      {heading}

      {/* Body text */}
      <p className="text-sm leading-relaxed" style={{ color: mood.muted }}>
        A one-of-a-kind digital storybook where your little one is the hero.
        Instantly download and start the magic tonight.
      </p>

      {/* CTA */}
      <button
        className="font-display font-bold rounded-full px-6 py-3 text-sm shadow-lg"
        style={{
          background: mood.primary,
          color: mood.primaryFg,
          boxShadow: `0 8px 24px -8px ${mood.primary}`,
        }}
      >
        Start Your Magical Journey ⭐
      </button>

      {/* Stars */}
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4"
            style={{ color: mood.primary, fill: mood.primary }}
          />
        ))}
        <span className="ml-2 text-xs" style={{ color: mood.muted }}>
          Loved by 2,000+ families
        </span>
      </div>

      {/* Mini product card */}
      <div
        className="rounded-xl border p-4 flex gap-3 items-center"
        style={{ background: mood.card, borderColor: mood.border }}
      >
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: (mood.accent ?? mood.primary) + "22" }}
        >
          <Download className="h-6 w-6" style={{ color: mood.primary }} />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-display font-bold text-base leading-tight"
            style={{ color: mood.cream }}
          >
            The Brave Little Explorer
          </div>
          <div className="text-xs mt-0.5" style={{ color: mood.muted }}>
            Personalized digital storybook
          </div>
        </div>
        <div
          className="font-bold text-lg shrink-0"
          style={{ color: mood.primary }}
        >
          $19
        </div>
      </div>
    </div>
  );
};

// Option C palette (the picked mood) — used as backdrop for brand-name samples
const optionC = moods.find((m) => m.letter === "C")!;
const brightYellow = "hsl(50 100% 60%)";

type BrandTreatment = {
  id: number;
  label: string;
  description: string;
  render: () => JSX.Element;
};

const brandTreatments: BrandTreatment[] = [
  {
    id: 1,
    label: "Bright yellow solid",
    description: "Pure bright yellow, bold — maximum pop",
    render: () => (
      <span
        className="font-display font-extrabold text-2xl"
        style={{ color: optionC.cream }}
      >
        My{" "}
        <span style={{ color: brightYellow }}>Star</span>{" "}
        Stories
      </span>
    ),
  },
  {
    id: 2,
    label: "Champagne gold (matches site)",
    description: "Soft gold — blends with the rest of the design system",
    render: () => (
      <span
        className="font-display font-extrabold text-2xl"
        style={{ color: optionC.cream }}
      >
        My{" "}
        <span style={{ color: optionC.primary }}>Star</span>{" "}
        Stories
      </span>
    ),
  },
  {
    id: 3,
    label: "Bright yellow + tiny ⭐",
    description: "Yellow word plus a small star emoji after it",
    render: () => (
      <span
        className="font-display font-extrabold text-2xl"
        style={{ color: optionC.cream }}
      >
        My{" "}
        <span style={{ color: brightYellow }}>Star</span>
        <span className="text-base align-super ml-0.5">⭐</span>{" "}
        Stories
      </span>
    ),
  },
  {
    id: 4,
    label: "Bright yellow italic display",
    description: "Yellow, italicized, slightly larger — more personality",
    render: () => (
      <span
        className="font-display font-extrabold text-2xl"
        style={{ color: optionC.cream }}
      >
        My{" "}
        <span
          className="italic text-3xl"
          style={{ color: brightYellow }}
        >
          Star
        </span>{" "}
        Stories
      </span>
    ),
  },
];

const StylePreview = () => {
  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-extrabold mb-3">
            Style Preview
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pick a brand-name treatment AND a mood/heading combo. Tell me e.g.
            "Brand option 1, heading 2". Nothing on the live site has changed.
          </p>
        </div>

        {/* Brand-name treatments */}
        <section className="mb-16">
          <div className="mb-4">
            <h2 className="font-display text-2xl font-bold">
              Brand name — how should "Star" look in "My Star Stories"?
            </h2>
            <p className="text-sm text-muted-foreground">
              The brand name stays as text (not ⭐). Pick how the word "Star"
              should be styled. Shown on Option C background.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {brandTreatments.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border p-6 flex flex-col gap-3"
                style={{
                  background: optionC.bg,
                  borderColor: optionC.border,
                }}
              >
                <div className="text-xs uppercase tracking-wider font-bold" style={{ color: optionC.muted }}>
                  Brand option {t.id} — {t.label}
                </div>
                <div className="py-4 flex items-center justify-center min-h-[80px]">
                  {t.render()}
                </div>
                <div className="text-xs text-center" style={{ color: optionC.muted }}>
                  {t.description}
                </div>
                <button
                  className="text-xs font-bold rounded-full px-4 py-2 mt-1 mx-auto"
                  style={{
                    background: optionC.primary,
                    color: optionC.primaryFg,
                  }}
                  onClick={() =>
                    alert(`Tell me in chat: "Brand option ${t.id}"`)
                  }
                >
                  Pick Brand Option {t.id}
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-12">
          {moods.map((mood) => (
            <section key={mood.letter}>
              <div className="mb-4">
                <h2 className="font-display text-2xl font-bold">
                  Option {mood.letter} — {mood.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mood.vibe}
                  {mood.accentLabel && ` • Accent: ${mood.accentLabel}`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">
                    Heading style 1 — Solid gold bold
                  </div>
                  <MiniMockup mood={mood} headingStyle={1} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">
                    Heading style 2 — Cream + gold accent word
                  </div>
                  <MiniMockup mood={mood} headingStyle={2} />
                </div>
              </div>

              <div className="mt-4 text-center">
                <button
                  className="text-sm font-bold rounded-full px-5 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() =>
                    alert(
                      `Tell me in chat: "Option ${mood.letter} with heading 1" or "Option ${mood.letter} with heading 2"`
                    )
                  }
                >
                  Pick Option {mood.letter}
                </button>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 text-center text-xs text-muted-foreground">
          This page is hidden — only reachable at /style-preview. It will be
          deleted once you pick a combo.
        </div>
      </div>
    </div>
  );
};

export default StylePreview;
