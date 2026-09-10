import { z } from 'zod';
import { IsoDateTime, Uuid } from './common';

export const GameKeySchema = z.enum(['know-me', 'this-or-that', 'would-you-rather', 'guess']);
export type GameKey = z.infer<typeof GameKeySchema>;

export const GameSchema = z.object({
  key: GameKeySchema,
  title: z.string(),
  description: z.string(),
  emoji: z.string(),
  roundCount: z.number().int().positive(),
  lastPlayedAt: IsoDateTime.nullable(),
  bestScore: z.number().int().nonnegative().nullable(),
});
export type Game = z.infer<typeof GameSchema>;

export const GameRoundSchema = z.object({
  id: Uuid,
  index: z.number().int().nonnegative(),
  prompt: z.string(),
  options: z.array(z.object({ id: z.string(), label: z.string() })).min(2).max(4),
});
export type GameRound = z.infer<typeof GameRoundSchema>;

export const GameSessionSchema = z.object({
  id: Uuid,
  key: GameKeySchema,
  rounds: z.array(GameRoundSchema),
  /** jawabanku per roundId */
  myPicks: z.record(z.string(), z.string()),
  /** null sampai partner selesai — pola gating sama dengan daily reveal */
  partnerPicks: z.record(z.string(), z.string()).nullable(),
  score: z.number().int().nonnegative().nullable(),
  finishedAt: IsoDateTime.nullable(),
  createdAt: IsoDateTime,
});
export type GameSession = z.infer<typeof GameSessionSchema>;

export const SubmitGamePicksSchema = z.object({
  picks: z.record(z.string(), z.string()),
  finish: z.boolean().default(false),
});

export const GAMES_PATHS = {
  list: '/games',
  sessions: (key: string) => `/games/${key}/sessions`,
  sessionById: (id: string) => `/games/sessions/${id}`,
} as const;
