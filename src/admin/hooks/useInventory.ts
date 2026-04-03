import { useState, useEffect, useCallback } from 'react';
import type { FinishedGoodRecord, RawMaterialRecord, StockMovementRecord } from '@/types';
import { InventoryService } from '@/admin/services/InventoryService';

export function useFinishedGoods() {
  const [finishedGoods, setFinishedGoods] = useState<FinishedGoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setFinishedGoods(await InventoryService.getFinishedGoods()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { finishedGoods, loading, refresh: fetch };
}

export function useRawMaterials() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setRawMaterials(await InventoryService.getRawMaterials()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { rawMaterials, loading, refresh: fetch };
}

export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setMovements(await InventoryService.getStockMovements()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { movements, loading, refresh: fetch };
}
