// ============================================================
// PostgreSQL Folder Repository (Adapter)
// Implements the domain's FolderRepository port
// Only this file knows about SQL — domain stays clean
// ============================================================

import { eq, isNull } from 'drizzle-orm';
import type { Database } from '../client';
import { folders as foldersTable } from '../schema';
import type { FolderRepository } from '../../../domain/repositories';
import type { Folder } from '../../../domain/entities/folder.entity';

function mapToFolder(record: typeof foldersTable.$inferSelect): Folder {
  return {
    id: record.id,
    name: record.name,
    parentId: record.parentId,
    path: record.path,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class PostgresFolderRepository implements FolderRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<Folder[]> {
    const records = await this.db
      .select()
      .from(foldersTable)
      .orderBy(foldersTable.name);

    return records.map(mapToFolder);
  }

  async findById(id: number): Promise<Folder | null> {
    const [record] = await this.db
      .select()
      .from(foldersTable)
      .where(eq(foldersTable.id, id))
      .limit(1);

    return record ? mapToFolder(record) : null;
  }

  async findChildren(parentId: number): Promise<Folder[]> {
    const records = await this.db
      .select()
      .from(foldersTable)
      .where(eq(foldersTable.parentId, parentId))
      .orderBy(foldersTable.name);

    return records.map(mapToFolder);
  }

  async create(name: string, parentId: number | null): Promise<Folder> {
    // Insert first to get the generated id
    const [newFolder] = await this.db
      .insert(foldersTable)
      .values({ name, parentId })
      .returning();

    // Build materialized path using parent's path (or root if no parent)
    let parentPath = '/';
    if (parentId !== null) {
      const [parent] = await this.db
        .select({ path: foldersTable.path })
        .from(foldersTable)
        .where(eq(foldersTable.id, parentId))
        .limit(1);
      if (parent) parentPath = parent.path;
    }

    const path = `${parentPath}${newFolder.id}/`;

    const [updated] = await this.db
      .update(foldersTable)
      .set({ path })
      .where(eq(foldersTable.id, newFolder.id))
      .returning();

    return mapToFolder(updated);
  }

  async delete(id: number): Promise<void> {
    // Cascade deletion handled by DB FK with ON DELETE CASCADE
    await this.db.delete(foldersTable).where(eq(foldersTable.id, id));
  }
}
