<script setup lang="ts">
// ============================================================
// FolderTreeItem — Recursive component
//
// This component renders itself for each child, enabling
// unlimited folder depth without any special-casing.
// Vue 3's component resolution handles circular references
// automatically with defineOptions({ name }).
// ============================================================

import { computed } from 'vue';
import type { FolderNode } from '@windows-explorer/shared';
import { useExplorerStore } from '@/stores/explorer.store';

defineOptions({ name: 'FolderTreeItem' });

const props = defineProps<{
  folder: FolderNode;
  depth: number;
}>();

const store = useExplorerStore();

const isExpanded = computed(() => store.isExpanded(props.folder.id));
const isSelected = computed(() => store.selectedFolderId === props.folder.id);
const hasChildren = computed(() => props.folder.children.length > 0);

function handleClick() {
  store.selectFolder(props.folder.id);
}

function handleToggle(e: Event) {
  e.stopPropagation();
  store.toggleExpanded(props.folder.id);
}
</script>

<template>
  <li class="tree-item" role="treeitem" :aria-expanded="hasChildren ? isExpanded : undefined" :aria-selected="isSelected">
    <div
      class="tree-item__row"
      :class="{ 'tree-item__row--selected': isSelected }"
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
      @click="handleClick"
    >
      <!-- Expand/collapse chevron -->
      <button
        class="tree-item__chevron"
        :class="{ 'tree-item__chevron--expanded': isExpanded, 'tree-item__chevron--hidden': !hasChildren }"
        @click="handleToggle"
        :aria-label="isExpanded ? 'Collapse' : 'Expand'"
        tabindex="-1"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M3 1.5L7 5L3 8.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Folder icon -->
      <span class="tree-item__icon">
        <svg v-if="isExpanded" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1 4C1 3.44772 1.44772 3 2 3H6.17157C6.43679 3 6.69114 3.10536 6.87868 3.29289L7.70711 4.12132C7.89464 4.30886 8.14899 4.41421 8.41421 4.41421H14C14.5523 4.41421 15 4.86193 15 5.41421V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4Z" fill="#F0C040" stroke="#D4A017" stroke-width="0.5"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1 4C1 3.44772 1.44772 3 2 3H6.17157C6.43679 3 6.69114 3.10536 6.87868 3.29289L7.70711 4.12132C7.89464 4.30886 8.14899 4.41421 8.41421 4.41421H14C14.5523 4.41421 15 4.86193 15 5.41421V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4Z" fill="#FFD966" stroke="#D4A017" stroke-width="0.5"/>
        </svg>
      </span>

      <span class="tree-item__name">{{ folder.name }}</span>
    </div>

    <!-- Recursive children — only rendered when expanded -->
    <ul v-if="hasChildren && isExpanded" class="tree-item__children" role="group">
      <FolderTreeItem
        v-for="child in folder.children"
        :key="child.id"
        :folder="child"
        :depth="depth + 1"
      />
    </ul>
  </li>
</template>

<style scoped>
.tree-item {
  list-style: none;
  user-select: none;
}

.tree-item__row {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.1s;
  padding-right: 8px;
}

.tree-item__row:hover {
  background: var(--color-hover);
}

.tree-item__row--selected {
  background: var(--color-selected) !important;
  color: var(--color-selected-text);
}

.tree-item__chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: transform 0.15s, color 0.1s;
  padding: 0;
  border-radius: 3px;
}

.tree-item__chevron:hover {
  color: var(--color-text-primary);
  background: var(--color-hover-strong);
}

.tree-item__chevron--hidden {
  visibility: hidden;
  pointer-events: none;
}

.tree-item__chevron--expanded {
  transform: rotate(90deg);
}

.tree-item__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.tree-item__name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  color: inherit;
}
</style>
