// Re-export the shared admin API client for backward compatibility
export { adminApiClient as apiClient } from '@/lib/apiClient';
export type { ApiResponse, PaginatedResponse, PaginationParams } from '@/lib/apiClient';
