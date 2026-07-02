import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { GoogleTagManager } from '@/components/GoogleTagManager';
import { MetaPixel } from '@/components/MetaPixel';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata = {
  title: 'MESTAR - Personalized Children\'s Storybooks',
  description: 'Create magical personalized storybooks where your child is the star. Upload their photo and watch them become the hero of their own adventure.',
  keywords: ['personalized storybook', 'children book', 'custom story', 'kids gift', 'personalized gift'],
  openGraph: {
    title: 'MESTAR - Make Your Child the Star',
    description: 'Create magical personalized storybooks where your child is the star of their own adventure.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <GoogleTagManager />
        <GoogleAnalytics />
        <MetaPixel />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
