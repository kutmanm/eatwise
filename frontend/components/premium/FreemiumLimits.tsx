'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface FreemiumLimitsProps {
  type: 'meals' | 'history' | 'ai-chat';
  currentUsage: number;
  limit: number;
  onUpgrade?: () => void;
}

export function FreemiumLimits({ type, currentUsage, limit, onUpgrade }: FreemiumLimitsProps) {
  const router = useRouter();
  const percentage = (currentUsage / limit) * 100;
  const isAtLimit = currentUsage >= limit;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/premium');
    }
  };

  const getContent = () => {
    switch (type) {
      case 'meals':
        return {
          title: 'Daily Meal Limit',
          description: `${currentUsage}/${limit} meals logged today`,
          warningText: 'You\'ve reached your daily meal limit',
          upgradeText: 'Upgrade for unlimited meal logging',
          icon: '🍽️'
        };
      case 'history':
        return {
          title: 'History Access',
          description: 'Only last 7 days available',
          warningText: 'Viewing limited history',
          upgradeText: 'Upgrade for unlimited history access',
          icon: '📊'
        };
      case 'ai-chat':
        return {
          title: 'AI Coaching',
          description: 'Premium feature',
          warningText: 'AI coaching requires Premium',
          upgradeText: 'Upgrade for unlimited AI coaching',
          icon: '🤖'
        };
    }
  };

  const content = getContent();

  if (type === 'ai-chat') {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{content.icon}</span>
              <div>
                <h4 className="font-medium text-amber-800">{content.title}</h4>
                <p className="text-sm text-amber-700">{content.warningText}</p>
              </div>
            </div>
            <Button size="sm" onClick={handleUpgrade}>
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'history') {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{content.icon}</span>
              <div>
                <h4 className="font-medium text-blue-800">{content.title}</h4>
                <p className="text-sm text-blue-700">{content.description}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleUpgrade}>
              View All History
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Meals limit
  return (
    <Card className={`${isAtLimit ? 'border-red-200 bg-red-50' : percentage > 80 ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{content.icon}</span>
              <div>
                <h4 className={`font-medium ${isAtLimit ? 'text-red-800' : percentage > 80 ? 'text-amber-800' : 'text-green-800'}`}>
                  {content.title}
                </h4>
                <p className={`text-sm ${isAtLimit ? 'text-red-700' : percentage > 80 ? 'text-amber-700' : 'text-green-700'}`}>
                  {content.description}
                </p>
              </div>
            </div>
            {(isAtLimit || percentage > 80) && (
              <Button 
                size="sm" 
                variant={isAtLimit ? 'default' : 'outline'}
                onClick={handleUpgrade}
              >
                Upgrade
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  isAtLimit ? 'bg-red-500' : 
                  percentage > 80 ? 'bg-amber-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            {isAtLimit && (
              <p className="text-xs text-red-600 text-center">
                {content.upgradeText}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}