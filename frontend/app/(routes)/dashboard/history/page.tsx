'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingCheck } from '@/components/onboarding/OnboardingCheck';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MealCard } from '@/components/meal/MealCard';
import { MealDetailModal } from '@/components/meal/MealDetailModal';
import { MealFiltersComponent, type MealFilters } from '@/components/meal/MealFilters';
import { NutritionEditor } from '@/components/meal/NutritionEditor';
import { useMeals } from '@/hooks/useMeals';
import { mealsApi } from '@/lib/api';
import type { Meal, MealFormData } from '@/types';

function MealHistoryContent() {
  const router = useRouter();
  const { meals, loading, mutate } = useMeals();
  
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState<MealFilters>({
    search: '',
    dateFrom: '',
    dateTo: '',
    minCalories: null,
    maxCalories: null,
    sortBy: 'date_desc',
  });

  // Filter and sort meals
  const filteredMeals = useMemo(() => {
    if (!meals) return [];

    let filtered = meals.filter((meal: Meal) => {
      // Search filter
      if (filters.search && !meal.description?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Date filters
      const mealDate = new Date(meal.logged_at).toISOString().split('T')[0];
      if (filters.dateFrom && mealDate < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && mealDate > filters.dateTo) {
        return false;
      }

      // Calorie filters
      if (filters.minCalories && (meal.calories || 0) < filters.minCalories) {
        return false;
      }
      if (filters.maxCalories && (meal.calories || 0) > filters.maxCalories) {
        return false;
      }

      return true;
    });

    // Sort meals
    filtered.sort((a: Meal, b: Meal) => {
      switch (filters.sortBy) {
        case 'date_asc':
          return new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime();
        case 'date_desc':
          return new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime();
        case 'calories_asc':
          return (a.calories || 0) - (b.calories || 0);
        case 'calories_desc':
          return (b.calories || 0) - (a.calories || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [meals, filters]);

  const handleViewDetails = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setIsEditModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleDelete = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      const response = await mealsApi.deleteMeal(Number(mealId));
      if (response.error) {
        setError(response.error);
      } else {
        mutate(); // Refresh meals list
      }
    } catch (err) {
      setError('Failed to delete meal');
    }
  };

  const handleUpdateMeal = async (data: MealFormData) => {
    if (!editingMeal) return;

    setUpdating(true);
    setError('');

    try {
      const response = await mealsApi.updateMeal(editingMeal.id, data);
      if (response.error) {
        setError(response.error);
      } else {
        setIsEditModalOpen(false);
        setEditingMeal(null);
        mutate(); // Refresh meals list
      }
    } catch (err) {
      setError('Failed to update meal');
    } finally {
      setUpdating(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      minCalories: null,
      maxCalories: null,
      sortBy: 'date_desc',
    });
  };

  const totalCalories = filteredMeals.reduce((sum: number, meal: Meal) => sum + (meal.calories || 0), 0);
  const totalMeals = filteredMeals.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-6 rounded-md bg-error/10 p-4">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#00b800]">{totalMeals}</div>
              <div className="text-sm text-neutral-600">Meals found</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(totalCalories)}</div>
              <div className="text-sm text-neutral-600">Total calories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0}
              </div>
              <div className="text-sm text-neutral-600">Avg per meal</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {meals ? Math.round(meals.length / 7) : 0}
              </div>
              <div className="text-sm text-neutral-600">Meals/week</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <MealFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Meals List */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00b800]" />
            </div>
          ) : filteredMeals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-neutral-400 text-4xl mb-4">🍽️</div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  {meals?.length === 0 ? 'No meals logged yet' : 'No meals match your filters'}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {meals?.length === 0 
                    ? 'Start logging your meals to see them here'
                    : 'Try adjusting your search or filters'
                  }
                </p>
                <Button onClick={() => router.push('/dashboard/add-meal')}>
                  Log your first meal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeals.map((meal: Meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>

        {/* Load More (if needed for pagination) */}
        {filteredMeals.length >= 20 && (
          <div className="mt-8 text-center">
            <Button variant="outline">
              Load more meals
            </Button>
          </div>
        )}

      {/* Modals */}
      <MealDetailModal
        meal={selectedMeal}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedMeal(null);
        }}
        onEdit={handleEdit}
      />
      {/* Edit Modal */}
      {isEditModalOpen && editingMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <Card className="border-0 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Edit Meal</CardTitle>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingMeal(null);
                  }}
                >
                  ✕
                </Button>
              </CardHeader>
              <CardContent>
                <NutritionEditor
                  initialData={{
                    description: editingMeal!.description || '',
                    calories: editingMeal!.calories || 0,
                    protein: editingMeal!.protein || 0,
                    carbs: editingMeal!.carbs || 0,
                    fat: editingMeal!.fat || 0,
                    fiber: editingMeal!.fiber || 0,
                    water: editingMeal!.water || 0,
                  }}
                  onSave={handleUpdateMeal}
                  onCancel={() => {
                    setIsEditModalOpen(false);
                    setEditingMeal(null);
                  }}
                  loading={updating}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MealHistoryPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <OnboardingCheck>
          <MealHistoryContent />
        </OnboardingCheck>
      </ProtectedRoute>
    </AuthProvider>
  );
}