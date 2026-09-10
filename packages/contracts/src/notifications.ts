import { z } from 'zod';
import { IsoDateTime, Uuid, paginated } from './common';

export const NotificationCategorySchema = z.enum([
  'DAILY_QUESTION', 'PARTNER_ANSWERED', 'MEMORY', 'EVENT_REMINDER',
  'MOOD', 'LETTER_UNLOCKED', 'MILESTONE', 'STREAK', 'SYSTEM',
]);
export type NotificationCategory = z.infer<typeof NotificationCategorySchema>;

export const NotificationSchema = z.object({
  id: Uuid,
  category: NotificationCategorySchema,
  title: z.string(),
  body: z.string(),
  link: z.string().nullable(),
  readAt: IsoDateTime.nullable(),
  createdAt: IsoDateTime,
});
export type Notification = z.infer<typeof NotificationSchema>;

export const NotificationListSchema = paginated(NotificationSchema).extend({
  unreadCount: z.number().int().nonnegative(),
});

export const NotificationPreferenceSchema = z.object({
  category: NotificationCategorySchema,
  push: z.boolean(),
  email: z.boolean(),
});
export const NotificationPreferencesSchema = z.object({
  items: z.array(NotificationPreferenceSchema),
  quietHours: z.object({ from: z.string(), to: z.string() }).nullable(),
});
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

export const UpdateNotificationPreferencesSchema = z.object({
  items: z.array(NotificationPreferenceSchema).optional(),
  quietHours: z.object({ from: z.string(), to: z.string() }).nullable().optional(),
});

export const NOTIFICATIONS_PATHS = {
  list: '/notifications',
  read: (id: string) => `/notifications/${id}/read`,
  preferences: '/notifications/preferences',
} as const;
