// ============================================================
// Shared Types — consumed by both backend and frontend
// Using a shared package avoids type drift between layers
// ============================================================

export interface FolderNode {
  id: number;
  name: string;
  parentId: number | null;
  path: string; // materialized path e.g. "/root/docs/legal"
  children: FolderNode[];
  createdAt: string;
  updatedAt: string;
}

export interface FileNode {
  id: number;
  name: string;
  folderId: number;
  size: number; // bytes
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

// ---- API response shapes ----

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// ---- API Request/Response contracts ----

export type GetFolderTreeResponse = ApiResponse<FolderNode[]>;
export type GetFolderChildrenResponse = ApiResponse<{
  folder: FolderNode;
  subfolders: FolderNode[];
  files: FileNode[];
}>;

export interface CreateFolderRequest {
  name: string;
  parentId: number | null;
}

export type CreateFolderResponse = ApiResponse<FolderNode>;
