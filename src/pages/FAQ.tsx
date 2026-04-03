import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "How does the personalization work?",
    a: "When you order, you'll provide your child's name, age, a photo, and choose a story theme. We use these details to create a one-of-a-kind story where your child is the hero!",
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
    a: "Each Star Stories set includes a personalized digital PDF storybook plus 5 bonus coloring pages featuring scenes from the adventure. Everything is delivered as an instant download!",
  },
  {
    q: "How do I receive my story?",
    a: "Star Stories are delivered as an instant digital download. After purchase, you'll receive your personalized PDF storybook and coloring pages that you can print at home or read on any device.",
  },
  {
    q: "What is the Supporting Character add-on?",
    a: "For a small additional charge, you can upload a second photo to include a friend, sibling, or pet as a supporting character in your child's story. It's a great way to make the adventure even more special!",
  },
  {
    q: "Can I order stories for multiple children?",
    a: "Yes! You can order separate personalized stories for each child. Each story will be uniquely crafted with their name, photo, and chosen theme.",
  },
  {
    q: "What if I need to make changes after ordering?",
    a: "Please reach out to us as soon as possible after placing your order. We'll do our best to accommodate any changes before your story is generated.",
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
