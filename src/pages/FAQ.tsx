import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "How does the personalization work?",
    a: "When you order, you'll provide your child's name during checkout. We weave their name throughout the story, making them the hero of their very own adventure!",
  },
  {
    q: "What age group are the stories designed for?",
    a: "Our stories are crafted for children ages 2-10. The language and themes are age-appropriate, with simple narratives for younger readers and more detailed adventures for older kids.",
  },
  {
    q: "Are the stories appropriate for all children?",
    a: "Absolutely! All Star Stories are non-violent and age-appropriate. Every story portrays the child as a brave hero and problem-solver, teaching positive values through fun adventures.",
  },
  {
    q: "What's included in my order?",
    a: "Each Star Stories set includes a personalized bedtime storybook plus 5 bonus coloring pages featuring scenes from the adventure. Everything is delivered digitally so you can start the magic right away!",
  },
  {
    q: "How is the product delivered?",
    a: "Star Stories are delivered digitally. After purchase, you'll receive your personalized storybook and coloring pages that you can print at home or read on any device.",
  },
  {
    q: "Can I order stories for multiple children?",
    a: "Yes! You can order separate personalized stories for each child. Each story will be uniquely crafted with their name and details.",
  },
  {
    q: "What if I need to make changes after ordering?",
    a: "Please reach out to us as soon as possible after placing your order. We'll do our best to accommodate any name changes or corrections before your story is finalized.",
  },
  {
    q: "Do you offer gift options?",
    a: "Star Stories make wonderful gifts! The personalized nature of each book makes it a truly unique and thoughtful present for any child. Simply order with the recipient child's name.",
  },
];

const FAQ = () => {
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
            Everything you need to know about Star Stories ⭐
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
      </div>
    </div>
  );
};

export default FAQ;
