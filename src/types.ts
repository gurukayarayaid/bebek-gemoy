export type OperasiHitung = "tambah" | "kurang" | "kali" | "bagi";
export type PilihanOperasi = OperasiHitung | "campur";
export type Level = "mudah" | "sedang" | "sulit";
export type WarnaPemain = "p1" | "p2" | "p3" | "p4";

export interface RentangAngka {
  aMin: number;
  aMax: number;
  bMin: number;
  bMax: number;
  hMin?: number;
  hMax?: number;
}

export interface ItemBank {
  id: string;
  kelas: number;
  operasi: OperasiHitung;
  level: Level;
  teks: string;
  jawaban: number;
}

export interface BankSoal {
  versi: string;
  judul: string;
  keterangan?: string;
  diperbarui?: string;
  aturan: {
    langkahMenang: number;
    maksSalahGantiSoal: number;
    panjangJawabanMaks: number;
  };
  rentang: Record<string, Record<OperasiHitung, Record<Level, RentangAngka>>>;
  bank: ItemBank[];
}

export interface Soal {
  id: string;
  teks: string;
  tampilan: string;
  jawaban: number;
  operasi: OperasiHitung;
  level: Level;
  kelas: number;
  jenis: "hitungan" | "cerita";
}

export interface Pengaturan {
  kelas: number;
  operasi: PilihanOperasi;
  level: Level;
  jumlahPemain: number;
  langkahMenang: number;
  soalSama: boolean;
  keyboardFisik: boolean;
  suara: boolean;
}

export interface Pemain {
  id: number;
  nama: string;
  warna: WarnaPemain;
  langkah: number;
  benar: number;
  salah: number;
  streak: number;
  streakTerbaik: number;
  urutanSoal: number;
  /** ID soal terakhir ( maks. 8 ) — dicegah muncul lagi secara beruntun. */
  riwayatSoal: string[];
  soal: Soal;
  input: string;
  salahBeruntun: number;
  umpan: "idle" | "benar" | "salah";
  lompat: boolean;
  waktuSelesai: number | null;
  peringkat: number | null;
}

export const LABEL_OPERASI: Record<PilihanOperasi, string> = {
  tambah: "Penjumlahan",
  kurang: "Pengurangan",
  kali: "Perkalian",
  bagi: "Pembagian",
  campur: "Campuran",
};

export const SIMBOL_OPERASI: Record<OperasiHitung, string> = {
  tambah: "+",
  kurang: "−",
  kali: "×",
  bagi: "÷",
};

export const LABEL_LEVEL: Record<Level, string> = {
  mudah: "Mudah",
  sedang: "Sedang",
  sulit: "Sulit",
};

export interface ProfilWarna {
  kunci: WarnaPemain;
  nama: string;
  utama: string;
  tua: string;
  muda: string;
  bulu: string;
  buluGelap: string;
  aksesori: string;
}

export const WARNA_PEMAIN: ProfilWarna[] = [
  {
    kunci: "p1",
    nama: "Merah",
    utama: "#ff5d5d",
    tua: "#d33a3a",
    muda: "#ffe3e3",
    bulu: "#ff8a8a",
    buluGelap: "#ef4747",
    aksesori: "#ffd23f",
  },
  {
    kunci: "p2",
    nama: "Kuning",
    utama: "#ffc531",
    tua: "#dd9b06",
    muda: "#fff3d0",
    bulu: "#ffd75e",
    buluGelap: "#f0ac12",
    aksesori: "#3aa0ff",
  },
  {
    kunci: "p3",
    nama: "Hijau",
    utama: "#35c46b",
    tua: "#1f9a51",
    muda: "#d8f7e3",
    bulu: "#63d98f",
    buluGelap: "#22ab5b",
    aksesori: "#ff8fb1",
  },
  {
    kunci: "p4",
    nama: "Biru",
    utama: "#3aa0ff",
    tua: "#1c78d6",
    muda: "#dcf0ff",
    bulu: "#6db9ff",
    buluGelap: "#2489ef",
    aksesori: "#b47cff",
  },
];

export const NAMA_BEBEK = ["Kuni", "Kimbul", "Kicik", "Kombur"];
