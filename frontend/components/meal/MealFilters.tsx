'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent } from '@/components/ui/Card';

export interface MealFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  minCalories: number | null;
  maxCalories: number | null;
  sortBy: 'date_desc' | 'date_asc' | 'calories_desc' | 'calories_asc';
}

interface MealFiltersProps {
  filters: MealFilters;
  onFiltersChange: (filters: MealFilters) => void;
  onReset: () => void;
}

export function MealFiltersComponent({ filters, onFiltersChange, onReset }: MealFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof MealFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.minCalories !== null ||
    filters.maxCalories !== null ||
    filters.sortBy !== 'date_desc';

  return (
    <Card>
      <CardContent className="p-4">
        {/* Search and Quick Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search meals</Label>
              <Input
                id="search"
                placeholder="Search by description..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <Label htmlFor="sortBy">Sort by</Label>
              <select
                id="sortBy"
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="form-input w-full"
              >
                <option value="date_desc">Newest first</option>
                <option value="date_asc">Oldest first</option>
                <option value="calories_desc">Highest calories</option>
                <option value="calories_asc">Lowest calories</option>
              </select>
            </div>
          </div>

          {/* Toggle Advanced Filters */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '← Less filters' : 'More filters →'}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
              >
                Reset all
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t border-neutral-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom">From date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">To date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minCalories">Min calories</Label>
                  <Input
                    id="minCalories"
                    type="number"
                    placeholder="0"
                    value={filters.minCalories || ''}
                    onChange={(e) => updateFilter('minCalories', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxCalories">Max calories</Label>
                  <Input
                    id="maxCalories"
                    type="number"
                    placeholder="3000"
                    value={filters.maxCalories || ''}
                    onChange={(e) => updateFilter('maxCalories', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>

              {/* Quick Date Filters */}
              <div>
                <Label>Quick date filters</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { label: 'Today', days: 0 },
                    { label: 'Yesterday', days: 1 },
                    { label: 'Last 7 days', days: 7 },
                    { label: 'Last 30 days', days: 30 },
                  ].map((quick) => (
                    <Button
                      key={quick.label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const date = new Date();
                        if (quick.days === 0) {
                          const today = date.toISOString().split('T')[0];
                          updateFilter('dateFrom', today);
                          updateFilter('dateTo', today);
                        } else if (quick.days === 1) {
                          date.setDate(date.getDate() - 1);
                          const yesterday = date.toISOString().split('T')[0];
                          updateFilter('dateFrom', yesterday);
                          updateFilter('dateTo', yesterday);
                        } else {
                          const fromDate = new Date();
                          fromDate.setDate(fromDate.getDate() - quick.days);
                          updateFilter('dateFrom', fromDate.toISOString().split('T')[0]);
                          updateFilter('dateTo', new Date().toISOString().split('T')[0]);
                        }
                      }}
                    >
                      {quick.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}