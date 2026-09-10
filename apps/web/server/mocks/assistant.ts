import type { AssistantKind } from '@couple/contracts';

/**
 * Respons kaleng dari fixture (§6, batch 1C). TIDAK ADA SDK AI di Fase 1.
 * Kontrak `isMock: true` memaksa UI menampilkan label "contoh".
 */
export const CHIPS: Record<AssistantKind, string[]> = {
  CHAT: [
    'Ide kencan hemat akhir pekan ini',
    'Bantu aku minta maaf dengan tulus',
    'Pertanyaan untuk ngobrol malam ini',
    'Rencana anniversary 3 tahun',
  ],
  DATE_IDEA: [
    'Budget Rp150rb, jalan kaki',
    'Hujan, di rumah saja',
    'Pagi, olahraga ringan',
    'Ulang tahun, agak spesial',
  ],
  QUESTION: [
    'Pertanyaan ringan',
    'Pertanyaan agak dalam',
    'Pertanyaan soal masa depan',
    'Pertanyaan lucu',
  ],
};

const REPLIES: Record<AssistantKind, string[]> = {
  CHAT: [
    'Coba tiga langkah: sebut satu hal spesifik yang kamu syukuri hari ini, tanyakan satu hal yang kamu belum tahu tentang harinya, lalu tawarkan satu hal konkret — bukan "ada yang bisa aku bantu?", tapi "aku bikinin kopi ya".',
    'Kalau tujuanmu minta maaf, jangan mulai dari penjelasan. Mulai dari efeknya: "aku sadar itu bikin kamu merasa nggak dianggap." Penjelasan boleh menyusul, tapi setelah dia merasa didengar.',
    'Untuk ngobrol malam ini: tanyakan bagian mana dari minggu ini yang paling ingin dia ulang. Pertanyaannya kecil, tapi jawabannya biasanya membuka banyak hal.',
  ],
  DATE_IDEA: [
    'Rencana Rp150rb, jalan kaki: mulai 16.30 di taman terdekat (gratis), 17.30 jajan dua porsi berbeda di kaki lima (±Rp50rb), 18.30 kopi di kedai kecil dan duduk sampai gelas kosong (±Rp60rb). Sisanya buffer.',
    'Hari hujan di rumah: masak satu resep yang kalian berdua belum pernah coba, aturannya cuma satu — tidak boleh lihat resep lain di tengah jalan. Setelah makan, tukar playlist dan ceritakan alasan tiap lagu dipilih.',
    'Pagi ringan: jalan 30 menit tanpa HP, sarapan di tempat yang ramai (biasanya enak), pulang lewat jalan yang belum pernah kalian lewati.',
  ],
  QUESTION: [
    'Hari biasa mana dari bulan ini yang ternyata paling kamu ingat, dan apa yang membuatnya nempel?',
    'Kalau kita boleh menghapus satu kekhawatiran dari kepalamu selama sebulan, kamu mau hapus yang mana?',
    'Kebiasaan kecil apa yang ingin kamu bawa ke lima tahun depan?',
  ],
};

export function mockReply(kind: AssistantKind, prompt: string): string {
  const pool = REPLIES[kind];
  const seed = [...prompt].reduce((a, c) => a + c.charCodeAt(0), 0);
  return pool[seed % pool.length] ?? pool[0]!;
}
