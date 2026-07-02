import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <Sparkles className="w-20 h-20 text-primary mx-auto animate-pulse" />
        </div>
        <h1 className="text-6xl font-display font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          Oops! It looks like this page wandered off on its own adventure. 
          Let&apos;s get you back to creating magical stories!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-display w-full sm:w-auto">
              <Sparkles className="mr-2 w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/create">
            <Button variant="outline" className="font-display w-full sm:w-auto">
              Create a Story
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
