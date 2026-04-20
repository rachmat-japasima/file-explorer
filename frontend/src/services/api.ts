// ============================================================
// API Service — centralizes all backend HTTP calls
// Typed using shared contracts from @windows-explorer/shared
// ============================================================

import type {
  GetFolderTreeResponse,
  GetFolderChildrenResponse,
  CreateFolderRequest,
  CreateFolderResponse,
} from '@windows-explorer/shared';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data?.error?.message || `HTTP ${res.status}`);
  }

  return data as T;
}

export const folderApi = {
  /**
   * Fetch the complete folder tree (for the left panel).
   * Single query — O(n) tree built on the backend.
   */
  getTree(): Promise<GetFolderTreeResponse> {
    return request<GetFolderTreeResponse>('/folders');
  },

  /**
   * Fetch direct children + files for a folder (for the right panel).
   */
  getFolderDetails(id: number): Promise<GetFolderChildrenResponse> {
    return request<GetFolderChildrenResponse>(`/folders/${id}`);
  },

  /**
   * Create a new folder.
   */
  createFolder(payload: CreateFolderRequest): Promise<CreateFolderResponse> {
    return request<CreateFolderResponse>('/folders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
