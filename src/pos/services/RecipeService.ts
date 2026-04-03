import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class RecipeService {
  static async getRecipes() {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get('/pos/recipes');
    return res.data;
  }

  static async getRecipe(id: string) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.get(`/pos/recipes/${id}`);
    return res.data;
  }

  static async createRecipe(data: Record<string, unknown>) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post('/pos/recipes', data);
    return res.data;
  }

  static async updateRecipe(id: string, data: Record<string, unknown>) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.put(`/pos/recipes/${id}`, data);
    return res.data;
  }
}
