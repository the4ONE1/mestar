import { Shield, Camera, CreditCard, Users, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="container py-16 max-w-3xl">
      <div className="text-center mb-12">
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="font-display text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Your family's privacy matters to us. Here's exactly how we handle your information.
        </p>
      </div>

      <div className="space-y-10">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">What We Collect</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            To create your child's personalized story, we collect:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>Child's first name and age group</li>
            <li>Gender selection (boy/girl)</li>
            <li>Uploaded photo(s)</li>
            <li>Story preferences (theme, strength, supporting character)</li>
            <li>Email address (for order delivery)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Photo Policy</h2>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-5">
            <p className="text-foreground font-medium leading-relaxed">
              All uploaded photos are used <strong>exclusively</strong> for generating your child's 
              personalized story and coloring pages. Photos are <strong>permanently deleted 
              after 30 days</strong>. We never share, sell, or use photos for any other purpose.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Payment Information</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            All payments are processed securely through Shopify's checkout system. 
            My Star Stories <strong>never sees or stores</strong> your credit card details, 
            billing address, or any financial information. Shopify handles all payment 
            security with industry-standard encryption.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">No Data Sharing</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            We do <strong>not</strong> sell, share, or distribute any personal data to third parties. 
            Your information is used solely to create and deliver your child's personalized storybook.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Contact Us</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Questions about your privacy? Reach out to us anytime at{" "}
            <a href="mailto:notify@mystarstories.com" className="text-primary hover:underline">
              notify@mystarstories.com
            </a>
          </p>
        </section>

        <p className="text-xs text-muted-foreground/60 text-center pt-6 border-t border-border">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
