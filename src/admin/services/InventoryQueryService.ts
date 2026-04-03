import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';
import { InventoryService } from './InventoryService';

export class InventoryQueryService {
  static async getFinishedGoods() {
    if (env.IS_MOCK_MODE) return InventoryService.getFinishedGoods();
    const res = await apiClient.get<Awaited<ReturnType<typeof InventoryService.getFinishedGoods>>>('/inventory/finished-goods');
    return res.data;
  }

  static async getRawMaterials() {
    if (env.IS_MOCK_MODE) return InventoryService.getRawMaterials();
    const res = await apiClient.get<Awaited<ReturnType<typeof InventoryService.getRawMaterials>>>('/inventory/raw-materials');
    return res.data;
  }

  static async getMovements() {
    if (env.IS_MOCK_MODE) return InventoryService.getStockMovements();
    const res = await apiClient.get<Awaited<ReturnType<typeof InventoryService.getStockMovements>>>('/inventory/movements');
    return res.data;
  }
}
