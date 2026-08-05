import { Link } from "react-router-dom";
import { Camera, Wand2, Sparkles, Download, Star, Clock, ShieldCheck } from "lucide-react";
import SEO from "@/components/SEO";
import { BASE_PRICE, SUPPORTING_CHARACTER_PRICE } from "@/lib/products";

const STEPS = [
  {
    icon: Camera,
    title: "Upload your child's photo",
    text: "One clear photo is all we need. It's used only to create their storybook character — never shared.",
  },
  {
    icon: Wand2,
    title: "Pick their name, age and theme",
    text: "Choose the age group and the adventure they'd love most — space, fairy tale, dinosaurs, cowboys, the ocean and more.",
  },
  {
    icon: Sparkles,
    title: "We write and illustrate their story",
    text: "Your child becomes the hero of an original, age-appropriate, non-violent story with matching illustrations on every page.",
  },
  {
    icon: Download,
    title: "Download the PDF instantly",
    text: "Your finished storybook arrives as a downloadable PDF — with coloring pages made from the scenes in their own story included.",
  },
];

const FAQS = [
  {
    q: "How long does it take?",
    a: "Most storybooks are ready within a few minutes of checkout. We also email you the download link, so you can open it on any device.",
  },
  {
    q: "What do I get?",
    a: `For $${BASE_PRICE.toFixed(2)} you get a personalized digital storybook PDF starring your child, illustrated throughout, plus coloring pages created from the scenes in their own story.`,
  },
  {
    q: "Is anything shipped to me?",
    a: "No. Every storybook is a digital PDF download — nothing is mailed, so there's no shipping cost and no waiting.",
  },
  {
    q: "Can I add a second character?",
    a: `Yes. For $${SUPPORTING_CHARACTER_PRICE.toFixed(2)} you can upload a second photo and give that character a name. They appear briefly in the story as a helper to your child.`,
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen py-16">
      <SEO
        title="How It Works — Personalized Storybooks in Minutes | MESTAR"
        description="Upload a photo, pick a theme, and get a personalized digital storybook PDF starring your child — with coloring pages included. Delivered in minutes, no shipping."
        canonical="/how-it-works"
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to create a personalized storybook starring your child",
            description:
              "Upload a photo, choose a name, age and theme, and download a personalized illustrated storybook PDF with coloring pages included.",
            totalTime: "PT5M",
            step: STEPS.map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: s.title,
              text: s.text,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />

      <div className="container max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">How It Works</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Your child's own storybook,{" "}
            <span className="text-primary">ready in minutes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Upload one photo, pick an adventure, and download a personalized
            illustrated storybook PDF — coloring pages from their own story included.
          </p>
        </div>

        {/* Steps */}
        <ol className="space-y-5 mb-14 list-none">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="bg-card rounded-xl border border-border p-6 flex gap-4 items-start"
            >
              <div className="relative bg-primary/10 rounded-lg p-3 shrink-0">
                <step.icon className="h-6 w-6 text-primary" />
                <span className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground mb-1">
                  {step.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Digital-only reassurance */}
        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {[
            { icon: Clock, title: "Minutes, not weeks", text: "Delivered as an instant download." },
            { icon: Download, title: "Digital PDF", text: "Nothing is mailed. No shipping fees." },
            { icon: ShieldCheck, title: "Photo stays private", text: "Used only to make their character." },
          ].map((item) => (
            <div key={item.title} className="bg-card border border-border rounded-xl p-5 text-center">
              <item.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="font-display font-bold text-sm mb-1">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Pricing / add-ons */}
        <div className="bg-card border border-primary/20 rounded-2xl p-8 mb-14 text-center">
          <Star className="h-8 w-8 text-primary fill-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">
            ${BASE_PRICE.toFixed(2)} — story, illustrations and coloring pages
          </h2>
          <p className="text-muted-foreground mb-4">
            Every storybook includes coloring pages made from the scenes in your
            child's own story — not generic pages.
          </p>
          <p className="text-sm text-muted-foreground">
            Optional at checkout: add a second character from a second photo for
            ${SUPPORTING_CHARACTER_PRICE.toFixed(2)}, or add a full bonus coloring book.
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-14">
          <h2 className="font-display text-2xl font-bold mb-6 text-center">
            Common questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display font-bold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/products/personalized-storybook"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity"
          >
            <Sparkles className="h-4 w-4" />
            Create Their Story
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
