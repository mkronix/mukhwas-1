import { useState, useEffect, useCallback } from 'react';
import type { StoreSettings, CommerceRules, NotificationEvent, POSSettingsData, PaymentModeConfig } from '@/types';
import { SettingsService } from '@/admin/services/SettingsService';

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setSettings(await SettingsService.getStoreSettings()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { settings, loading, refresh: fetch };
}

export function useCommerceRules() {
  const [rules, setRules] = useState<CommerceRules | null>(null);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setRules(await SettingsService.getCommerceRules()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { rules, loading, refresh: fetch };
}

export function useNotificationEvents() {
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setEvents(await SettingsService.getNotificationEvents()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { events, loading, refresh: fetch };
}

export function usePOSSettings() {
  const [settings, setSettings] = useState<POSSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setSettings(await SettingsService.getPOSSettings()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { settings, loading, refresh: fetch };
}

export function usePaymentModes() {
  const [modes, setModes] = useState<PaymentModeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    try { setModes(await SettingsService.getPaymentModes()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { modes, loading, refresh: fetch };
}
