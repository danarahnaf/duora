import type { GameSession } from '@couple/contracts';
import { GAME_ROUNDS } from './gamecontent';
import type { GameSessionRow } from './types';

/**
 * Gating yang sama dengan daily reveal: `partnerPicks` tetap null sampai
 * kedua orang menekan selesai. Kalau tidak, jawaban partner bisa dibaca dari
 * network tab sebelum permainan berakhir.
 */
export function toGameSession(row: GameSessionRow, myId: string): GameSession {
  const defs = GAME_ROUNDS[row.key] ?? [];
  const partnerId = Object.keys(row.picks).find(id => id !== myId) ?? null;
  const bothFinished = Boolean(row.finishedAt);

  return {
    id: row.id,
    key: row.key,
    rounds: defs.map((d, index) => ({ id: d.id, index, prompt: d.prompt, options: d.options })),
    myPicks: row.picks[myId] ?? {},
    partnerPicks: bothFinished && partnerId ? (row.picks[partnerId] ?? {}) : null,
    score: bothFinished ? row.score : null,
    finishedAt: row.finishedAt,
    createdAt: row.createdAt,
  };
}

export function scoreSession(row: GameSessionRow, members: string[]): number {
  const [a, b] = members;
  if (!a || !b) return 0;
  const pa = row.picks[a] ?? {};
  const pb = row.picks[b] ?? {};
  return row.roundIds.filter(rid => pa[rid] && pa[rid] === pb[rid]).length;
}
