import { eq } from 'drizzle-orm';
import type { Database } from '../client';
import { files as filesTable } from '../schema';
import type { FileRepository } from '../../../domain/repositories';
import type { File } from '../../../domain/entities/folder.entity';

function mapToFile(record: typeof filesTable.$inferSelect): File {
  return {
    id: record.id,
    name: record.name,
    folderId: record.folderId,
    size: record.size,
    mimeType: record.mimeType,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class PostgresFileRepository implements FileRepository {
  constructor(private readonly db: Database) {}

  async findByFolderId(folderId: number): Promise<File[]> {
    const records = await this.db
      .select()
      .from(filesTable)
      .where(eq(filesTable.folderId, folderId))
      .orderBy(filesTable.name);

    return records.map(mapToFile);
  }
}
