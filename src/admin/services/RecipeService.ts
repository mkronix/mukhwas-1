import { mockRecipes } from '@/admin/mock/recipes';
import type { RecipeRecord } from '@/types';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class RecipeService {
  static async getRecipes(): Promise<RecipeRecord[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockRecipes]; }
    const res = await apiClient.get<RecipeRecord[]>('/recipes');
    return res.data;
  }

  static async getRecipe(id: string): Promise<RecipeRecord | null> {
    if (env.IS_MOCK_MODE) { await delay(); return mockRecipes.find(r => r.id === id) ?? null; }
    const res = await apiClient.get<RecipeRecord>(`/recipes/${id}`);
    return res.data;
  }

  static async createRecipe(data: Omit<RecipeRecord, 'id' | 'version' | 'versions' | 'updated_at'>): Promise<RecipeRecord> {
    if (env.IS_MOCK_MODE) { await delay(); const recipe: RecipeRecord = { ...data, id: `rec_${Date.now()}`, version: 1, versions: [], updated_at: new Date().toISOString() }; mockRecipes.push(recipe); return recipe; }
    const res = await apiClient.post<RecipeRecord>('/recipes', data);
    return res.data;
  }

  static async updateRecipe(id: string, data: Partial<RecipeRecord>): Promise<RecipeRecord> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const idx = mockRecipes.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Recipe not found');
      const current = mockRecipes[idx];
      current.versions.push({ version: current.version, changed_at: current.updated_at, changed_by: current.created_by, diff_summary: 'Updated recipe ingredients', ingredients: [...current.ingredients] });
      mockRecipes[idx] = { ...current, ...data, version: current.version + 1, updated_at: new Date().toISOString() };
      return mockRecipes[idx];
    }
    const res = await apiClient.put<RecipeRecord>(`/recipes/${id}`, data);
    return res.data;
  }

  static async activateRecipe(id: string): Promise<RecipeRecord> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const recipe = mockRecipes.find(r => r.id === id);
      if (!recipe) throw new Error('Recipe not found');
      mockRecipes.filter(r => r.variant_id === recipe.variant_id && r.id !== id).forEach(r => { r.status = 'inactive'; });
      recipe.status = 'active';
      return recipe;
    }
    const res = await apiClient.patch<RecipeRecord>(`/recipes/${id}/activate`);
    return res.data;
  }

  static async duplicateRecipe(id: string): Promise<RecipeRecord> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const source = mockRecipes.find(r => r.id === id);
      if (!source) throw new Error('Recipe not found');
      const dup: RecipeRecord = { ...source, id: `rec_${Date.now()}`, name: `${source.name} (Copy)`, version: 1, status: 'inactive', versions: [], updated_at: new Date().toISOString(), ingredients: source.ingredients.map(ing => ({ ...ing, id: `ri_${Date.now()}_${Math.random()}` })) };
      mockRecipes.push(dup);
      return dup;
    }
    const res = await apiClient.post<RecipeRecord>(`/recipes/${id}/duplicate`);
    return res.data;
  }

  static async archiveRecipe(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) { await delay(); const recipe = mockRecipes.find(r => r.id === id); if (recipe) recipe.status = 'inactive'; return; }
    await apiClient.patch(`/recipes/${id}/archive`);
  }
}
