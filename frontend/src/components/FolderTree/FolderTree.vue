<script setup lang="ts">
import { useExplorerStore } from '@/stores/explorer.store';
import FolderTreeItem from './FolderTreeItem.vue';

const store = useExplorerStore();
</script>

<template>
  <aside class="folder-tree" role="tree" aria-label="Folder structure">
    <div class="folder-tree__header">
      <span class="folder-tree__title">Folders</span>
    </div>

    <div class="folder-tree__content">
      <!-- Loading skeleton -->
      <div v-if="store.isLoadingTree" class="folder-tree__loading">
        <div v-for="i in 7" :key="i" class="skeleton-row" :style="{ width: `${55 + Math.random() * 35}%`, marginLeft: `${(i % 3) * 16}px` }" />
      </div>

      <!-- Error state -->
      <div v-else-if="store.treeError" class="folder-tree__error">
        <span>⚠️ {{ store.treeError }}</span>
        <button @click="store.loadTree">Retry</button>
      </div>

      <!-- Tree -->
      <ul v-else class="folder-tree__list" role="tree">
        <FolderTreeItem
          v-for="folder in store.folderTree"
          :key="folder.id"
          :folder="folder"
          :depth="0"
        />
      </ul>

      <!-- Empty state -->
      <div v-if="!store.isLoadingTree && !store.treeError && store.folderTree.length === 0" class="folder-tree__empty">
        No folders yet
      </div>
    </div>
  </aside>
</template>

<style scoped>
.folder-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid var(--color-border);
  background: var(--color-panel-left);
}

.folder-tree__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.folder-tree__title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}

.folder-tree__content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 4px;
}

.folder-tree__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.folder-tree__loading {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
}

.skeleton-row {
  height: 20px;
  background: var(--color-skeleton);
  border-radius: 4px;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.folder-tree__error {
  padding: 16px;
  font-size: 13px;
  color: var(--color-error);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.folder-tree__error button {
  width: fit-content;
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-button);
  cursor: pointer;
}

.folder-tree__empty {
  padding: 24px 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
}
</style>
