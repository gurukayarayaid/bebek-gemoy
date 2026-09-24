import bankBawaan from "@/data/soal-bank.json";
import type { BankSoal, ItemBank, Level, OperasiHitung, RentangAngka } from "@/types";

const LEVEL: Level[] = ["mudah", "sedang", "sulit"];
const OPERASI: OperasiHitung[] = ["tambah", "kurang", "kali", "bagi"];

function rentangValid(r: unknown): r is RentangAngka {
  if (!r || typeof r !== "object") return false;
  const o = r as Record<string, unknown>;
  const angka = (k: string) => typeof o[k] === "number" && Number.isFinite(o[k] as number);
  if (angka("aMin") && angka("aMax") && angka("bMin") && angka("bMax")) return true;
  if (angka("hMin") && angka("hMax") && angka("bMin") && angka("bMax")) return true;
  return false;
}

/** Menambal data JSON yang diedit manual agar tidak membuat aplikasi rusak. */
function normalisasi(data: unknown): BankSoal | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Partial<BankSoal>;
  const asli = bankBawaan as unknown as BankSoal;

  const rentang: BankSoal["rentang"] = {};
  const sumberRentang = (d.rentang ?? asli.rentang) as BankSoal["rentang"];
  for (let kelas = 1; kelas <= 6; kelas++) {
    const k = String(kelas);
    const bawaanKelas = asli.rentang?.[k];
    if (!bawaanKelas) continue;
    rentang[k] = {} as BankSoal["rentang"][string];
    for (const op of OPERASI) {
      rentang[k][op] = {} as Record<Level, RentangAngka>;
      for (const lv of LEVEL) {
        const kandidat = sumberRentang?.[k]?.[op]?.[lv];
        rentang[k][op][lv] = rentangValid(kandidat) ? kandidat : bawaanKelas[op]?.[lv];
      }
    }
  }

  const bank: ItemBank[] = Array.isArray(d.bank)
    ? d.bank.filter(
        (i): i is ItemBank =>
          !!i &&
          typeof i === "object" &&
          typeof (i as ItemBank).teks === "string" &&
          Number.isFinite((i as ItemBank).jawaban) &&
          typeof (i as ItemBank).kelas === "number" &&
          OPERASI.includes((i as ItemBank).operasi) &&
          LEVEL.includes((i as ItemBank).level),
      )
    : asli.bank;

  if (!Object.keys(rentang).length) return null;

  return {
    versi: typeof d.versi === "string" ? d.versi : asli.versi,
    judul: typeof d.judul === "string" ? d.judul : asli.judul,
    keterangan: d.keterangan ?? asli.keterangan,
    diperbarui: d.diperbarui ?? asli.diperbarui,
    aturan: {
      langkahMenang: Number(d.aturan?.langkahMenang) || asli.aturan.langkahMenang,
      maksSalahGantiSoal: Number(d.aturan?.maksSalahGantiSoal) || asli.aturan.maksSalahGantiSoal,
      panjangJawabanMaks: Number(d.aturan?.panjangJawabanMaks) || asli.aturan.panjangJawabanMaks,
    },
    rentang,
    bank,
  };
}

export interface HasilMuat {
  bank: BankSoal;
  sumber: "berkas-online" | "bawaan-aplikasi";
  pesan?: string;
}

/**
 * Memuat database soal dari `data/soal.json` (ikut ter-deploy ke GitHub Pages).
 * Kalau berkas tidak ada / gagal diakses, otomatis pakai salinan bawaan di dalam bundle.
 */
export async function muatBankSoal(): Promise<HasilMuat> {
  const fallback: HasilMuat = {
    bank: bankBawaan as unknown as BankSoal,
    sumber: "bawaan-aplikasi",
  };

  const env = (import.meta as unknown as { env?: { BASE_URL?: string } }).env;
  const basis = String(env?.BASE_URL ?? "/").replace(/\/+$/, "");
  const url = `${basis}/data/soal.json`;

  try {
    const kontrol = new AbortController();
    const waktu = window.setTimeout(() => kontrol.abort(), 4000);
    const res = await fetch(url, { signal: kontrol.signal, cache: "no-store" });
    window.clearTimeout(waktu);
    if (!res.ok) return { ...fallback, pesan: `data/soal.json (${res.status}) — memakai bank soal bawaan.` };
    const json = await res.json();
    const hasil = normalisasi(json);
    if (!hasil) return { ...fallback, pesan: "Struktur data/soal.json tidak dikenali — memakai bank soal bawaan." };
    return { bank: hasil, sumber: "berkas-online" };
  } catch {
    return { ...fallback, pesan: "data/soal.json tidak ditemukan — memakai bank soal bawaan." };
  }
}
