import { DEFAULT_SEARCH_FOCUS, isValidSearchFocus } from '@/lib/search-focus';

export function parseSearchFocus(formData: FormData): string {
  const raw = formData.get('search_focus')?.toString() || DEFAULT_SEARCH_FOCUS;
  return isValidSearchFocus(raw) ? raw : DEFAULT_SEARCH_FOCUS;
}

export function parseQueriesFromForm(formData: FormData, searchFocus: string): string[] {
  const raw = formData.get('queries')?.toString()?.trim() || '';
  if (searchFocus !== 'auto' && raw.length < 2) {
    throw new Error('Add at least one keyword for your selected focus.');
  }
  return raw
    .split(',')
    .map((q) => q.trim())
    .filter(Boolean);
}
