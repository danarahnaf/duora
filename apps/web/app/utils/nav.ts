import type { IconName } from '~/utils/icons';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  /** cocokkan juga route turunan */
  match?: string;
}

/** Bottom nav mobile: maksimal 5 slot. Sisanya masuk ke /settings atau hub. */
export const PRIMARY_NAV: NavItem[] = [
  { to: '/home', label: 'Home', icon: 'home' },
  { to: '/memories', label: 'Memori', icon: 'image', match: '/memories' },
  { to: '/daily', label: 'Hari ini', icon: 'chat', match: '/daily' },
  { to: '/calendar', label: 'Kalender', icon: 'calendar', match: '/calendar' },
  { to: '/settings', label: 'Setelan', icon: 'settings', match: '/settings' },
];

/** Sidebar desktop menampilkan semuanya. */
export const SECONDARY_NAV: NavItem[] = [
  { to: '/journal', label: 'Jurnal', icon: 'book', match: '/journal' },
  { to: '/mood', label: 'Mood', icon: 'smile', match: '/mood' },
  { to: '/dates/wishlist', label: 'Kencan', icon: 'heart', match: '/dates' },
  { to: '/milestones', label: 'Milestone', icon: 'star', match: '/milestones' },
  { to: '/games', label: 'Games', icon: 'sparkle', match: '/games' },
  { to: '/letters', label: 'Surat', icon: 'mail', match: '/letters' },
  { to: '/streak', label: 'Streak', icon: 'flame', match: '/streak' },
  { to: '/assistant', label: 'Asisten', icon: 'sparkle', match: '/assistant' },
  { to: '/notifications', label: 'Notifikasi', icon: 'bell', match: '/notifications' },
];

export function isActive(item: NavItem, path: string): boolean {
  return item.match ? path.startsWith(item.match) : path === item.to;
}
