import type { GameKey } from '@couple/contracts';

export interface RoundDef {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
}

export const GAME_META: Record<GameKey, { title: string; description: string; emoji: string }> = {
  'know-me': {
    title: 'How Well Do You Know Me',
    description: 'Tebak jawaban partner. Skor muncul setelah kalian berdua selesai.',
    emoji: '🧠',
  },
  'this-or-that': {
    title: 'This or That',
    description: 'Pilih cepat, lihat seberapa mirip selera kalian.',
    emoji: '⚡',
  },
  'would-you-rather': {
    title: 'Would You Rather',
    description: 'Dilema receh sampai berat. Bahan obrolan malam.',
    emoji: '🤔',
  },
  guess: {
    title: 'Guess My Answer',
    description: 'Aku menjawab, kamu menebak. Kebalikannya juga.',
    emoji: '🎯',
  },
};

export const GAME_ROUNDS: Record<GameKey, RoundDef[]> = {
  'know-me': [
    { id: 'km-1', prompt: 'Minuman yang paling sering aku pesan?', options: [{ id: 'a', label: 'Kopi susu' }, { id: 'b', label: 'Matcha latte' }, { id: 'c', label: 'Teh tawar' }, { id: 'd', label: 'Air putih saja' }] },
    { id: 'km-2', prompt: 'Kalau libur panjang, aku lebih memilih…', options: [{ id: 'a', label: 'Gunung' }, { id: 'b', label: 'Pantai' }, { id: 'c', label: 'Kota baru' }, { id: 'd', label: 'Rumah saja' }] },
    { id: 'km-3', prompt: 'Film yang bisa aku tonton berkali-kali?', options: [{ id: 'a', label: 'Romantis' }, { id: 'b', label: 'Animasi' }, { id: 'c', label: 'Thriller' }, { id: 'd', label: 'Dokumenter' }] },
    { id: 'km-4', prompt: 'Hadiah yang paling bikin aku senang?', options: [{ id: 'a', label: 'Surat tulisan tangan' }, { id: 'b', label: 'Makanan favorit' }, { id: 'c', label: 'Barang yang lama diincar' }, { id: 'd', label: 'Waktu berdua tanpa HP' }] },
    { id: 'km-5', prompt: 'Cara aku paling cepat tenang setelah hari berat?', options: [{ id: 'a', label: 'Dipeluk' }, { id: 'b', label: 'Didengarkan' }, { id: 'c', label: 'Dibiarkan dulu' }, { id: 'd', label: 'Diajak jalan' }] },
  ],
  'this-or-that': [
    { id: 'tt-1', prompt: 'Pagi atau malam?', options: [{ id: 'a', label: 'Pagi' }, { id: 'b', label: 'Malam' }] },
    { id: 'tt-2', prompt: 'Makan di rumah atau keluar?', options: [{ id: 'a', label: 'Di rumah' }, { id: 'b', label: 'Keluar' }] },
    { id: 'tt-3', prompt: 'Rencana rapi atau spontan?', options: [{ id: 'a', label: 'Rapi' }, { id: 'b', label: 'Spontan' }] },
    { id: 'tt-4', prompt: 'Kopi atau teh?', options: [{ id: 'a', label: 'Kopi' }, { id: 'b', label: 'Teh' }] },
    { id: 'tt-5', prompt: 'Pesan suara atau telepon?', options: [{ id: 'a', label: 'Pesan suara' }, { id: 'b', label: 'Telepon' }] },
    { id: 'tt-6', prompt: 'Hujan atau cerah?', options: [{ id: 'a', label: 'Hujan' }, { id: 'b', label: 'Cerah' }] },
  ],
  'would-you-rather': [
    { id: 'wr-1', prompt: 'Lebih baik…', options: [{ id: 'a', label: 'Liburan mewah 3 hari' }, { id: 'b', label: 'Liburan sederhana 2 minggu' }] },
    { id: 'wr-2', prompt: 'Lebih baik…', options: [{ id: 'a', label: 'Tinggal dekat gunung' }, { id: 'b', label: 'Tinggal dekat laut' }] },
    { id: 'wr-3', prompt: 'Lebih baik…', options: [{ id: 'a', label: 'Bisa masak apa saja' }, { id: 'b', label: 'Bisa tidur nyenyak selalu' }] },
    { id: 'wr-4', prompt: 'Lebih baik…', options: [{ id: 'a', label: 'Kerja dari rumah selamanya' }, { id: 'b', label: 'Kantor tapi 4 hari seminggu' }] },
    { id: 'wr-5', prompt: 'Lebih baik…', options: [{ id: 'a', label: 'Punya rumah kecil milik sendiri' }, { id: 'b', label: 'Sewa rumah besar' }] },
  ],
  guess: [
    { id: 'gs-1', prompt: 'Menurutku, tempat kencan favoritmu adalah…', options: [{ id: 'a', label: 'Kafe tenang' }, { id: 'b', label: 'Bioskop' }, { id: 'c', label: 'Taman kota' }, { id: 'd', label: 'Pasar malam' }] },
    { id: 'gs-2', prompt: 'Menurutku, hal pertama yang kamu perhatikan dari orang…', options: [{ id: 'a', label: 'Cara bicara' }, { id: 'b', label: 'Senyum' }, { id: 'c', label: 'Sepatu' }, { id: 'd', label: 'Aroma parfum' }] },
    { id: 'gs-3', prompt: 'Menurutku, kalau aku telat kamu akan…', options: [{ id: 'a', label: 'Menunggu tenang' }, { id: 'b', label: 'Sibuk chat' }, { id: 'c', label: 'Cari makan dulu' }, { id: 'd', label: 'Ngambek lucu' }] },
    { id: 'gs-4', prompt: 'Menurutku, mimpi kecilmu tahun ini…', options: [{ id: 'a', label: 'Belajar hal baru' }, { id: 'b', label: 'Naik gunung' }, { id: 'c', label: 'Nabung untuk rumah' }, { id: 'd', label: 'Punya waktu lebih tenang' }] },
    { id: 'gs-5', prompt: 'Menurutku, kata yang paling menggambarkanmu…', options: [{ id: 'a', label: 'Hangat' }, { id: 'b', label: 'Teliti' }, { id: 'c', label: 'Berani' }, { id: 'd', label: 'Sabar' }] },
  ],
};
