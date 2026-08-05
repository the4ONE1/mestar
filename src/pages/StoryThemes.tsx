import { Link } from "react-router-dom";
import { Sparkles, Wand2, Anchor, Crown, Rocket, Footprints } from "lucide-react";
import SEO from "@/components/SEO";

const THEMES = [
  {
    name: "Fairy Tale",
    icon: Wand2,
    ages: "Ages 1–11+",
    blurb:
      "Whispering woods, missing stars and gentle magic. Your child follows clues, makes a kind choice and puts the magic back where it belongs.",
    learns: "Courage, kindness and problem solving",
  },
  {
    name: "Ocean Adventure & Pirates",
    icon: Anchor,
    ages: "Ages 3–11+",
    blurb:
      "Salt air, secret maps and a friendly crew. Your child captains the story, reads the map and finds the treasure the honest way.",
    learns: "Teamwork, fairness and persistence",
  },
  {
    name: "Prince & Princess",
    icon: Crown,
    ages: "Ages 1–8",
    blurb:
      "Castles, royal invitations and a kingdom with a small problem only your child can solve — no rescuing required, they lead.",
    learns: "Leadership, empathy and generosity",
  },
  {
    name: "Outer Space",
    icon: Rocket,
    ages: "Ages 3–11+",
    blurb:
      "Rockets, moons and a wobbly satellite. Your child suits up, follows the plan and brings the mission home safely.",
    learns: "Curiosity, focus and staying calm",
  },
  {
    name: "Dinosaurs",
    icon: Footprints,
    ages: "Ages 1–8",
    blurb:
      "Jungle trails, giant footprints and one lost baby dinosaur. Your child tracks it down and reunites the herd before sunset.",
    learns: "Care for others, patience and bravery",
  },
];

const StoryThemes = () => {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Personalized Story Themes",
      itemListElement: THEMES.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        description: t.blurb,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://mestar.pro/" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Story Themes",
          item: "https://mestar.pro/story-themes",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen py-16">
      <SEO
        title="Story Themes for Personalized Kids Books | My Star Stories"
        description="Pick from 5 personalized story themes — fairy tale, ocean pirates, prince & princess, outer space and dinosaurs. Your child is the hero in every one."
        canonical="/story-themes"
        jsonLd={jsonLd}
      />

      <div className="container max-w-4xl">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">5 Themes to Choose From</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold mb-4">
            Personalized <span className="text-primary">Story Themes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every theme is written fresh for your child — their name, their face, their adventure.
            Non-violent, age-appropriate, and they always solve the problem themselves. ⭐
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          {THEMES.map(({ name, icon: Icon, ages, blurb, learns }) => (
            <article
              key={name}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold leading-tight">{name}</h2>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {ages}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{blurb}</p>
              <p className="text-xs">
                <span className="font-bold uppercase tracking-wider text-muted-foreground">
                  They learn:
                </span>{" "}
                <span className="text-foreground">{learns}</span>
              </p>
            </article>
          ))}
        </div>

        <section className="mt-14 text-center">
          <h2 className="font-display text-2xl font-bold mb-3">What's Included With Every Theme</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            A full personalized PDF storybook with illustrations of your child, plus coloring pages
            drawn from the scenes in their own story. Instant download — print at home or read on any
            device.
          </p>
          <Link
            to="/products/personalized-storybook"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity"
          >
            <Sparkles className="h-4 w-4" />
            Create Their Story ⭐
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            New here?{" "}
            <Link to="/how-it-works" className="underline hover:text-foreground">
              See how it works
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default StoryThemes;
