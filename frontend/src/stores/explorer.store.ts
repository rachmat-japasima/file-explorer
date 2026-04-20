// ============================================================
// Pinia Store — Explorer State
// Single source of truth for folder tree + selected folder
// ============================================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { folderApi } from '@/services/api';
import type { FolderNode, FileNode } from '@windows-explorer/shared';

export const useExplorerStore = defineStore('explorer', () => {
  // ---- State ----
  const folderTree = ref<FolderNode[]>([]);
  const selectedFolderId = ref<number | null>(null);
  const selectedFolderDetails = ref<{
    folder: FolderNode;
    subfolders: FolderNode[];
    files: FileNode[];
  } | null>(null);
  const expandedIds = ref<Set<number>>(new Set());
  const isLoadingTree = ref(false);
  const isLoadingDetails = ref(false);
  const treeError = ref<string | null>(null);
  const detailsError = ref<string | null>(null);

  // ---- Getters ----
  const selectedFolder = computed(() =>
    selectedFolderDetails.value?.folder ?? null
  );

  // ---- Actions ----
  async function loadTree() {
    isLoadingTree.value = true;
    treeError.value = null;
    try {
      const res = await folderApi.getTree();
      folderTree.value = res.data;
    } catch (err: any) {
      treeError.value = err.message;
    } finally {
      isLoadingTree.value = false;
    }
  }

  async function selectFolder(id: number) {
    if (selectedFolderId.value === id) return;
    selectedFolderId.value = id;
    isLoadingDetails.value = true;
    detailsError.value = null;
    try {
      const res = await folderApi.getFolderDetails(id);
      selectedFolderDetails.value = res.data;
    } catch (err: any) {
      detailsError.value = err.message;
    } finally {
      isLoadingDetails.value = false;
    }
  }

  function toggleExpanded(id: number) {
    if (expandedIds.value.has(id)) {
      expandedIds.value.delete(id);
    } else {
      expandedIds.value.add(id);
    }
  }

  function isExpanded(id: number): boolean {
    return expandedIds.value.has(id);
  }

  async function createFolder(name: string, parentId: number | null) {
    await folderApi.createFolder({ name, parentId });
    // Reload the tree after creation
    await loadTree();
    // If a folder was selected and we added a child, refresh details too
    if (parentId !== null && selectedFolderId.value === parentId) {
      await selectFolder(parentId);
    }
  }

  return {
    // state
    folderTree,
    selectedFolderId,
    selectedFolderDetails,
    expandedIds,
    isLoadingTree,
    isLoadingDetails,
    treeError,
    detailsError,
    // getters
    selectedFolder,
    // actions
    loadTree,
    selectFolder,
    toggleExpanded,
    isExpanded,
    createFolder,
  };
});
