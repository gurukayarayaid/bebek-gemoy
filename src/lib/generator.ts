import {
  SIMBOL_OPERASI,
  type BankSoal,
  type ItemBank,
  type Level,
  type OperasiHitung,
  type PilihanOperasi,
  type RentangAngka,
  type Soal,
} from "@/types";

/** Pembangkit angka acak yang deterministik (mulberry32). */
function mulberry32(benih: number) {
  let a = benih >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function acakAntara(rng: () => number, min: number, max: number) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.floor(rng() * (hi - lo + 1)) + lo;
}

export function benihAcak() {
  return Math.floor(Math.random() * 2 ** 31);
}

const DAFTAR_OPERASI: OperasiHitung[] = ["tambah", "kurang", "kali", "bagi"];

const RENTANG_CADANGAN: RentangAngka = { aMin: 1, aMax: 10, bMin: 1, bMax: 9 };

/** Kalimat cerita ringan supaya soal tidak melulu angka polos. */
const TEMPLATE_CERITA: Record<OperasiHitung, string[]> = {
  tambah: [
    "Di kolam ada {a} ekor bebek gemoy. Datang lagi {b} ekor. Berapa banyak bebek sekarang?",
    "Peternak mengumpulkan {a} butir telur, lalu menemukan {b} butir lagi. Berapa telur semuanya?",
  ],
  kurang: [
    "Ada {a} biji jagung di lumbung. Dimakan bebek {b} biji. Berapa biji jagung yang tersisa?",
    "Sebanyak {a} anak bebek bermain di sawah, lalu {b} ekor pulang ke kandang. Berapa yang masih bermain?",
  ],
  kali: [
    "Ada {a} keranjang telur. Setiap keranjang berisi {b} butir. Berapa banyak butir telur seluruhnya?",
    "Setiap kandang berisi {b} ekor bebek. Jika ada {a} kandang, berapa banyak bebek semuanya?",
  ],
  bagi: [
    "Sebanyak {a} ekor ikan dibagi sama rata kepada {b} bebek. Setiap bebek mendapat berapa ikan?",
    "Ada {a} butir telur disusun ke dalam {b} rak sama banyak. Setiap rak berisi berapa butir?",
  ],
};

export function pilihOperasi(pilihan: PilihanOperasi, rng: () => number): OperasiHitung {
  if (pilihan !== "campur") return pilihan;
  return DAFTAR_OPERASI[Math.floor(rng() * DAFTAR_OPERASI.length)];
}

function ambilRentang(bank: BankSoal, kelas: number, operasi: OperasiHitung, level: Level): RentangAngka {
  const perKelas = bank.rentang?.[String(kelas)];
  const perOperasi = perKelas?.[operasi];
  return perOperasi?.[level] ?? RENTANG_CADANGAN;
}

function cariSoalKurasi(bank: BankSoal, kelas: number, operasi: OperasiHitung, level: Level): ItemBank[] {
  if (!Array.isArray(bank.bank)) return [];
  const sama = bank.bank.filter((i) => i.kelas === kelas && i.operasi === operasi && i.level === level);
  if (sama.length) return sama;
  // Kalau level persis tidak ada, pinjam dari level lain pada kelas & operasi yang sama.
  return bank.bank.filter((i) => i.kelas === kelas && i.operasi === operasi);
}

function susun(a: number, b: number, operasi: OperasiHitung): number {
  switch (operasi) {
    case "tambah":
      return a + b;
    case "kurang":
      return a - b;
    case "kali":
      return a * b;
    case "bagi":
      return b === 0 ? 0 : a / b;
  }
}

export interface ParamSoal {
  bank: BankSoal;
  kelas: number;
  operasi: PilihanOperasi;
  level: Level;
  benih: number;
  urutan: number;
  slot?: number;
  /** Soal sebelumnya — dipakai agar soal berikutnya tidak identik. */
  sebelum?: Soal | null;
  /** ID soal terakhir yang sudah dipakai pemain (anti pengulangan beruntun). */
  riwayat?: string[];
}

function sama(a: Soal, b: Soal | null | undefined): boolean {
  if (!b) return false;
  return a.id === b.id && a.jawaban === b.jawaban && a.teks === b.teks && a.tampilan === b.tampilan;
}

function perluHindari(p: ParamSoal, soal: Soal): boolean {
  if (sama(soal, p.sebelum)) return true;
  const riwayat = p.riwayat ?? [];
  if (riwayat.includes(soal.id)) return true;
  // bukti teks/tampilan sama walau id beda
  return riwayat.some((id) => id === `teks:${soal.teks}` && soal.teks !== "");
}

