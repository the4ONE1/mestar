import { Star, Heart, BookOpen, Sparkles, Download } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen py-16">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Our Story</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold mb-4">
            About <span className="text-primary">My Star Stories</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Where every child becomes the hero of their own adventure.
          </p>
        </div>

        {/* Story */}
        <div className="space-y-8">
          <div className="bg-card rounded-2xl p-8 border border-border">
            <BookOpen className="h-8 w-8 text-primary mb-4" />
            <h2 className="font-display text-2xl font-bold mb-4">Why We Created My Star Stories</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every child deserves to see themselves as the hero. My Star Stories was born from a simple idea: 
              what if bedtime wasn't just about winding down, but about building confidence, sparking imagination, 
              and showing kids that they can overcome any challenge?
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our personalized digital storybooks place your child at the center of a magical adventure. 
              Each story is carefully crafted to be age-appropriate, non-violent, and empowering — 
              portraying your little one as the brave problem-solver who saves the day.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Star, title: "Personalized", desc: "Your child's name & photo creates the story" },
              { icon: Sparkles, title: "Empowering", desc: "your child is the problem solving star" },
              { icon: Heart, title: "Age-Appropriate", desc: "Non-violent, positive one of a kind stories for all ages" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-2xl p-6 border border-border text-center">
                <Icon className="h-6 w-6 text-primary mx-auto mb-3" />
                <h3 className="font-display font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-2xl p-8 border border-border">
            <Download className="h-8 w-8 text-primary mb-4" />
            <h2 className="font-display text-2xl font-bold mb-4">Instant Digital Download</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Each My Star Stories set includes a personalized PDF storybook 
              plus 5 bonus coloring pages featuring scenes from the adventure. Download instantly 
              after purchase and start reading tonight! ✨
            </p>
            <p className="text-xs text-muted-foreground/60 italic">Paperback books coming soon!</p>
            <p className="text-muted-foreground leading-relaxed">
              We believe that reading together creates lifelong memories. With My Star Stories, 
              bedtime becomes the most magical part of the day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
