import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Sparkles, Download, Mail } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background stars-bg relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-2xl w-full bg-card border-2 border-primary/30">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4 animate-float-up">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl font-display font-bold mb-2">Order Confirmed!</h1>
              <p className="text-lg text-muted-foreground">Thank you for your order. We are creating your magical storybook!</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-6 mb-8 text-left border border-primary/30">
              <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />What happens next?</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start"><Mail className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" /><span>You will receive an order confirmation email shortly</span></li>
                <li className="flex items-start"><Download className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" /><span>Your personalized PDF will be ready for instant download</span></li>
                <li className="flex items-start"><Sparkles className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" /><span>Start reading the magical story with your child tonight!</span></li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/"><Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display px-8 rounded-full shadow-lg shadow-primary/30 w-full sm:w-auto">Return to Home</Button></Link>
              <Link href="/create"><Button size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 font-display px-8 rounded-full w-full sm:w-auto"><Sparkles className="mr-2 w-4 h-4" />Create Another Story</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}