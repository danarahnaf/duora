import type {
  CalendarEvent, Couple, DailyToday, JournalEntry, LetterDetail, LetterListItem, Me,
  Memory, Milestone, MoodCheckin, Notification, PublicUser, WishlistItem, DatePlan,
} from '@couple/contracts';
import {
  CalendarEventSchema, CoupleSchema, JournalEntrySchema, LetterDetailSchema,
  LetterListItemSchema, MeSchema, MemorySchema, MilestoneSchema, MoodCheckinSchema,
  NotificationSchema, PublicUserSchema, WishlistItemSchema, DatePlanSchema,
} from '@couple/contracts';
import type { z } from 'zod';
import { avatarUrl, db, mediaUrl } from './db';
import { diffYmd, serverLocalDate } from '../utils/clock';
import type {
  CoupleRow, DailyRow, EventRow, JournalRow, LetterRow, MemoryRow, MilestoneRow,
  MoodRow, NotificationRow, UserRow, WishlistRow, DatePlanRow,
} from './types';
import { questionForDate } from './questions';

/**
 * Mock server ikut MEMVALIDASI keluarannya sendiri terhadap kontrak.
 * Kalau seed atau mapper melenceng, ketahuan sekarang — bukan nanti di Fase 2
 * saat NestJS harus mencocokkan bentuk yang sama.
 */
function out<T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> {
  const res = schema.safeParse(value);
  if (!res.success) {
    throw createError({
      statusCode: 500,
      data: {
        statusCode: 500,
        code: 'CONTRACT_DRIFT',
        message: `Respons mock tidak sesuai kontrak: ${res.error.issues.map(i => `${i.path.join('.')} ${i.message}`).join(', ')}`,
      },
    });
  }
  return res.data;
}

export function toPublicUser(u: UserRow): PublicUser {
  return out(PublicUserSchema, { id: u.id, displayName: u.displayName, avatarUrl: avatarUrl(u.avatarPath) });
}

export function toMe(u: UserRow): Me {
  return out(MeSchema, {
    ...toPublicUser(u),
    email: u.email,
    timezone: u.timezone,
    hasCouple: db.members.some(m => m.userId === u.id),
    createdAt: u.createdAt,
  });
}

export function toCouple(c: CoupleRow): Couple {
  const members = db.members
    .filter(m => m.coupleId === c.id)
    .map((m) => {
      const user = db.users.find(u => u.id === m.userId)!;
      return { user: toPublicUser(user), role: m.role, joinedAt: m.joinedAt };
    });

  return out(CoupleSchema, {
    id: c.id,
    name: c.name,
    photoUrl: c.photoPath ? mediaUrl(c.photoPath) : null,
    relationshipDate: c.relationshipDate,
    relationshipDateLabel: c.relationshipDateLabel,
    theme: c.theme,
    timezone: c.timezone,
    // dihitung server, bukan browser (§6.6)
    daysTogether: Math.max(0, diffYmd(c.relationshipDate, serverLocalDate(c.timezone))),
    streakCount: c.streakCount,
    members,
    isComplete: members.length === 2,
    createdAt: c.createdAt,
  });
}

/**
 * Reveal gate ada DI SERVER (§6.2). `answers` tetap null sampai keduanya menjawab,
 * jadi jawaban partner tidak pernah terlihat di network tab.
 */
export function toDailyToday(row: DailyRow, myId: string): DailyToday {
  const q = questionForDate(row.localDate);
  const both = row.answers.length === 2;
  return {
    questionId: q.id,
    category: q.category,
    text: q.text,
    localDate: row.localDate,
    myAnswer: row.answers.find(a => a.authorId === myId) ?? null,
    partnerAnswered: row.answers.some(a => a.authorId !== myId),
    revealed: both,
    answers: both ? row.answers : null,
  };
}

export function toMemory(m: MemoryRow): Memory {
  return out(MemorySchema, {
    id: m.id,
    type: m.type,
    caption: m.caption,
    happenedAt: m.happenedAt,
    location: m.location,
    isFavorite: m.isFavorite,
    createdById: m.createdById,
    createdAt: m.createdAt,
    media: m.media.map(md => ({
      id: md.id,
      storagePath: md.storagePath,
      url: mediaUrl(md.storagePath),
      width: md.width,
      height: md.height,
    })),
  });
}

export function toJournal(j: JournalRow): JournalEntry {
  return out(JournalEntrySchema, {
    id: j.id,
    title: j.title,
    body: j.body,
    visibility: j.visibility,
    authorId: j.authorId,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
  });
}

export function toMood(m: MoodRow): MoodCheckin {
  return out(MoodCheckinSchema, {
    id: m.id, userId: m.userId, level: m.level, note: m.note,
    localDate: m.localDate, createdAt: m.createdAt,
  });
}

export function toEvent(e: EventRow): CalendarEvent {
  return out(CalendarEventSchema, {
    id: e.id, title: e.title, category: e.category, date: e.date, time: e.time,
    location: e.location, budgetIdr: e.budgetIdr, notes: e.notes,
    reminderMinutes: e.reminderMinutes, isAllDay: e.isAllDay,
    createdById: e.createdById, createdAt: e.createdAt,
  });
}

export function toWishlist(w: WishlistRow): WishlistItem {
  return out(WishlistItemSchema, {
    id: w.id, title: w.title, note: w.note, estimatedIdr: w.estimatedIdr,
    isDone: w.isDone, addedById: w.addedById, doneAt: w.doneAt, createdAt: w.createdAt,
  });
}

export function toPlan(p: DatePlanRow): DatePlan {
  return out(DatePlanSchema, {
    id: p.id, title: p.title, status: p.status, source: p.source,
    input: p.input, steps: p.steps, totalIdr: p.totalIdr, createdAt: p.createdAt,
  });
}

export function toMilestone(m: MilestoneRow): Milestone {
  return out(MilestoneSchema, {
    id: m.id, title: m.title, date: m.date, note: m.note, icon: m.icon,
    isAutoGenerated: m.isAutoGenerated, createdAt: m.createdAt,
  });
}

/** Letter gating (§6.3): body hanya keluar kalau sudah lewat unlockOn. */
export function isLetterLocked(l: LetterRow, todayYmd: string): boolean {
  return diffYmd(todayYmd, l.unlockOn) > 0;
}

export function toLetterListItem(l: LetterRow, todayYmd: string): LetterListItem {
  return out(LetterListItemSchema, {
    id: l.id, title: l.title, authorId: l.authorId, unlockType: l.unlockType,
    unlockOn: l.unlockOn, isLocked: isLetterLocked(l, todayYmd),
    openedAt: l.openedAt, createdAt: l.createdAt,
  });
}

export function toLetterDetail(l: LetterRow, todayYmd: string): LetterDetail {
  const locked = isLetterLocked(l, todayYmd);
  return out(LetterDetailSchema, { ...toLetterListItem(l, todayYmd), body: locked ? null : l.body });
}

export function toNotification(n: NotificationRow): Notification {
  return out(NotificationSchema, {
    id: n.id, category: n.category, title: n.title, body: n.body,
    link: n.link, readAt: n.readAt, createdAt: n.createdAt,
  });
}
