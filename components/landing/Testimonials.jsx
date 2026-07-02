'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Image from 'next/image';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'New York, NY',
      rating: 5,
      text: 'My daughter absolutely loves her personalized storybook! She asks us to read it every night. The quality is amazing and it arrived so quickly.',
      avatar: '\ud83d\udc69',
    },
    {
      name: 'Michael Chen',
      location: 'San Francisco, CA',
      rating: 5,
      text: 'This is the perfect gift! I ordered one for my nephew\'s birthday and he was thrilled to see himself as the hero. The customization options are fantastic.',
      avatar: '\ud83d\udc68',
    },
    {
      name: 'Emily Rodriguez',
      location: 'Austin, TX',
      rating: 5,
      text: 'The attention to detail is incredible. My son\'s name appears throughout the story naturally, and the illustrations are beautiful. Worth every penny!',
      avatar: '\ud83d\udc69',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Parents Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of happy families who have created magical memories
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-700 italic">\"{testimonial.text}\"</p>
                
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}