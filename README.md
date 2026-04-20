# Windows Explorer — Full-Stack Monorepo

A Windows Explorer–style file browser built with **Bun + Elysia + Drizzle + Vue 3 + PostgreSQL**, structured as a monorepo with Docker support.

---

## Setup

```
## Copy Env file
cp .env.example .env

## Build Docker
docker compose build --no-cache
docker compose up

## Run Migrate and Seeder
docker compose run backend bun run db:migrate:prod
docker compose run backend bun run db:seed:prod
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Backend framework | [Elysia](https://elysiajs.com) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Database | PostgreSQL 16 |
| Frontend | Vue 3 (Composition API) |
| State management | Pinia |
| Shared types | `@windows-explorer/shared` (workspace package) |
| Containerization | Docker + Docker Compose |
| Web server | Nginx (production frontend) |

---

## Architecture

This project uses **Hexagonal Architecture** (Ports & Adapters):

```
Domain (pure business logic)
  └── entities/         — Folder, File, buildFolderTree algorithm
  └── repositories/     — Interfaces (ports): FolderRepository, FileRepository
  └── use-cases/        — GetFolderTree, GetFolderDetails, CreateFolder

Infrastructure (adapters)
  └── database/         — Drizzle schema, PostgreSQL implementations
  └── http/             — Elysia routes, controllers, request/response mapping
```

**Key rule:** the domain layer has zero imports from infrastructure. Swapping PostgreSQL for MySQL requires changing only the repository adapters.

---

## Core Algorithm — O(n) Tree Builder

Building the folder tree from a flat DB result:

```typescript
// Single pass — O(n) time, O(n) space
function buildFolderTree(folders: Folder[]): FolderTree[] {
  const nodeMap = new Map<number, FolderTree>();

  // Step 1: O(n) — build lookup map
  for (const folder of folders) {
    nodeMap.set(folder.id, { ...folder, children: [] });
  }

  const roots: FolderTree[] = [];

  // Step 2: O(n) — wire parent-child relationships
  for (const node of nodeMap.values()) {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      nodeMap.get(node.parentId)?.children.push(node);
    }
  }

  return roots; // fully nested tree
}
```

**Why a single query + in-memory tree?**
- Avoids N+1 queries (one query per folder level)
- Avoids recursive SQL CTEs (DB-specific, harder to test)
- Total cost: 1 DB round trip, O(n) memory

**Materialized path bonus** — each folder stores its full path (e.g. `/1/5/12/`), enabling fast subtree queries at scale:
```sql
-- Find all descendants of folder 5, no recursion needed:
SELECT * FROM folders WHERE path LIKE '/1/5/%';
```

---

## Data Model

```
folders
  id         SERIAL PRIMARY KEY
  name       VARCHAR(255)
  parent_id  INTEGER → folders(id) ON DELETE CASCADE
  path       TEXT       -- materialized path e.g. "/1/5/12/"
  created_at TIMESTAMP
  updated_at TIMESTAMP

files
  id         SERIAL PRIMARY KEY
  name       VARCHAR(255)
  folder_id  INTEGER → folders(id) ON DELETE CASCADE
  size       BIGINT
  mime_type  VARCHAR(127)
  created_at TIMESTAMP
  updated_at TIMESTAMP
```

---

## Monorepo Structure

```
windows-explorer/
├── packages/
│   └── shared/                 ← Shared TypeScript contracts
│       └── src/index.ts        FolderNode, FileNode, API response types
│
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/       folder.entity.ts (+ buildFolderTree)
│   │   │   ├── repositories/   port interfaces
│   │   │   └── use-cases/      folder.use-cases.ts
│   │   └── infrastructure/
│   │       ├── database/
│   │       │   ├── schema/     Drizzle table definitions
│   │       │   ├── repositories/ PostgreSQL adapters
│   │       │   ├── client.ts   DB connection pool
│   │       │   ├── migrate.ts  migration runner
│   │       │   └── seed.ts     sample data
│   │       └── http/
│   │           └── routes/     Elysia route handlers
│   ├── Dockerfile
│   └── drizzle.config.ts
│
├── frontend/
│   ├── src/
│   │   ├── services/           api.ts (typed HTTP client)
│   │   ├── stores/             explorer.store.ts (Pinia)
│   │   ├── composables/        useFileUtils.ts
│   │   └── components/
│   │       ├── FolderTree/     FolderTree.vue + FolderTreeItem.vue (recursive)
│   │       └── RightPanel/     RightPanel.vue
│   ├── tests/
│   ├── Dockerfile
│   └── vite.config.ts
│
├── docker/
│   └── nginx.conf              Nginx reverse proxy config
├── docker-compose.yml          Production stack
├── docker-compose.dev.yml      Dev stack (hot reload)
└── .env.example
```

---

## API Reference

### `GET /api/v1/folders`
Returns the complete folder tree (left panel).

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Documents",
      "parentId": null,
      "path": "/1/",
      "children": [
        { "id": 3, "name": "Work", "parentId": 1, "path": "/1/3/", "children": [] }
      ]
    }
  ]
}
```

