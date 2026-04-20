// ============================================================
// Use Cases — Application Layer
// Orchestrates domain entities + repository ports
// Each use case = one business operation
// ============================================================

import type { FolderRepository, FileRepository } from '../repositories';
import { buildFolderTree, validateFolderName, type FolderTree, type Folder, type File } from '../entities/folder.entity';

// ---- Get full folder tree ----

export class GetFolderTreeUseCase {
  constructor(private readonly folderRepo: FolderRepository) {}

  async execute(): Promise<FolderTree[]> {
    const allFolders = await this.folderRepo.findAll();
    return buildFolderTree(allFolders);
  }
}

// ---- Get folder children (for right panel) ----

export interface FolderDetails {
  folder: Folder;
  subfolders: Folder[];
  files: File[];
}

export class GetFolderDetailsUseCase {
  constructor(
    private readonly folderRepo: FolderRepository,
    private readonly fileRepo: FileRepository
  ) {}

  async execute(folderId: number): Promise<FolderDetails | null> {
    const [folder, subfolders, files] = await Promise.all([
      this.folderRepo.findById(folderId),
      this.folderRepo.findChildren(folderId),
      this.fileRepo.findByFolderId(folderId),
    ]);

    if (!folder) return null;

    return { folder, subfolders, files };
  }
}

// ---- Create folder ----

export interface CreateFolderResult {
  folder: Folder;
}

export class CreateFolderUseCase {
  constructor(private readonly folderRepo: FolderRepository) {}

  async execute(name: string, parentId: number | null): Promise<CreateFolderResult> {
    const validationError = validateFolderName(name);
    if (validationError) {
      throw new Error(validationError);
    }

    if (parentId !== null) {
      const parent = await this.folderRepo.findById(parentId);
      if (!parent) {
        throw new Error(`Parent folder with id ${parentId} not found`);
      }
    }

    const folder = await this.folderRepo.create(name, parentId);
    return { folder };
  }
}
