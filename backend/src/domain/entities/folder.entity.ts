// ============================================================
// Domain Entity — Folder
// Pure business logic, zero infrastructure dependencies
// This is the hexagonal architecture "core"
// ============================================================

export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderTree extends Folder {
  children: FolderTree[];
}

export interface File {
  id: number;
  name: string;
  folderId: number;
  size: number;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Domain business rules ----

export function buildFolderTree(folders: Folder[]): FolderTree[] {
  // ============================================================
  // ALGORITHM: Single-pass O(n) tree builder using a Map
  //
  // Why not recursive SQL (CTE)?
  //   - CTEs work but are DB-specific; this is DB-agnostic
  //   - We already load all folders once; building in memory
  //     avoids N+1 DB roundtrips
  //
  // Steps:
  //   1. Create a Map<id, FolderTree> for O(1) parent lookup
  //   2. Single pass: attach each node to its parent's children[]
  //   3. Collect nodes with parentId=null as roots
  //
  // Result: complete tree with O(n) time and O(n) space
  // ============================================================

  const nodeMap = new Map<number, FolderTree>();

  // Step 1: populate map
  for (const folder of folders) {
    nodeMap.set(folder.id, { ...folder, children: [] });
  }

  const roots: FolderTree[] = [];

  // Step 2: wire parent-child relationships
  for (const node of nodeMap.values()) {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  }

  // Step 3: sort children alphabetically for consistent ordering
  sortTree(roots);

  return roots;
}

function sortTree(nodes: FolderTree[]): void {
  nodes.sort((a, b) => a.name.localeCompare(b.name));
  for (const node of nodes) {
    if (node.children.length > 0) {
      sortTree(node.children);
    }
  }
}

export function validateFolderName(name: string): string | null {
  if (!name || name.trim().length === 0) return 'Folder name cannot be empty';
  if (name.length > 255) return 'Folder name cannot exceed 255 characters';
  if (/[/\\:*?"<>|]/.test(name)) return 'Folder name contains invalid characters';
  return null;
}
