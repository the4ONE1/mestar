import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copy, Check, Link as LinkIcon } from "lucide-react";

const AD_LINKS = [
  {
    label: "Homepage / Hero Demo",
    url: "https://mestar.pro/",
    description: "Best for brand and top-of-funnel ads.",
  },
  {
    label: "Personalized Storybook",
    url: "https://mestar.pro/products/personalized-storybook",
    description: "Primary product landing page.",
  },
  {
    label: "Bonus Coloring Book Add-On",
    url: "https://mestar.pro/products/coloring-pages",
    description: "Upsell / add-on page.",
  },
  {
    label: "Supporting Character Add-On",
    url: "https://mestar.pro/products/supporting-character",
    description: "Upsell / add-on page.",
  },
  {
    label: "Reviews / Social Proof",
    url: "https://mestar.pro/reviews",
    description: "Trust-building for retargeting.",
  },
  {
    label: "Why Read Together",
    url: "https://mestar.pro/why-read-together",
    description: "Educational / value-focused ads.",
  },
];

const AdLinks = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <Helmet>
        <title>Google Ads Links — MESTAR</title>
        <meta
          name="description"
          content="Quick copy links for MESTAR Google Ads campaigns."
        />
        <link rel="canonical" href="https://mestar.pro/ad-links" />
      </Helmet>

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Google Ads Links
        </h1>
        <p className="text-muted-foreground">
          Click the copy button next to any link to paste it into your Google Ads campaign.
        </p>
      </div>

      <div className="space-y-4">
        {AD_LINKS.map((link) => {
          const isCopied = copiedId === link.url;
          return (
            <Card key={link.url}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{link.label}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant={isCopied ? "default" : "outline"}
                    onClick={() => copy(link.url, link.url)}
                    aria-label={`Copy ${link.label} URL`}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {isCopied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-md px-3 py-2 break-all">
                  <LinkIcon className="h-4 w-4 shrink-0" />
                  <span>{link.url}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdLinks;
