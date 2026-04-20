// ============================================================
// Folder Controller — HTTP presentation layer
// Translates HTTP ↔ use case DTOs
// ============================================================

import { t, Elysia } from 'elysia';

import type {
  GetFolderTreeUseCase,
  GetFolderDetailsUseCase,
  CreateFolderUseCase,
} from '../../../domain/use-cases/folder.use-cases';
import type {
  GetFolderTreeResponse,
  GetFolderChildrenResponse,
  CreateFolderResponse,
  ApiError,
  FolderNode,
} from '@windows-explorer/shared';
import type { FolderTree } from '../../../domain/entities/folder.entity';

// ---- Mapper: domain FolderTree → shared FolderNode ----
function toFolderNode(tree: FolderTree): FolderNode {
  return {
    id: tree.id,
    name: tree.name,
    parentId: tree.parentId,
    path: tree.path,
    children: tree.children.map(toFolderNode),
    createdAt: tree.createdAt.toISOString(),
    updatedAt: tree.updatedAt.toISOString(),
  };
}

export function createFolderRoutes(
  getFolderTree: GetFolderTreeUseCase,
  getFolderDetails: GetFolderDetailsUseCase,
  createFolder: CreateFolderUseCase
) {
  return new Elysia({ prefix: '/api/v1/folders' })
    // GET /api/v1/folders — full tree for left panel
    .get('', async (): Promise<GetFolderTreeResponse> => {
      const tree = await getFolderTree.execute();
      return {
        success: true,
        data: tree.map(toFolderNode),
      };
    })

    // GET /api/v1/folders/:id — folder details + children for right panel
    .get(
      '/:id',
      async ({ params, set }): Promise<GetFolderChildrenResponse | ApiError> => {
        const id = parseInt(params.id);
        if (isNaN(id)) {
          set.status = 400;
          return { success: false, error: { code: 'INVALID_ID', message: 'Invalid folder id' } };
        }

        const result = await getFolderDetails.execute(id);
        if (!result) {
          set.status = 404;
          return { success: false, error: { code: 'NOT_FOUND', message: `Folder ${id} not found` } };
        }

        return {
          success: true,
          data: {
            folder: {
              id: result.folder.id,
              name: result.folder.name,
              parentId: result.folder.parentId,
              path: result.folder.path,
              children: [],
              createdAt: result.folder.createdAt.toISOString(),
              updatedAt: result.folder.updatedAt.toISOString(),
            },
            subfolders: result.subfolders.map((f) => ({
              id: f.id,
              name: f.name,
              parentId: f.parentId,
              path: f.path,
              children: [],
              createdAt: f.createdAt.toISOString(),
              updatedAt: f.updatedAt.toISOString(),
            })),
            files: result.files.map((f) => ({
              id: f.id,
              name: f.name,
              folderId: f.folderId,
              size: f.size,
              mimeType: f.mimeType,
              createdAt: f.createdAt.toISOString(),
              updatedAt: f.updatedAt.toISOString(),
            })),
          },
        };
      }
    )

    // POST /api/v1/folders — create new folder
    .post(
      '',
      async ({ body, set }): Promise<CreateFolderResponse | ApiError> => {
        try {
          const result = await createFolder.execute(body.name, body.parentId ?? null);
          set.status = 201;
          return {
            success: true,
            data: {
              ...result.folder,
              children: [],
              createdAt: result.folder.createdAt.toISOString(),
              updatedAt: result.folder.updatedAt.toISOString(),
            },
          };
        } catch (err: any) {
          set.status = 400;
          return {
            success: false,
            error: { code: 'VALIDATION_ERROR', message: err.message },
          };
        }
      },
      {
        body: t.Object({
          name: t.String(),
          parentId: t.Optional(t.Nullable(t.Number())),
        }),
      }
    );
}
