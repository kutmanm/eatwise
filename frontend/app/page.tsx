'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-bold text-neutral-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Track your nutrition</span>{' '}
                  <span className="block text-primary-600 xl:inline">with AI</span>
                </h1>
                <p className="mt-3 text-base text-neutral-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  EatWise uses AI to analyze your meals, provide personalized coaching, and help you reach your health goals with smart nutrition tracking.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/auth/signup">
                      <Button size="lg" className="w-full sm:w-auto">
                        Get started free
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="/auth/login">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        Sign in
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        
        {/* Hero Image/Illustration Placeholder */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-br from-primary-400 to-secondary-400 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">🍎</div>
              <p className="text-xl font-semibold">AI-Powered Nutrition</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Everything you need to track your nutrition
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  📸
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-neutral-900">Photo Analysis</p>
                <p className="mt-2 ml-16 text-base text-neutral-500">
                  Snap a photo of your meal and get instant nutrition analysis powered by AI.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  🤖
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-neutral-900">AI Coaching</p>
                <p className="mt-2 ml-16 text-base text-neutral-500">
                  Get personalized nutrition advice and meal suggestions from our AI coach.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  📊
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-neutral-900">Progress Tracking</p>
                <p className="mt-2 ml-16 text-base text-neutral-500">
                  Visualize your nutrition journey with detailed charts and progress reports.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  🎯
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-neutral-900">Goal Setting</p>
                <p className="mt-2 ml-16 text-base text-neutral-500">
                  Set personalized nutrition goals based on your lifestyle and objectives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            <span className="block">Ready to start your journey?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Join thousands of users who have transformed their nutrition habits with EatWise.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="mt-8">
              Start tracking today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}