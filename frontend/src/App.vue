<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useExplorerStore } from '@/stores/explorer.store';
import FolderTree from '@/components/FolderTree/FolderTree.vue';
import RightPanel from '@/components/RightPanel/RightPanel.vue';

const store = useExplorerStore();

// ---- Resizable split pane ----
const leftWidth = ref(260);
const isResizing = ref(false);
const containerRef = ref<HTMLElement | null>(null);

function startResize(e: MouseEvent) {
  isResizing.value = true;
  const startX = e.clientX;
  const startWidth = leftWidth.value;

  function onMove(e: MouseEvent) {
    const dx = e.clientX - startX;
    const newWidth = Math.min(Math.max(startWidth + dx, 160), 500);
    leftWidth.value = newWidth;
  }

  function onUp() {
    isResizing.value = false;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

onMounted(() => {
  store.loadTree();
});
</script>

<template>
  <div class="app" :class="{ 'app--resizing': isResizing }" ref="containerRef">
    <!-- Title bar -->
    <header class="title-bar">
      <div class="title-bar__controls">
        <span class="dot dot--red" />
        <span class="dot dot--yellow" />
        <span class="dot dot--green" />
      </div>
      <div class="title-bar__address">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M1 4C1 3.44772 1.44772 3 2 3H6.17157C6.43679 3 6.69114 3.10536 6.87868 3.29289L7.70711 4.12132C7.89464 4.30886 8.14899 4.41421 8.41421 4.41421H14C14.5523 4.41421 15 4.86193 15 5.41421V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4Z" fill="#FFD966" stroke="#D4A017" stroke-width="0.5"/>
        </svg>
        <span>{{ store.selectedFolder?.name ?? 'Windows Explorer' }}</span>
      </div>
    </header>

    <!-- Split layout -->
    <div class="explorer">
      <!-- Left panel -->
      <div class="explorer__left" :style="{ width: `${leftWidth}px` }">
        <FolderTree />
      </div>

      <!-- Resize handle -->
      <div
        class="explorer__divider"
        @mousedown="startResize"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
      />

      <!-- Right panel -->
      <RightPanel />
    </div>

    <!-- Status bar -->
    <footer class="status-bar">
      <template v-if="store.selectedFolderDetails">
        <span>{{ store.selectedFolderDetails.subfolders.length }} folder(s)</span>
        <span class="status-bar__sep">·</span>
        <span>{{ store.selectedFolderDetails.files.length }} file(s)</span>
      </template>
      <template v-else>
        <span>{{ store.folderTree.length }} root folder(s)</span>
      </template>
    </footer>
  </div>
</template>

<style>
/* ============================================================
   Global design tokens
   ============================================================ */
:root {
  --color-bg: #1a1d21;
  --color-panel-left: #1e2227;
  --color-panel-right: #22262c;
  --color-border: #2e333b;
  --color-hover: rgba(255,255,255,0.05);
  --color-hover-strong: rgba(255,255,255,0.08);
  --color-selected: #0066cc;
  --color-selected-text: #fff;
  --color-text-primary: #d4d9e0;
  --color-text-secondary: #6b7280;
  --color-accent: #0066cc;
  --color-error: #f87171;
  --color-skeleton: rgba(255,255,255,0.06);
  --color-button: rgba(255,255,255,0.08);
  --color-titlebar: #13161a;
  --color-statusbar: #13161a;

  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 14px;
  color-scheme: dark;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #app {
  height: 100%;
  background: var(--color-bg);
  color: var(--color-text-primary);
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg);
}

.app--resizing {
  cursor: col-resize;
  user-select: none;
}

/* Title bar */
.title-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 38px;
  padding: 0 16px;
  background: var(--color-titlebar);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.title-bar__controls {
  display: flex;
  gap: 6px;
  align-items: center;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot--red { background: #ff5f57; }
.dot--yellow { background: #febc2e; }
.dot--green { background: #28c840; }

.title-bar__address {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-panel-left);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0 auto;
  width: 320px;
}

/* Split layout */
.explorer {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.explorer__left {
  flex-shrink: 0;
  overflow: hidden;
  min-width: 160px;
  max-width: 500px;
}

.explorer__divider {
  width: 4px;
  flex-shrink: 0;
  background: var(--color-border);
  cursor: col-resize;
  transition: background 0.15s;
}

.explorer__divider:hover,
.app--resizing .explorer__divider {
  background: var(--color-accent);
}

/* Status bar */
.status-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 12px;
  background: var(--color-statusbar);
  border-top: 1px solid var(--color-border);
  font-size: 11px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.status-bar__sep { opacity: 0.4; }
</style>