function tandRiwayat(soal: Soal): string {
  return soal.teks ? `teks:${soal.teks}` : soal.id;
}

function buatSoalMentah(p: ParamSoal, campurSeed = 0): Soal {
  const seed =
    (p.benih ^ Math.imul(p.urutan + 1 + campurSeed * 0x9e37, 0x9e3779b1) ^ Math.imul((p.slot ?? 0) + 7, 0x85ebca6b)) >>> 0;
  const rng = mulberry32(seed);
  const operasi = pilihOperasi(p.operasi, rng);
  const kurasi = cariSoalKurasi(p.bank, p.kelas, operasi, p.level);

  // 45% peluang memakai soal cerita hasil kurasi guru (bila tersedia).
  if (kurasi.length && rng() < 0.45) {
    const mulai = Math.floor(rng() * kurasi.length);
    let item: ItemBank | null = null;
    const riwayat = p.riwayat ?? [];
    for (let i = 0; i < kurasi.length; i++) {
      const kandidat = kurasi[(mulai + i) % kurasi.length];
      const barusan = p.sebelum?.id === kandidat.id;
      const diRiwayat = riwayat.includes(kandidat.id);
      if (!barusan && !diRiwayat) {
        item = kandidat;
        break;
      }
    }
    // Semua kandidat baru saja dipakai → pakai generator supaya soal tetap berganti.
    if (item) {
      return {
        id: item.id,
        teks: item.teks,
        tampilan: "",
        jawaban: item.jawaban,
        operasi: item.operasi,
        level: item.level,
        kelas: item.kelas,
        jenis: "cerita",
      };
    }
  }

  const r = ambilRentang(p.bank, p.kelas, operasi, p.level);
  let a: number;
  let b: number;

  if (operasi === "bagi") {
    const h = acakAntara(rng, r.hMin ?? 1, r.hMax ?? Math.max(1, r.aMax));
    b = acakAntara(rng, Math.max(2, r.bMin), Math.max(2, r.bMax));
    a = h * b;
  } else if (operasi === "kurang") {
    a = acakAntara(rng, r.aMin, r.aMax);
    b = acakAntara(rng, Math.min(r.bMin, a), Math.min(r.bMax, a));
  } else {
    a = acakAntara(rng, r.aMin, r.aMax);
    b = acakAntara(rng, r.bMin, r.bMax);
  }

  const jawaban = susun(a, b, operasi);

  // 22% peluang dikemas jadi soal cerita generik (level sedang & sulit lebih sering).
  const peluangCerita = p.level === "mudah" ? 0.12 : p.level === "sedang" ? 0.22 : 0.32;
  if (rng() < peluangCerita) {
    const daftar = TEMPLATE_CERITA[operasi];
    const teks = daftar[Math.floor(rng() * daftar.length)]
      .replace("{a}", a.toLocaleString("id-ID"))
      .replace("{b}", b.toLocaleString("id-ID"));
    return {
      id: `gen-${p.kelas}-${operasi}-${a}-${b}`,
      teks,
      tampilan: "",
      jawaban,
      operasi,
      level: p.level,
      kelas: p.kelas,
      jenis: "cerita",
    };
  }

  return {
    id: `gen-${p.kelas}-${operasi}-${a}-${b}`,
    teks: "",
    tampilan: `${a.toLocaleString("id-ID")} ${SIMBOL_OPERASI[operasi]} ${b.toLocaleString("id-ID")}`,
    jawaban,
    operasi,
    level: p.level,
    kelas: p.kelas,
    jenis: "hitungan",
  };
}

/** Membuat satu soal. Deterministik; tidak mengulang soal di riwayat bila memungkinkan. */
export function buatSoal(p: ParamSoal): Soal {
  for (let percobaan = 0; percobaan < 24; percobaan++) {
    const soal = buatSoalMentah(p, percobaan);
    if (!perluHindari(p, soal) && !p.riwayat?.includes(tandRiwayat(soal))) return soal;
  }
  return buatSoalMentah(p, 0);
}

export function cekJawaban(soal: Soal, input: string): boolean {
  if (!input.trim()) return false;
  const nilai = Number(input.replace(/[.\s]/g, ""));
  if (!Number.isFinite(nilai)) return false;
  return nilai === soal.jawaban;
}

export function formatAngka(n: number) {
  return n.toLocaleString("id-ID");
}
