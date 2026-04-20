<script setup lang="ts">
import { useExplorerStore } from '@/stores/explorer.store';
import { useFileUtils } from '@/composables/useFileUtils';

const store = useExplorerStore();
const { formatSize, getMimeIcon, formatDate } = useFileUtils();

function handleFolderDblClick(id: number) {
  store.selectFolder(id);
  store.toggleExpanded(id);
  // Scroll left panel to selected node (best-effort via store)
}
</script>

<template>
  <main class="right-panel" role="main">
    <!-- Empty state: nothing selected -->
    <div v-if="!store.selectedFolderId && !store.isLoadingDetails" class="right-panel__empty">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" opacity="0.25">
        <path d="M8 16C8 13.7909 9.79086 12 12 12H24.6863C25.747 12 26.7641 12.4214 27.5147 13.1716L30.8284 16.4853C31.5786 17.2357 32.5957 17.6569 33.6564 17.6569H52C54.2091 17.6569 56 19.4478 56 21.6569V48C56 50.2091 54.2091 52 52 52H12C9.79086 52 8 50.2091 8 48V16Z" fill="currentColor"/>
      </svg>
      <p>Select a folder to view its contents</p>
    </div>

    <!-- Loading state -->
    <div v-else-if="store.isLoadingDetails" class="right-panel__loading">
      <div v-for="i in 6" :key="i" class="skeleton-card" />
    </div>

    <!-- Error state -->
    <div v-else-if="store.detailsError" class="right-panel__error">
      ⚠️ {{ store.detailsError }}
    </div>

    <!-- Content -->
    <template v-else-if="store.selectedFolderDetails">
      <!-- Breadcrumb header -->
      <div class="right-panel__header">
        <div class="right-panel__breadcrumb">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1 4C1 3.44772 1.44772 3 2 3H6.17157C6.43679 3 6.69114 3.10536 6.87868 3.29289L7.70711 4.12132C7.89464 4.30886 8.14899 4.41421 8.41421 4.41421H14C14.5523 4.41421 15 4.86193 15 5.41421V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4Z" fill="#FFD966" stroke="#D4A017" stroke-width="0.5"/>
          </svg>
          <span class="right-panel__folder-name">
            {{ store.selectedFolderDetails.folder.name }}
          </span>
          <span class="right-panel__count">
            {{ store.selectedFolderDetails.subfolders.length + store.selectedFolderDetails.files.length }} items
          </span>
        </div>
      </div>

      <!-- Items grid -->
      <div class="right-panel__grid">
        <!-- Subfolders first -->
        <div
          v-for="folder in store.selectedFolderDetails.subfolders"
          :key="`folder-${folder.id}`"
          class="item-card item-card--folder"
          role="button"
          tabindex="0"
          :aria-label="`Folder: ${folder.name}`"
          @click="store.selectFolder(folder.id)"
          @dblclick="handleFolderDblClick(folder.id)"
          @keydown.enter="store.selectFolder(folder.id)"
        >
          <div class="item-card__icon">
            <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
              <path d="M2 8C2 6.34315 3.34315 5 5 5H16.4289C17.4896 5 18.5067 5.42143 19.2573 6.17157L21.8284 8.74264C22.579 9.49279 23.5961 9.91421 24.6568 9.91421H35C36.6569 9.91421 38 11.2573 38 12.9142V30C38 31.6569 36.6569 33 35 33H5C3.34315 33 2 31.6569 2 30V8Z" fill="#FFD966" stroke="#D4A017" stroke-width="1"/>
            </svg>
          </div>
          <span class="item-card__name" :title="folder.name">{{ folder.name }}</span>
          <span class="item-card__meta">Folder</span>
        </div>

        <!-- Files -->
        <div
          v-for="file in store.selectedFolderDetails.files"
          :key="`file-${file.id}`"
          class="item-card item-card--file"
          role="button"
          tabindex="0"
          :aria-label="`File: ${file.name}`"
        >
          <div class="item-card__icon item-card__icon--file">
            {{ getMimeIcon(file.mimeType) }}
          </div>
          <span class="item-card__name" :title="file.name">{{ file.name }}</span>
          <span class="item-card__meta">{{ formatSize(file.size) }}</span>
        </div>
      </div>

      <!-- Empty folder message -->
      <div
        v-if="store.selectedFolderDetails.subfolders.length === 0 && store.selectedFolderDetails.files.length === 0"
        class="right-panel__empty"
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.2">
          <path d="M6 12C6 10.3431 7.34315 9 9 9H18.3211C19.3818 9 20.3989 9.42143 21.1495 10.1716L23.7206 12.7426C24.4712 13.4928 25.4883 13.9142 26.549 13.9142H39C40.6569 13.9142 42 15.2573 42 16.9142V36C42 37.6569 40.6569 39 39 39H9C7.34315 39 6 37.6569 6 36V12Z" fill="currentColor"/>
        </svg>
        <p>This folder is empty</p>
      </div>
    </template>
  </main>
</template>

<style scoped>
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-panel-right);
}

.right-panel__header {
  padding: 10px 16px 8px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.right-panel__breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
}

.right-panel__folder-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.right-panel__count {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-left: auto;
}

.right-panel__grid {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
  align-content: start;
}

.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s;
  text-align: center;
  border: 1px solid transparent;
  gap: 4px;
}

.item-card:hover {
  background: var(--color-hover);
  border-color: var(--color-border);
}

.item-card:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.item-card__icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-card__icon--file {
  font-size: 32px;
  line-height: 1;
}

.item-card__name {
  font-size: 12px;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  width: 100%;
}

.item-card__meta {
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* Empty / loading / error */
.right-panel__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.right-panel__error {
  padding: 24px;
  color: var(--color-error);
  font-size: 13px;
}

.right-panel__loading {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
}

.skeleton-card {
  height: 90px;
  background: var(--color-skeleton);
  border-radius: 6px;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
</style>
