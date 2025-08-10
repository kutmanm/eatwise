'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { dietPreferencesSchema, type DietPreferencesFormData } from '@/types';

interface DietPreferencesFormProps {
  initialData?: DietPreferencesFormData;
  onSubmit: (data: DietPreferencesFormData) => Promise<void>;
  loading?: boolean;
}

export function DietPreferencesForm({ initialData, onSubmit, loading = false }: DietPreferencesFormProps) {
  const [customAllergy, setCustomAllergy] = useState('');
  const [customDislike, setCustomDislike] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DietPreferencesFormData>({
    resolver: zodResolver(dietPreferencesSchema),
    defaultValues: initialData || {
      dietary_restrictions: [],
      allergies: [],
      disliked_foods: [],
      cuisine_preferences: [],
      // optional fields below may be part of a future schema; omit to satisfy current types
    },
  });

  const watchedValues = watch();

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'pescatarian', label: 'Pescatarian' },
    { value: 'keto', label: 'Ketogenic' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'low_carb', label: 'Low Carb' },
    { value: 'gluten_free', label: 'Gluten Free' },
    { value: 'dairy_free', label: 'Dairy Free' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' },
  ];

  const cuisineOptions = [
    { value: 'italian', label: 'Italian' },
    { value: 'asian', label: 'Asian' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'indian', label: 'Indian' },
    { value: 'american', label: 'American' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'middle_eastern', label: 'Middle Eastern' },
    { value: 'french', label: 'French' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'thai', label: 'Thai' },
  ];

  const commonAllergies = [
    'Nuts', 'Shellfish', 'Eggs', 'Milk', 'Soy', 'Wheat', 'Fish', 'Sesame'
  ];

  const commonDislikes = [
    'Mushrooms', 'Onions', 'Tomatoes', 'Cheese', 'Spicy Food', 'Fish', 'Meat', 'Vegetables'
  ];

  const handleCheckboxChange = (field: keyof DietPreferencesFormData, value: string) => {
    const currentValues = watchedValues[field] as string[] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(field, newValues);
  };

  const addCustomItem = (field: 'allergies' | 'disliked_foods', customValue: string, setter: (value: string) => void) => {
    if (customValue.trim()) {
      const currentValues = watchedValues[field] as string[] || [];
      setValue(field, [...currentValues, customValue.trim()]);
      setter('');
    }
  };

  const removeItem = (field: 'allergies' | 'disliked_foods', item: string) => {
    const currentValues = watchedValues[field] as string[] || [];
    setValue(field, currentValues.filter(v => v !== item));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diet Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dietary Restrictions */}
          <div>
            <Label>Dietary Restrictions</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {dietaryOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchedValues.dietary_restrictions?.includes(option.value) || false}
                    onChange={() => handleCheckboxChange('dietary_restrictions', option.value)}
                    className="rounded border-gray-300 text-[#00b800] focus:ring-[#00b800]"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <Label>Food Allergies</Label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {commonAllergies.map((allergy) => (
                  <label key={allergy} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={watchedValues.allergies?.includes(allergy) || false}
                      onChange={() => handleCheckboxChange('allergies', allergy)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm">{allergy}</span>
                  </label>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Add custom allergy"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem('allergies', customAllergy, setCustomAllergy))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addCustomItem('allergies', customAllergy, setCustomAllergy)}
                >
                  Add
                </Button>
              </div>

              {watchedValues.allergies && watchedValues.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedValues.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => removeItem('allergies', allergy)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Food Dislikes */}
          <div>
            <Label>Food Dislikes</Label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {commonDislikes.map((dislike) => (
                  <label key={dislike} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={watchedValues.disliked_foods?.includes(dislike) || false}
                      onChange={() => handleCheckboxChange('disliked_foods', dislike)}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm">{dislike}</span>
                  </label>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Add custom dislike"
                  value={customDislike}
                  onChange={(e) => setCustomDislike(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem('disliked_foods', customDislike, setCustomDislike))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addCustomItem('disliked_foods', customDislike, setCustomDislike)}
                >
                  Add
                </Button>
              </div>

              {watchedValues.disliked_foods && watchedValues.disliked_foods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedValues.disliked_foods.map((dislike) => (
                    <span
                      key={dislike}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"
                    >
                      {dislike}
                      <button
                        type="button"
                        onClick={() => removeItem('disliked_foods', dislike)}
                        className="ml-1 hover:text-yellow-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cuisine Preferences */}
          <div>
            <Label>Favorite Cuisines</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {cuisineOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchedValues.cuisine_preferences?.includes(option.value) || false}
                    onChange={() => handleCheckboxChange('cuisine_preferences', option.value)}
                    className="rounded border-gray-300 text-[#00b800] focus:ring-[#00b800]"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cooking & Budget Preferences (omitted; not in current schema) */}

          <Button type="submit" loading={loading} className="w-full">
            Save Diet Preferences
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}