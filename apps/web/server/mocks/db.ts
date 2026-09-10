import { seed } from './seed';
import type {
  CoupleRow, DailyRow, DatePlanRow, EventRow, GameSessionRow, InviteRow, JournalRow,
  LetterRow, MemberRow, MemoryRow, MilestoneRow, MoodRow, NotificationRow, PrefRow,
  UserRow, WishlistRow,
} from './types';

export interface MockDb {
  users: UserRow[];
  couples: CoupleRow[];
  members: MemberRow[];
  invites: InviteRow[];
  dailies: DailyRow[];
  memories: MemoryRow[];
  journal: JournalRow[];
  moods: MoodRow[];
  events: EventRow[];
  wishlist: WishlistRow[];
  plans: DatePlanRow[];
  milestones: MilestoneRow[];
  letters: LetterRow[];
  games: GameSessionRow[];
  notifications: NotificationRow[];
  prefs: PrefRow[];
  quietHours: { from: string; to: string } | null;
  plan: 'FREE' | 'PREMIUM_MONTHLY' | 'PREMIUM_YEARLY';
}

/**
 * In-memory store, reset saat restart (§3). Disimpan di globalThis supaya
 * HMR dev tidak membuat dua instance yang saling tidak melihat.
 */
const KEY = '__coupleMockDb__';
const g = globalThis as typeof globalThis & { [KEY]?: MockDb };

export const db: MockDb = g[KEY] ?? (g[KEY] = seed());

export function reset() {
  g[KEY] = seed();
  Object.assign(db, g[KEY]);
}

/** UUID v4 acak. Kontrak memakai z.string().uuid(), jadi id TIDAK boleh berprefiks. */
export function uid(): string {
  const hex = (n: number) => Array.from({ length: n }, () =>
    Math.floor(Math.random() * 16).toString(16)).join('');
  return `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
}

/** Signed URL mock — bucket asli private, di Fase 2 diganti Supabase signed URL. */
export function mediaUrl(storagePath: string): string {
  return `/api/mock/media/${encodeURIComponent(storagePath)}`;
}

export function avatarUrl(path: string | null): string | null {
  return path ? mediaUrl(path) : null;
}
