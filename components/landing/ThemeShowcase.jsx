'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Rocket, Crown, Heart, Star, Castle } from 'lucide-react';

export function ThemeShowcase() {
  const themes = [
    { id: 'space', title: 'Space Adventure', description: 'Explore galaxies and discover new planets', icon: Rocket, color: 'from-blue-500 to-purple-600', bgColor: 'bg-blue-50' },
    { id: 'princess', title: 'Royal Princess', description: 'Rule a magical kingdom with grace', icon: Crown, color: 'from-pink-500 to-purple-500', bgColor: 'bg-pink-50' },
    { id: 'superhero', title: 'Superhero Mission', description: 'Save the day with special powers', icon: Star, color: 'from-red-500 to-yellow-500', bgColor: 'bg-red-50' },
    { id: 'fairy', title: 'Fairy Tale Magic', description: 'Cast spells in an enchanted forest', icon: Sparkles, color: 'from-green-400 to-emerald-500', bgColor: 'bg-green-50' },
    { id: 'animal', title: 'Animal Friends', description: 'Go on adventures with talking animals', icon: Heart, color: 'from-orange-400 to-pink-500', bgColor: 'bg-orange-50' },
    { id: 'castle', title: 'Medieval Quest', description: 'Embark on a noble knight\'s journey', icon: Castle, color: 'from-gray-600 to-blue-700', bgColor: 'bg-gray-50' },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Choose Your Story Theme</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Every story is uniquely tailored to your child's interests and imagination</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const Icon = theme.icon;
            return (
              <Card key={theme.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-300">
                <CardContent className="p-6">
                  <div className={`w-full h-32 rounded-lg bg-gradient-to-br ${theme.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{theme.title}</h3>
                  <p className="text-gray-600">{theme.description}</p>
                  <div className="mt-4 flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Choose this theme</span>
                    <Sparkles className="ml-2 w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}