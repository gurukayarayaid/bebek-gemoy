import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Duck from "@/components/Duck";
import InfoPage from "@/components/InfoPage";
import PlayerStation, { type AksiPapan } from "@/components/PlayerStation";
import RaceTrack from "@/components/RaceTrack";
import SetupScreen from "@/components/SetupScreen";
import WinScreen from "@/components/WinScreen";
import { benihAcak, buatSoal, cekJawaban } from "@/lib/generator";
import { muatBankSoal, type HasilMuat } from "@/lib/loader";
import { suara } from "@/lib/suara";
import {
  LABEL_LEVEL,
  LABEL_OPERASI,
  NAMA_BEBEK,
  WARNA_PEMAIN,
  type BankSoal,
  type Pemain,
  type Pengaturan,
  type Soal,
} from "@/types";

type Tahap = "memuat" | "atur" | "hitung" | "main" | "selesai";

const PENGATURAN_AWAL: Pengaturan = {
  kelas: 2,
  operasi: "tambah",
  level: "mudah",
  jumlahPemain: 4,
  langkahMenang: 10,
  soalSama: true,
  keyboardFisik: false,
  suara: true,
};

const KUNCI_PENYIMPANAN = "bebek-gemoy:pengaturan-v1";

function bacaPengaturan(): { pengaturan: Pengaturan; nama: string[] } {
  try {
    const mentah = localStorage.getItem(KUNCI_PENYIMPANAN);
    if (!mentah) return { pengaturan: PENGATURAN_AWAL, nama: [...NAMA_BEBEK] };
    const data = JSON.parse(mentah) as { pengaturan?: Partial<Pengaturan>; nama?: string[] };
    return {
      pengaturan: { ...PENGATURAN_AWAL, ...(data.pengaturan ?? {}) },
      nama: Array.isArray(data.nama) && data.nama.length === 4 ? data.nama : [...NAMA_BEBEK],
    };
  } catch {
    return { pengaturan: PENGATURAN_AWAL, nama: [...NAMA_BEBEK] };
  }
}

