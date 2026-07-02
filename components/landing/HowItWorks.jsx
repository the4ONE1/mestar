'use client';

import { Upload, Edit3, BookOpen, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      number: '1',
      title: 'Upload Photos',
      description: 'Add your child\'s photos to personalize their storybook',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Edit3,
      number: '2',
      title: 'Customize Details',
      description: 'Choose name, gender, and pick from magical story themes',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      icon: BookOpen,
      number: '3',
      title: 'Preview & Order',
      description: 'Review your personalized book and complete your order',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: CheckCircle,
      number: '4',
      title: 'Receive Magic',
      description: 'Get your professionally printed storybook delivered',
      color: 'bg-green-100 text-green-600',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Creating your personalized storybook is easy and takes just minutes
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className={`w-20 h-20 rounded-full ${step.color} flex items-center justify-center mx-auto`}>
                      <Icon className="w-10 h-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {step.number}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-pink-300 -ml-4">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-pink-300 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}