import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Sparkles } from "lucide-react";
import { fetchProducts } from "@/lib/shopify";

const faqs = [
  {
    q: "What do I get with my order?",
    a: "You'll receive a personalized digital PDF storybook where your child is the hero, plus 5 bonus coloring pages featuring scenes from their adventure — all as an instant download you can print at home or read on any device.",
  },
  {
    q: "How does the personalization work?",
    a: "Simply upload a clear photo of your child, enter their name, select boy or girl, choose their age group, and pick a story theme. Our AI creates a one-of-a-kind story and coloring pages tailored just for them!",
  },
  {
    q: "Is the content safe and age-appropriate?",
    a: "Absolutely! Every story is non-violent and age-appropriate. Your child is always the hero and problem-solver, learning positive values through fun adventures. Stories are carefully crafted for ages 1–11+.",
  },
];

const FAQ = () => {
  const [firstHandle, setFirstHandle] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts(1).then((products) => {
      if (products.length > 0) setFirstHandle(products[0].node.handle);
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen py-16">
      <div className="container max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Got Questions?</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about My <span className="text-star-yellow">Star</span> Stories ⭐
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card rounded-xl border border-border px-6 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="font-display text-left font-semibold hover:no-underline hover:text-primary py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Ready to get started?</p>
          {firstHandle ? (
            <Link
              to={`/product/${firstHandle}`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="h-4 w-4" />
              Create Your Story Now ⭐
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="h-4 w-4" />
              Create Your Story Now ⭐
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
