// ============================================================
// Component tests for FolderTreeItem
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import FolderTreeItem from '../src/components/FolderTree/FolderTreeItem.vue';
import { useExplorerStore } from '../src/stores/explorer.store';
import type { FolderNode } from '@windows-explorer/shared';

const mockFolder: FolderNode = {
  id: 1,
  name: 'Documents',
  parentId: null,
  path: '/1/',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  children: [
    {
      id: 2,
      name: 'Work',
      parentId: 1,
      path: '/1/2/',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      children: [],
    },
  ],
};

describe('FolderTreeItem', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders folder name', () => {
    const wrapper = mount(FolderTreeItem, {
      props: { folder: mockFolder, depth: 0 },
    });
    expect(wrapper.text()).toContain('Documents');
  });

  it('shows chevron when folder has children', () => {
    const wrapper = mount(FolderTreeItem, {
      props: { folder: mockFolder, depth: 0 },
    });
    const chevron = wrapper.find('.tree-item__chevron');
    expect(chevron.classes()).not.toContain('tree-item__chevron--hidden');
  });

  it('hides chevron when folder has no children', () => {
    const leafFolder = { ...mockFolder, children: [] };
    const wrapper = mount(FolderTreeItem, {
      props: { folder: leafFolder, depth: 0 },
    });
    const chevron = wrapper.find('.tree-item__chevron');
    expect(chevron.classes()).toContain('tree-item__chevron--hidden');
  });

  it('calls selectFolder on row click', async () => {
    const wrapper = mount(FolderTreeItem, {
      props: { folder: mockFolder, depth: 0 },
    });
    const store = useExplorerStore();
    store.selectFolder = vi.fn();

    await wrapper.find('.tree-item__row').trigger('click');
    expect(store.selectFolder).toHaveBeenCalledWith(1);
  });

  it('applies correct padding based on depth', () => {
    const wrapper = mount(FolderTreeItem, {
      props: { folder: mockFolder, depth: 3 },
    });
    const row = wrapper.find('.tree-item__row');
    expect(row.attributes('style')).toContain('padding-left: 56px'); // 3*16+8
  });

  it('does not render children when collapsed', () => {
    const wrapper = mount(FolderTreeItem, {
      props: { folder: mockFolder, depth: 0 },
    });
    // Default: not expanded
    expect(wrapper.find('.tree-item__children').exists()).toBe(false);
  });

  it('renders children when expanded', async () => {
    const wrapper = mount(FolderTreeItem, {
      props: { folder: mockFolder, depth: 0 },
    });
    const store = useExplorerStore();
    store.expandedIds.add(1);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.tree-item__children').exists()).toBe(true);
  });
});
