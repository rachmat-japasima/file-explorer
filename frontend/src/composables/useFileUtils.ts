// ============================================================
// Composable: useFileUtils
// Shared formatting helpers for files/folders
// ============================================================

export function useFileUtils() {
  function formatSize(bytes: number): string {
    if (bytes === 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  function getMimeIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊';
    if (mimeType.includes('wordprocessing') || mimeType.includes('word')) return '📝';
    if (mimeType === 'text/markdown') return '📝';
    if (mimeType === 'application/json') return '📋';
    if (mimeType.startsWith('text/')) return '📄';
    return '📦';
  }

  function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return { formatSize, getMimeIcon, formatDate };
}
