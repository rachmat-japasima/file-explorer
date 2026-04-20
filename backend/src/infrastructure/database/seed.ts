// ============================================================
// Seed script — creates a realistic folder/file tree
// Run: bun src/infrastructure/database/seed.ts
// ============================================================

import { db } from './client';
import { folders, files } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data (order matters for FK constraints)
  await db.delete(files);
  await db.delete(folders);

  // ---- Helper to insert a folder and return its id ----
  async function createFolder(name: string, parentId: number | null, parentPath: string) {
    const [folder] = await db
      .insert(folders)
      .values({ name, parentId })
      .returning();

    // Update path after insert so we have the id
    const path = `${parentPath}${folder.id}/`;
    await db.update(folders).set({ path }).where(/* eq */ (await import('drizzle-orm')).eq(folders.id, folder.id));

    return { ...folder, path };
  }

  // Root folders
  const documents = await createFolder('Documents', null, '/');
  const pictures = await createFolder('Pictures', null, '/');
  const music = await createFolder('Music', null, '/');
  const downloads = await createFolder('Downloads', null, '/');
  const projects = await createFolder('Projects', null, '/');

  // Documents subtree
  const work = await createFolder('Work', documents.id, documents.path);
  const personal = await createFolder('Personal', documents.id, documents.path);
  const legal = await createFolder('Legal', documents.id, documents.path);

  const reports = await createFolder('Reports', work.id, work.path);
  const presentations = await createFolder('Presentations', work.id, work.path);
  const _2023 = await createFolder('2023', reports.id, reports.path);
  const _2024 = await createFolder('2024', reports.id, reports.path);

  // Pictures subtree
  const vacation = await createFolder('Vacation', pictures.id, pictures.path);
  const family = await createFolder('Family', pictures.id, pictures.path);
  const _2023pics = await createFolder('2023', vacation.id, vacation.path);
  const _2024pics = await createFolder('2024', vacation.id, vacation.path);

  // Music subtree
  const rock = await createFolder('Rock', music.id, music.path);
  const jazz = await createFolder('Jazz', music.id, music.path);
  const classical = await createFolder('Classical', music.id, music.path);

  // Projects subtree
  const webApps = await createFolder('WebApps', projects.id, projects.path);
  const mobileApps = await createFolder('MobileApps', projects.id, projects.path);
  const myBlog = await createFolder('my-blog', webApps.id, webApps.path);
  const ecommerce = await createFolder('e-commerce', webApps.id, webApps.path);

  // ---- Seed files ----
  await db.insert(files).values([
    { name: 'Q1-Report.pdf', folderId: _2024.id, size: 204800, mimeType: 'application/pdf' },
    { name: 'Q2-Report.pdf', folderId: _2024.id, size: 307200, mimeType: 'application/pdf' },
    { name: 'Q4-Report.pdf', folderId: _2023.id, size: 256000, mimeType: 'application/pdf' },
    { name: 'Company-Overview.pptx', folderId: presentations.id, size: 1048576, mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
    { name: 'Budget-2024.xlsx', folderId: work.id, size: 51200, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { name: 'Contract-NDA.pdf', folderId: legal.id, size: 102400, mimeType: 'application/pdf' },
    { name: 'Resume.docx', folderId: personal.id, size: 40960, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { name: 'beach-sunset.jpg', folderId: _2024pics.id, size: 3145728, mimeType: 'image/jpeg' },
    { name: 'mountain-hike.jpg', folderId: _2024pics.id, size: 4194304, mimeType: 'image/jpeg' },
    { name: 'family-dinner.jpg', folderId: family.id, size: 2097152, mimeType: 'image/jpeg' },
    { name: 'README.md', folderId: myBlog.id, size: 2048, mimeType: 'text/markdown' },
    { name: 'package.json', folderId: myBlog.id, size: 1024, mimeType: 'application/json' },
    { name: 'README.md', folderId: ecommerce.id, size: 3072, mimeType: 'text/markdown' },
  ]);

  console.log('✅ Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
