import type { PlanStep, PlannerInput } from '@couple/contracts';

/**
 * Generator rencana kencan deterministik. INI BUKAN AI — Fase 1 tidak memakai
 * SDK apa pun. Fase 3 cukup menukar implementasi ini; kontraknya sudah benar.
 */
const MOOD_TITLES: Record<PlannerInput['mood'], string> = {
  ROMANTIC: 'Kencan tenang',
  FUN: 'Kencan seru',
  CHILL: 'Kencan santai',
  ADVENTURE: 'Kencan jalan-jalan',
  FOODIE: 'Kencan kuliner',
};

const BLOCKS: Record<PlannerInput['mood'], { title: string; detail: string; share: number }[]> = {
  ROMANTIC: [
    { title: 'Jalan pelan di taman', detail: 'Mulai tanpa target. Cari bangku yang menghadap barat.', share: 0.05 },
    { title: 'Makan malam berdua', detail: 'Pilih tempat yang musiknya tidak terlalu keras.', share: 0.6 },
    { title: 'Kopi penutup', detail: 'Satu gelas, dibagi dua, ngobrol sampai gelas kosong.', share: 0.25 },
  ],
  FUN: [
    { title: 'Arcade atau bowling', detail: 'Buat aturan konyol: yang kalah bayar es krim.', share: 0.35 },
    { title: 'Makan street food', detail: 'Dua porsi berbeda, wajib tukar setengah.', share: 0.3 },
    { title: 'Foto box', detail: 'Empat pose, satu harus jelek.', share: 0.2 },
  ],
  CHILL: [
    { title: 'Kafe dengan sofa', detail: 'Bawa buku atau tidak bawa apa-apa.', share: 0.35 },
    { title: 'Piknik kecil', detail: 'Beli di minimarket, tetap terasa mewah.', share: 0.25 },
    { title: 'Nonton di rumah', detail: 'Satu film yang sudah pernah ditonton.', share: 0.15 },
  ],
  ADVENTURE: [
    { title: 'Jalan pagi ke bukit', detail: 'Berangkat sebelum terang, bawa air lebih dari perkiraan.', share: 0.2 },
    { title: 'Sarapan lokal', detail: 'Warung yang ramai biasanya benar.', share: 0.2 },
    { title: 'Susur jalan baru', detail: 'Pilih arah yang belum pernah kalian lewati.', share: 0.35 },
  ],
  FOODIE: [
    { title: 'Sarapan legendaris', detail: 'Datang 15 menit sebelum buka.', share: 0.2 },
    { title: 'Kopi lokal', detail: 'Minta rekomendasi baristanya.', share: 0.15 },
    { title: 'Makan besar', detail: 'Pesan dua menu berbeda, jangan yang sama.', share: 0.5 },
  ],
};

const TRANSPORT_COST: Record<PlannerInput['transport'], number> = {
  WALK: 0,
  MOTORBIKE: 20_000,
  CAR: 60_000,
  PUBLIC: 16_000,
};

const START_HOUR: Record<PlannerInput['mood'], number> = {
  ROMANTIC: 17, FUN: 15, CHILL: 14, ADVENTURE: 6, FOODIE: 8,
};

export function generatePlan(input: PlannerInput): { title: string; steps: PlanStep[]; totalIdr: number } {
  const blocks = BLOCKS[input.mood];
  const transport = TRANSPORT_COST[input.transport];
  const budgetForBlocks = Math.max(0, input.budgetIdr - transport);
  const startHour = START_HOUR[input.mood];
  const perBlockHours = Math.max(1, Math.floor(input.durationHours / (blocks.length + 1)));

  const steps: PlanStep[] = [];
  let hour = startHour;

  if (transport > 0) {
    steps.push({
      time: fmt(hour, 0),
      title: `Berangkat ke ${input.area}`,
      detail: input.transport === 'PUBLIC'
        ? 'Cek jadwal terakhir untuk pulang sebelum berangkat.'
        : 'Isi bahan bakar dulu supaya tidak berhenti di tengah jalan.',
      costIdr: round(transport),
    });
    hour += 1;
  }

  blocks.forEach((b, i) => {
    steps.push({
      time: fmt(hour, i === 0 ? 0 : 30),
      title: `${b.title} · ${input.area}`,
      detail: b.detail,
      costIdr: round(budgetForBlocks * b.share),
    });
    hour += perBlockHours;
  });

  const totalIdr = steps.reduce((sum, s) => sum + s.costIdr, 0);
  return {
    title: `${MOOD_TITLES[input.mood]} di ${input.area}`,
    steps,
    totalIdr,
  };
}

function fmt(hour: number, minute: number): string {
  const h = ((hour % 24) + 24) % 24;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function round(value: number): number {
  return Math.round(value / 5_000) * 5_000;
}
