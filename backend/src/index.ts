// ============================================================
// Backend Entry Point
// Wires up dependency injection: DB → Repos → Use Cases → Routes
// ============================================================

import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { db } from './infrastructure/database/client';
import { PostgresFolderRepository } from './infrastructure/database/repositories/folder.repository';
import { PostgresFileRepository } from './infrastructure/database/repositories/file.repository';
import {
  GetFolderTreeUseCase,
  GetFolderDetailsUseCase,
  CreateFolderUseCase,
} from './domain/use-cases/folder.use-cases';
import { createFolderRoutes } from './infrastructure/http/routes/folder.routes';

// ---- Dependency Injection ----
const folderRepo = new PostgresFolderRepository(db);
const fileRepo = new PostgresFileRepository(db);
const getFolderTree = new GetFolderTreeUseCase(folderRepo);
const getFolderDetails = new GetFolderDetailsUseCase(folderRepo, fileRepo);
const createFolder = new CreateFolderUseCase(folderRepo);

// ---- Elysia App ----
const app = new Elysia()
  .use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }))
  .use(swagger({
    documentation: {
      info: { title: 'Windows Explorer API', version: '1.0.0' },
    },
  }))
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .use(createFolderRoutes(getFolderTree, getFolderDetails, createFolder))
  .onError(({ code, error, set }) => {
    console.error(`[${code}]`, error);
    set.status = code === 'NOT_FOUND' ? 404 : 500;
    return {
      success: false,
      error: {
        code,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
    };
  });

const PORT = parseInt(process.env.PORT || '3000');
app.listen(PORT);

console.log(`🚀 Backend running on http://localhost:${PORT}`);
console.log(`📖 Swagger docs: http://localhost:${PORT}/swagger`);