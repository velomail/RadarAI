export const GUEST_USED_COOKIE = 'radar_guest_used';
export const GUEST_USED_STORAGE_KEY = 'radar_guest_used';
export const DEMO_SESSION_COOKIE = 'radar_demo_session';
export const GUEST_LIMIT_ERROR = 'GUEST_LIMIT';

export function isGuestLimitError(message: string): boolean {
  return message === GUEST_LIMIT_ERROR || message.includes(GUEST_LIMIT_ERROR);
}

export function readGuestUsedFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(GUEST_USED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markGuestUsedInStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_USED_STORAGE_KEY, '1');
  } catch {
    /* ignore quota / private mode */
  }
}
