// ============================================================
// Unit Tests — domain logic (no DB needed)
// Run: bun test
// ============================================================

import { describe, it, expect } from 'bun:test';
import { buildFolderTree, validateFolderName, type Folder } from '../domain/entities/folder.entity';

const mockFolders: Folder[] = [
  { id: 1, name: 'Root A', parentId: null, path: '/1/', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'Root B', parentId: null, path: '/2/', createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: 'Child A1', parentId: 1, path: '/1/3/', createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: 'Child A2', parentId: 1, path: '/1/4/', createdAt: new Date(), updatedAt: new Date() },
  { id: 5, name: 'Grandchild A1a', parentId: 3, path: '/1/3/5/', createdAt: new Date(), updatedAt: new Date() },
];

describe('buildFolderTree', () => {
  it('returns correct number of root nodes', () => {
    const tree = buildFolderTree(mockFolders);
    expect(tree.length).toBe(2);
  });

  it('attaches children to correct parent', () => {
    const tree = buildFolderTree(mockFolders);
    const rootA = tree.find((f) => f.id === 1)!;
    expect(rootA.children.length).toBe(2);
  });

  it('builds nested tree correctly', () => {
    const tree = buildFolderTree(mockFolders);
    const rootA = tree.find((f) => f.id === 1)!;
    const childA1 = rootA.children.find((f) => f.id === 3)!;
    expect(childA1.children.length).toBe(1);
    expect(childA1.children[0].id).toBe(5);
  });

  it('sorts children alphabetically', () => {
    const tree = buildFolderTree(mockFolders);
    const rootA = tree.find((f) => f.id === 1)!;
    expect(rootA.children[0].name).toBe('Child A1');
    expect(rootA.children[1].name).toBe('Child A2');
  });

  it('handles empty array', () => {
    const tree = buildFolderTree([]);
    expect(tree).toEqual([]);
  });

  it('handles single root with no children', () => {
    const tree = buildFolderTree([mockFolders[0]]);
    expect(tree.length).toBe(1);
    expect(tree[0].children).toEqual([]);
  });
});

describe('validateFolderName', () => {
  it('returns null for valid names', () => {
    expect(validateFolderName('My Documents')).toBeNull();
    expect(validateFolderName('folder-123')).toBeNull();
    expect(validateFolderName('project.backup')).toBeNull();
  });

  it('rejects empty name', () => {
    expect(validateFolderName('')).not.toBeNull();
    expect(validateFolderName('   ')).not.toBeNull();
  });

  it('rejects names with invalid characters', () => {
    expect(validateFolderName('folder/name')).not.toBeNull();
    expect(validateFolderName('folder:name')).not.toBeNull();
    expect(validateFolderName('folder*name')).not.toBeNull();
  });

  it('rejects names longer than 255 characters', () => {
    expect(validateFolderName('a'.repeat(256))).not.toBeNull();
  });
});