### `GET /api/v1/folders/:id`
Returns a folder with its direct subfolders and files (right panel).

```json
{
  "success": true,
  "data": {
    "folder": { "id": 1, "name": "Documents", ... },
    "subfolders": [{ "id": 3, "name": "Work", ... }],
    "files": [{ "id": 10, "name": "README.md", "size": 2048, "mimeType": "text/markdown" }]
  }
}
```

### `POST /api/v1/folders`
Creates a new folder.

```json
// Request
{ "name": "New Folder", "parentId": 1 }

// Response 201
{ "success": true, "data": { "id": 99, "name": "New Folder", ... } }
```

### `GET /health`
Health check endpoint (used by Docker).

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com) & Docker Compose
- OR [Bun](https://bun.sh) + PostgreSQL (for local dev without Docker)

---

### Option A — Docker (recommended)

```bash
# 1. Clone and configure
git clone <repo>
cd windows-explorer
cp .env.example .env          # edit passwords if desired

# 2. Build and start all services
docker compose up --build

# 3. Run migrations + seed data (first time only)
docker compose run --rm migrator
docker compose exec backend bun run db:seed

# 4. Open the app
open http://localhost:80

# Swagger API docs
open http://localhost:3000/swagger
```

---

### Option B — Local dev with hot reload

```bash
# 1. Install dependencies (from monorepo root)
bun install

# 2. Start PostgreSQL via Docker only
docker compose up postgres -d

# 3. Copy env and configure DATABASE_URL
cp .env.example .env

# 4. Run migrations and seed
cd backend
bun run db:migrate
bun run db:seed
cd ..

# 5. Start backend + frontend concurrently
bun run dev
# Backend:  http://localhost:3000
# Frontend: http://localhost:5173
```

---

### Option C — Full dev stack in Docker (hot reload)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Source files are bind-mounted — changes trigger instant reload on both backend and frontend.

---

## Running Tests

```bash
# All tests
bun test

# Backend unit tests only
cd backend && bun test

# Frontend component tests only
cd frontend && bun run test
```

---

## Docker Services

| Service | Port | Description |
|---|---|---|
| `postgres` | 5432 | PostgreSQL 16 with health check |
| `migrator` | — | Runs Drizzle migrations once on startup |
| `backend` | 3000 | Bun + Elysia REST API |
| `frontend` | 80 | Vue SPA served by Nginx, proxies `/api` to backend |

**Production multi-stage builds:**
- Backend: `deps → builder → runner` (slim Bun image, non-root user)
- Frontend: `deps → builder → nginx:alpine` (static files only, ~25MB image)

---

## Scalability Notes

For high-traffic / large datasets:

1. **Pagination** on `GET /folders/:id` — pass `?page=` & `?perPage=`
2. **Redis cache** for the folder tree (invalidate on create/delete)
3. **Materialized path index** already in place for subtree queries
4. **Read replicas** — point `findAll()` queries to replica
5. **Connection pooling** — PgBouncer in front of PostgreSQL
6. **CDN** for the Nginx-served frontend assets

---

## Bonus Features Implemented

- ✅ Files displayed in the right panel (name, size, icon by MIME type)
- ✅ Folders in left panel openable/closable (chevron expand/collapse)
- ✅ Resizable split pane (drag the divider)
- ✅ REST API standards (versioning `/api/v1`, proper HTTP methods & status codes)
- ✅ Monorepo with shared types package
- ✅ Bun runtime
- ✅ Elysia framework
- ✅ ORM (Drizzle)
- ✅ Docker + Docker Compose (production & dev)
- ✅ Hexagonal / Clean Architecture
- ✅ Service + Repository layer
- ✅ SOLID principles
- ✅ Unit tests (backend domain logic + frontend components)
- ✅ Swagger docs auto-generated by Elysia
