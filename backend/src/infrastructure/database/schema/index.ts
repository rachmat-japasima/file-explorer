// ============================================================
// Database Schema using Drizzle ORM
//
// Data model explanation:
// - folders table uses adjacency list pattern (parent_id FK)
// - path column stores materialized path for fast subtree queries
//   e.g. "/1/5/12/" enables "find all descendants of folder 5"
//   with a simple LIKE '/1/5/%' without recursive CTEs
// - files belong to exactly one folder
// ============================================================

import { pgTable, serial, varchar, integer, timestamp, text, bigint, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const folders = pgTable(
  'folders',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    parentId: integer('parent_id').references((): any => folders.id, { onDelete: 'cascade' }),
    // Materialized path: "/parentId1/parentId2/.../thisId/"
    // Enables O(1) subtree queries: WHERE path LIKE '/1/5/%'
    path: text('path').notNull().default('/'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Index on parentId for fast children lookups
    parentIdIdx: index('folders_parent_id_idx').on(table.parentId),
    // Index on path for fast subtree queries (prefix search)
    pathIdx: index('folders_path_idx').on(table.path),
  })
);

export const files = pgTable(
  'files',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    folderId: integer('folder_id')
      .notNull()
      .references(() => folders.id, { onDelete: 'cascade' }),
    size: bigint('size', { mode: 'number' }).notNull().default(0),
    mimeType: varchar('mime_type', { length: 127 }).notNull().default('application/octet-stream'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    folderIdIdx: index('files_folder_id_idx').on(table.folderId),
  })
);

// ---- Drizzle Relations (for type-safe joins) ----

export const foldersRelations = relations(folders, ({ one, many }) => ({
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
  }),
  children: many(folders),
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
}));

export type FolderRecord = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type FileRecord = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