function detikKeWaktu(d: number) {
  const m = Math.floor(d / 60);
  const s = d % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function App() {
  const tersimpan = useMemo(bacaPengaturan, []);
  const [tahap, setTahap] = useState<Tahap>("memuat");
  const [muatan, setMuatan] = useState<HasilMuat | null>(null);
  const [pengaturan, setPengaturan] = useState<Pengaturan>(tersimpan.pengaturan);
  const [nama, setNama] = useState<string[]>(tersimpan.nama);
  const [pemain, setPemain] = useState<Pemain[]>([]);
  const [hitungan, setHitungan] = useState(3);
  const [detik, setDetik] = useState(0);
  const [juaraId, setJuaraId] = useState<number | null>(null);
  const [benih, setBenih] = useState(() => benihAcak());
  const [bukaMenu, setBukaMenu] = useState(false);
  const waktuMulai = useRef(0);
  const waktuAkhir = useRef(0);
  const [durasiMs, setDurasiMs] = useState(0);

  const bank: BankSoal = muatan?.bank ?? (null as unknown as BankSoal);
  const panjangMaks = bank?.aturan?.panjangJawabanMaks ?? 8;
  const maksSalah = bank?.aturan?.maksSalahGantiSoal ?? 3;

  /* ---------- muat database soal ---------- */
  useEffect(() => {
    let batal = false;
    (async () => {
      const hasil = await muatBankSoal();
      if (batal) return;
      setMuatan(hasil);
      setTahap("atur");
    })();
    return () => {
      batal = true;
    };
  }, []);

  /* ---------- simpan pengaturan ---------- */
  useEffect(() => {
    if (tahap === "memuat") return;
    try {
      localStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify({ pengaturan, nama }));
    } catch {
      /* penyimpanan tidak tersedia */
    }
  }, [pengaturan, nama, tahap]);

  useEffect(() => {
    suara.setAktif(pengaturan.suara);
  }, [pengaturan.suara]);

  /* ---------- hitung mundur ---------- */
  useEffect(() => {
    if (tahap !== "hitung") return;
    setHitungan(3);
    let nilai = 3;
    suara.hitungMundur(false);
    const id = window.setInterval(() => {
      nilai -= 1;
      if (nilai > 0) {
        setHitungan(nilai);
        suara.hitungMundur(false);
      } else if (nilai === 0) {
        setHitungan(0);
        suara.hitungMundur(true);
      } else {
        window.clearInterval(id);
        waktuMulai.current = Date.now();
        setTahap("main");
      }
    }, 850);
    return () => window.clearInterval(id);
  }, [tahap]);

  /* ---------- stopwatch ---------- */
  useEffect(() => {
    if (tahap !== "main") return;
    const id = window.setInterval(() => setDetik(Math.floor((Date.now() - waktuMulai.current) / 1000)), 500);
    return () => window.clearInterval(id);
  }, [tahap]);

  const soalBaru = useCallback(
    (slot: number, urutan: number, sebelum?: Soal | null, riwayat?: string[]) =>
      buatSoal({
        bank,
        kelas: pengaturan.kelas,
        operasi: pengaturan.operasi,
        level: pengaturan.level,
        benih,
        urutan,
        slot,
        sebelum,
        riwayat,
      }),
    [bank, pengaturan.kelas, pengaturan.level, pengaturan.operasi, benih],
  );

  /* ---------- mulai balapan ---------- */
  const mulaiBalapan = useCallback(() => {
    if (!bank) return;
    suara.buka();
    const benihBaru = benihAcak();
    setBenih(benihBaru);
    const slot = pengaturan.soalSama ? 0 : undefined;
    const daftar: Pemain[] = Array.from({ length: pengaturan.jumlahPemain }).map((_, i) => {
      const soalAwal = buatSoal({
        bank,
        kelas: pengaturan.kelas,
        operasi: pengaturan.operasi,
        level: pengaturan.level,
        benih: benihBaru,
        urutan: 0,
        slot: slot ?? i,
      });
      return {
        id: i,
        nama: (nama[i] ?? "").trim() || NAMA_BEBEK[i],
        warna: WARNA_PEMAIN[i].kunci,
        langkah: 0,
        benar: 0,
        salah: 0,
        streak: 0,
        streakTerbaik: 0,
        urutanSoal: 0,
        riwayatSoal: [soalAwal.teks ? `teks:${soalAwal.teks}` : soalAwal.id],
        soal: soalAwal,
        input: "",
        salahBeruntun: 0,
        umpan: "idle",
        lompat: false,
        waktuSelesai: null,
        peringkat: null,
      };
    });
    setPemain(daftar);
    setJuaraId(null);
    setDetik(0);
    setDurasiMs(0);
    setBukaMenu(false);
    setTahap("hitung");
  }, [bank, nama, pengaturan]);

  /* ---------- selesaikan balapan ---------- */
  const selesaikan = useCallback((daftar: Pemain[], idJuara: number) => {
    waktuAkhir.current = Date.now();
    setDurasiMs(waktuAkhir.current - waktuMulai.current);
    const sisa = daftar.filter((p) => p.peringkat === null);
    const urut = [...sisa].sort((a, b) => b.langkah - a.langkah || b.benar - a.benar || a.id - b.id);
    const final = daftar.map((p) => {
      if (p.peringkat !== null) return p;
      const idx = urut.findIndex((x) => x.id === p.id);
      return { ...p, peringkat: 2 + idx };
    });
    setPemain(final);
    setJuaraId(idJuara);
    suara.menang();
    window.setTimeout(() => setTahap("selesai"), 1500);
  }, []);

  /* ---------- aksi papan angka ---------- */
  const tekan = useCallback(
    (id: number, aksi: AksiPapan, nilai?: string) => {
      if (tahap !== "main" || juaraId !== null || !bank) return;
      const target = pengaturan.langkahMenang;
      const daftar = pemain.map((p) => {
        if (p.id !== id || p.peringkat !== null) return p;

        if (aksi === "angka") {
          if (p.input.length >= panjangMaks) return p;
          suara.klik();
          const gabungan = (p.input + (nilai ?? "")).replace(/^0+(?=\d)/, "");
          return { ...p, input: gabungan, umpan: "idle" as const };
        }

        if (aksi === "hapus") {
          if (!p.input) return p;
          suara.klik();
          return { ...p, input: p.input.slice(0, -1), umpan: "idle" as const };
        }

        if (aksi === "bersih") {
          if (!p.input) return p;
          suara.klik();
          return { ...p, input: "", umpan: "idle" as const };
        }

        // kirim jawaban
        if (!p.input.trim()) return p;
        if (cekJawaban(p.soal, p.input)) {
          const langkah = p.langkah + 1;
          const streak = p.streak + 1;
          const selesai = langkah >= target;
          const urutan = p.urutanSoal + 1;
          const riwayatBaru = [
            ...(p.soal.teks ? [`teks:${p.soal.teks}`] : [p.soal.id]),
            ...p.riwayatSoal,
          ].slice(0, 8);
          const soalBerikut = soalBaru(pengaturan.soalSama ? 0 : p.id, urutan, p.soal, riwayatBaru);
          suara.benar();
          window.setTimeout(() => suara.langkah(), 230);
          window.setTimeout(() => {
            setPemain((list) =>
              list.map((x) => (x.id === id ? { ...x, umpan: "idle", lompat: false } : x)),
            );
          }, selesai ? 950 : 1150);
          return {
            ...p,
            langkah,
            benar: p.benar + 1,
            streak,
            streakTerbaik: Math.max(p.streakTerbaik, streak),
            input: "",
            umpan: "benar" as const,
            lompat: true,
            urutanSoal: urutan,
            riwayatSoal: [
              ...(soalBerikut.teks ? [`teks:${soalBerikut.teks}`] : [soalBerikut.id]),
              ...riwayatBaru,
            ].slice(0, 8),
            soal: soalBerikut,
            salahBeruntun: 0,
            waktuSelesai: selesai ? Date.now() : null,
            peringkat: selesai ? 1 : null,
          };
        }

        // jawaban salah
        suara.salah();
        const salahBeruntun = p.salahBeruntun + 1;
        const gantiSoal = salahBeruntun >= maksSalah;
        window.setTimeout(() => {
          setPemain((list) =>
            list.map((x) => (x.id === id ? { ...x, umpan: "idle", lompat: false } : x)),
          );
        }, 1200);
        if (!gantiSoal) {
          return {
            ...p,
            salah: p.salah + 1,
            streak: 0,
            input: "",
            umpan: "salah" as const,
            salahBeruntun,
            urutanSoal: p.urutanSoal,
            soal: p.soal,
          };
        }
        {
          const urutan = p.urutanSoal + 1;
          const riwayatBaru = [
            ...(p.soal.teks ? [`teks:${p.soal.teks}`] : [p.soal.id]),
            ...p.riwayatSoal,
          ].slice(0, 8);
          const soalBerikut = soalBaru(pengaturan.soalSama ? 0 : p.id, urutan, p.soal, riwayatBaru);
          return {
            ...p,
            salah: p.salah + 1,
            streak: 0,
            input: "",
            umpan: "salah" as const,
            salahBeruntun: 0,
            urutanSoal: urutan,
            riwayatSoal: [
              ...(soalBerikut.teks ? [`teks:${soalBerikut.teks}`] : [soalBerikut.id]),
              ...riwayatBaru,
            ].slice(0, 8),
            soal: soalBerikut,
          };
        }
      });

      if (juaraId === null) {
        const menang = daftar.find((p) => p.peringkat === 1);
        if (menang) {
          setPemain(daftar);
          selesaikan(daftar, menang.id);
          return;
        }
      }
      setPemain(daftar);
    },
    [bank, juaraId, maksSalah, panjangMaks, pemain, pengaturan.langkahMenang, pengaturan.soalSama, soalBaru, selesaikan, tahap],
  );

  /* ---------- keyboard fisik untuk pemain 1 ---------- */
  useEffect(() => {
    if (tahap !== "main" || !pengaturan.keyboardFisik || juaraId !== null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        tekan(0, "angka", e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        tekan(0, "hapus");
      } else if (e.key === "Enter") {
        e.preventDefault();
        tekan(0, "kirim");
      } else if (e.key === "Escape") {
        e.preventDefault();
        tekan(0, "bersih");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tahap, pengaturan.keyboardFisik, juaraId, tekan]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && bukaMenu) setBukaMenu(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [bukaMenu]);

  const juara = juaraId !== null ? (pemain.find((p) => p.id === juaraId) ?? null) : null;

  const ubahPengaturan = (sebagian: Partial<Pengaturan>) => {
    suara.klik();
    setPengaturan((p) => ({ ...p, ...sebagian }));
  };

  const bukaInfo = () => {
    suara.klik();
    setBukaMenu(true);
  };

  /* ============ TAMPILAN ============ */

  if (tahap === "memuat" || !bank) {
    return (
      <div className="flex h-[100dvh] items-center justify-center overflow-hidden p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="anim-melayang">
            <Duck profil={WARNA_PEMAIN[1]} nomor={2} ukuran={96} />
          </div>
          <p className="font-display text-lg font-extrabold text-ink">Memuat bank soal…</p>
        </div>
      </div>
    );
  }

  const chipKelas = `Kelas ${pengaturan.kelas}`;
  const sumberAktif = muatan?.sumber === "berkas-online" ? "data/soal.json" : "bawaan aplikasi";

  return (
    <div className="relative h-[100dvh] overflow-hidden">
      {/* latar dekoratif */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute right-[-6rem] bottom-[-8rem] h-96 w-96 rounded-full bg-p2/25 blur-3xl" />
        <svg className="absolute bottom-0 left-0 w-full" height="120" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0 60 Q150 20 300 55 T600 50 T900 60 T1200 45 L1200 120 L0 120 Z" fill="#5ec24d" opacity="0.55" />
          <path d="M0 82 Q200 50 420 78 T860 74 T1200 84 L1200 120 L0 120 Z" fill="#349a3c" opacity="0.5" />
        </svg>
      </div>

      {tahap === "atur" ? (
        <div className="relative flex h-full min-h-0 flex-col px-3 py-3 sm:px-5 sm:py-4">
          <SetupScreen
            pengaturan={pengaturan}
            nama={nama}
            ubah={ubahPengaturan}
            ubahNama={(i, v) => setNama((n) => n.map((x, idx) => (idx === i ? v : x)))}
            mulai={mulaiBalapan}
            bukaMenu={bukaInfo}
            infoBank={{
              versi: bank.versi,
              judul: bank.judul,
              sumber: muatan?.sumber === "berkas-online" ? "data/soal.json (bisa diedit di GitHub)" : "bank soal bawaan aplikasi",
              jumlahBank: bank.bank.length,
            }}
          />
        </div>
      ) : (
        <main className="relative flex h-full min-h-0 flex-col gap-2 overflow-hidden px-2 pt-2 pb-2 sm:gap-2.5 sm:px-3 sm:pt-2.5">
          {/* HUD */}
          <div className="flex shrink-0 items-center gap-1.5 overflow-hidden rounded-2xl border-[3px] border-ink/20 bg-kertas/95 px-2 py-1.5 bayangan-kartu sm:gap-2 sm:px-3">
            <div className="flex shrink-0 items-center gap-1.5">
              <Duck profil={WARNA_PEMAIN[1]} nomor={2} ukuran={32} kedip={false} />
              <div className="hidden leading-none sm:block">
                <p className="font-display text-base leading-none font-extrabold text-ink">Bebek Gemoy</p>
                <p className="text-[9px] font-extrabold tracking-[0.16em] text-ink-3 uppercase">Balap Hitung SD</p>
              </div>
            </div>

            <div className="hidden h-8 w-[3px] rounded bg-ink/10 sm:block" />

            <div className="hidden min-w-0 flex-wrap items-center gap-1 md:flex">
              {[chipKelas, LABEL_OPERASI[pengaturan.operasi], `${LABEL_LEVEL[pengaturan.level]}`, `${pengaturan.langkahMenang} langkah`].map(
                (c) => (
                  <span
                    key={c}
                    className="font-display rounded-full border-2 border-ink/12 bg-white px-2 py-0.5 text-[10px] font-extrabold text-ink-2"
                  >
                    {c}
                  </span>
                ),
              )}
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
              <div className="font-display flex items-center gap-1 rounded-xl border-2 border-ink/12 bg-white px-2 py-1 text-sm font-extrabold text-ink tabular-nums">
                <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" fill="none" stroke="#16233d" strokeWidth="2" />
                  <path d="M8 4v4.4l3 1.8" fill="none" stroke="#16233d" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {detikKeWaktu(detik)}
              </div>

              <TombolHud
                label={pengaturan.suara ? "Matikan suara" : "Nyalakan suara"}
                onClick={() => ubahPengaturan({ suara: !pengaturan.suara })}
                aktif={pengaturan.suara}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M3 7.5h3.2L11 3.5v13L6.2 12.5H3z" fill="currentColor" />
                  {pengaturan.suara ? (
                    <path d="M14 6.5a5 5 0 0 1 0 7M16.5 4a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                  ) : (
                    <path d="M14.5 7.5l4 5M18.5 7.5l-4 5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                  )}
                </svg>
              </TombolHud>

              <TombolHud label="Ulangi balapan" onClick={mulaiBalapan}>
                <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M17 10a7 7 0 1 1-2.2-5.1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M17.5 2v5h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </TombolHud>

              <button
                type="button"
                onClick={bukaInfo}
                className="font-display rounded-xl border-2 border-ink/25 bg-white px-2.5 py-1.5 text-xs font-extrabold text-ink transition-transform active:scale-95 sm:text-sm"
                title="Cara bermain & panduan"
              >
                ☰ Menu
              </button>

              <button
                type="button"
                onClick={() => {
                  suara.klik();
                  setTahap("atur");
                }}
                className="font-display rounded-xl border-2 border-ink bg-ink px-2.5 py-1.5 text-xs font-extrabold text-kertas transition-transform active:scale-95 sm:text-sm"
              >
                Pengaturan
              </button>
            </div>
          </div>

          <RaceTrack pemain={pemain} target={pengaturan.langkahMenang} juaraId={juaraId} mulai={tahap === "main"} />

          <div
            className={`grid min-h-0 flex-1 gap-1.5 sm:gap-2 ${
              pengaturan.jumlahPemain === 2
                ? "grid-cols-2"
                : pengaturan.jumlahPemain === 3
                  ? "grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-2 xl:grid-cols-4"
            }`}
          >
            {pemain.map((p) => (
              <PlayerStation
                key={p.id}
                pemain={p}
                target={pengaturan.langkahMenang}
                panjangMaks={panjangMaks}
                nonaktif={juaraId !== null}
                pakaiKeyboard={pengaturan.keyboardFisik}
                onTombol={tekan}
              />
            ))}
          </div>
        </main>
      )}

      {/* hitung mundur */}
      {tahap === "hitung" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 backdrop-blur-[3px]">
          <div key={hitungan} className="anim-hitung text-center">
            <p className="font-display text-[9rem] leading-none font-extrabold text-white drop-shadow-[0_8px_0_rgba(0,0,0,.25)] sm:text-[13rem]">
              {hitungan === 0 ? "GO!" : hitungan}
            </p>
            <p className="font-display text-lg font-extrabold tracking-[0.3em] text-p2 uppercase">
              {hitungan === 0 ? "Selamat berlomba" : "Bersiap…"}
            </p>
          </div>
        </div>
      )}

      {/* layar juara */}
      {tahap === "selesai" && juara && (
        <WinScreen
          pemain={pemain}
          juara={juara}
          target={pengaturan.langkahMenang}
          waktuMs={durasiMs}
          pengaturan={pengaturan}
          onUlang={mulaiBalapan}
          onGanti={() => {
            suara.klik();
            setTahap("atur");
          }}
        />
      )}

      {/* halaman menu / cara bermain */}
      {bukaMenu && (
        <InfoPage
          bank={bank}
          sumber={sumberAktif}
          keyboard={pengaturan.keyboardFisik}
          tutup={() => {
            suara.klik();
            setBukaMenu(false);
          }}
        />
      )}
    </div>
  );
}

/* ================= bagian pendukung ================= */

function TombolHud({
  children,
  label,
  onClick,
  aktif,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  aktif?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-xl border-2 transition-all active:scale-90 sm:h-9 sm:w-9 ${
        aktif === false
          ? "border-ink/12 bg-white text-ink-3"
          : "border-ink/12 bg-white text-ink hover:border-ink/30"
      }`}
    >
      {children}
    </button>
  );
}
