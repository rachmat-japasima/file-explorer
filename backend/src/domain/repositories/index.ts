// ============================================================
// Repository Interfaces (Ports)
// The domain defines WHAT it needs; infrastructure implements it
// This is the "Port" side of Hexagonal Architecture
// ============================================================

import type { Folder, File } from '../entities/folder.entity';

export interface FolderRepository {
  /**
   * Returns ALL folders (flat list).
   * The service layer builds the tree from this — single query, no N+1.
   */
  findAll(): Promise<Folder[]>;

  /**
   * Returns a single folder by id.
   */
  findById(id: number): Promise<Folder | null>;

  /**
   * Returns direct children of the given folder id.
   */
  findChildren(parentId: number): Promise<Folder[]>;

  /**
   * Creates a new folder and returns it (with generated id + path).
   */
  create(name: string, parentId: number | null): Promise<Folder>;

  /**
   * Deletes a folder and all its descendants (cascade via DB FK).
   */
  delete(id: number): Promise<void>;
}

export interface FileRepository {
  /**
   * Returns all files in a folder (direct children only).
   */
  findByFolderId(folderId: number): Promise<File[]>;
}
