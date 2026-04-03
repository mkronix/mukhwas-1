import { useState, useEffect, useCallback } from 'react';
import type { RecipeRecord } from '@/types';
import { RecipeService } from '@/admin/services/RecipeService';

export function useRecipes() {
  const [recipes, setRecipes] = useState<RecipeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setRecipes(await RecipeService.getRecipes()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { recipes, loading, refresh: fetch };
}
