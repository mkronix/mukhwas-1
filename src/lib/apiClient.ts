import env from '@/config/env';
import { toast } from '@/hooks/use-toast';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  message?: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

function buildQuery(params?: PaginationParams): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

const MAX_RETRIES = 2;
const RETRY_STATUS_CODES = new Set([502, 503, 504]);
const RETRY_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class ApiClient {
  private baseUrl: string;
  private tokenKey: string;
  private useSession: boolean;
  private refreshing: Promise<boolean> | null = null;

  constructor(baseUrl: string, tokenKey: string, useSession = false) {
    this.baseUrl = baseUrl;
    this.tokenKey = tokenKey;
    this.useSession = useSession;
  }

  private getStorage(): Storage {
    return this.useSession ? sessionStorage : localStorage;
  }

  /** When using admin API client from the /pos app shell, read POS session tokens. */
  private resolveAuthSlot(): { storage: Storage; key: string } {
    if (
      this.tokenKey === "adm_auth" &&
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/pos")
    ) {
      return { storage: sessionStorage, key: "pos_auth" };
    }
    return { storage: this.getStorage(), key: this.tokenKey };
  }

  private getAuthData(): { token?: string; refresh_token?: string } {
    const { storage, key } = this.resolveAuthSlot();
    const stored = storage.getItem(key);
    if (!stored) return {};
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }

  private setAuthData(data: Record<string, unknown>): void {
    const { storage, key } = this.resolveAuthSlot();
    const existingRaw = storage.getItem(key);
    let existing: Record<string, unknown> = {};
    if (existingRaw) {
      try {
        existing = JSON.parse(existingRaw) as Record<string, unknown>;
      } catch {
        existing = {};
      }
    }
    storage.setItem(key, JSON.stringify({ ...existing, ...data }));
  }

  private clearAuth(): void {
    const { storage, key } = this.resolveAuthSlot();
    storage.removeItem(key);
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const { token } = this.getAuthData();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private getSurface(): string {
    if (
      this.tokenKey === "adm_auth" &&
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/pos")
    ) {
      return "pos";
    }
    if (this.tokenKey === "adm_auth") return "admin";
    if (this.tokenKey === "pos_auth") return "pos";
    return "storefront";
  }

  private async attemptRefresh(): Promise<boolean> {
    const { refresh_token } = this.getAuthData();
    if (!refresh_token) return false;

    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token, surface: this.getSurface() }),
      });

      if (!res.ok) {
        this.clearAuth();
        return false;
      }

      const body = await res.json();
      if (body.success && body.data) {
        this.setAuthData({
          token: body.data.access_token,
          refresh_token: body.data.refresh_token,
        });
        return true;
      }

      this.clearAuth();
      return false;
    } catch {
      this.clearAuth();
      return false;
    }
  }

  private async refreshToken(): Promise<boolean> {
    if (this.refreshing) return this.refreshing;
    this.refreshing = this.attemptRefresh().finally(() => {
      this.refreshing = null;
    });
    return this.refreshing;
  }

  private async fetchWithInterceptors(url: string, init: RequestInit): Promise<Response> {
    let lastResponse: Response | undefined;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        await delay(RETRY_DELAY_MS * attempt);
      }

      const headers = { ...this.getHeaders() };
      if (init.body && !(init.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      lastResponse = await fetch(url, { ...init, headers });

      if (lastResponse.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          const retryHeaders = { ...this.getHeaders() };
          if (init.body && !(init.body instanceof FormData)) {
            retryHeaders['Content-Type'] = 'application/json';
          }
          lastResponse = await fetch(url, { ...init, headers: retryHeaders });
          if (lastResponse.status !== 401) return lastResponse;
        }

        this.clearAuth();
        toast({
          title: 'Session expired',
          description: 'Please log in again.',
          variant: 'destructive',
        });
        return lastResponse;
      }

      if (RETRY_STATUS_CODES.has(lastResponse.status) && attempt < MAX_RETRIES) {
        continue;
      }

      return lastResponse;
    }

    return lastResponse!;
  }

  private async handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: { message: `Request failed: ${res.status}` } }));
      const errorMessage = body?.error?.message || body?.message || `Request failed: ${res.status}`;

      if (res.status !== 401) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }

      throw new Error(errorMessage);
    }
    return res.json();
  }

  async get<T>(path: string, params?: PaginationParams): Promise<ApiResponse<T>> {
    const res = await this.fetchWithInterceptors(
      `${this.baseUrl}${path}${buildQuery(params)}`,
      { method: 'GET' }
    );
    return this.handleResponse<T>(res);
  }

  async getPaginated<T>(path: string, params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const res = await this.fetchWithInterceptors(
      `${this.baseUrl}${path}${buildQuery(params)}`,
      { method: 'GET' }
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: { message: `Request failed: ${res.status}` } }));
      const errorMessage = body?.error?.message || body?.message || `Request failed: ${res.status}`;
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      throw new Error(errorMessage);
    }
    return res.json();
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const res = await this.fetchWithInterceptors(`${this.baseUrl}${path}`, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(res);
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const res = await this.fetchWithInterceptors(`${this.baseUrl}${path}`, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(res);
  }

  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const res = await this.fetchWithInterceptors(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(res);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    const res = await this.fetchWithInterceptors(`${this.baseUrl}${path}`, {
      method: 'DELETE',
    });
    return this.handleResponse<T>(res);
  }
}

export const adminApiClient = new ApiClient(env.API_BASE_URL, 'adm_auth');
export const storefrontApiClient = new ApiClient(env.API_BASE_URL, 'sf_auth');
export const posApiClient = new ApiClient(env.API_BASE_URL, 'pos_auth', true);
