import { useMemo } from "react";
import { formatAngka } from "@/lib/generator";
import { WARNA_PEMAIN, type Pemain, type ProfilWarna } from "@/types";

export type AksiPapan = "angka" | "hapus" | "bersih" | "kirim";

interface Props {
  pemain: Pemain;
  target: number;
  panjangMaks: number;
  nonaktif: boolean;
  pakaiKeyboard: boolean;
  onTombol: (id: number, aksi: AksiPapan, nilai?: string) => void;
}

function Tombol({
  label,
  onClick,
  varian = "angka",
  warna,
  span = 1,
  ariaLabel,
}: {
  label: React.ReactNode;
  onClick: () => void;
  varian?: "angka" | "aksi" | "kirim";
  warna: ProfilWarna;
  span?: number;
  ariaLabel?: string;
}) {
  const gaya: React.CSSProperties =
    varian === "kirim"
      ? { background: warna.utama, color: "#fffaf0", boxShadow: `0 4px 0 0 ${warna.tua}` }
      : varian === "aksi"
        ? { background: "#e9eef7", color: "#16233d", boxShadow: "0 4px 0 0 #b9c5da" }
        : { background: "#fffaf0", color: "#16233d", boxShadow: "0 3px 0 0 #cdd6e6" };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      style={{ gridColumn: `span ${span} / span ${span}`, ...gaya }}
      className="font-display flex h-8 select-none touch-manipulation items-center justify-center rounded-lg border-2 border-ink/15 text-base font-extrabold transition-all duration-75 hover:brightness-[1.03] active:translate-y-[3px] sm:h-9 sm:text-lg"
    >
      {label}
    </button>
  );
}

export default function PlayerStation({ pemain, target, panjangMaks, nonaktif, pakaiKeyboard, onTombol }: Props) {
  const profil = WARNA_PEMAIN[pemain.id];
  const angka = useMemo(() => ["1", "2", "3", "4", "5", "6", "7", "8", "9"], []);
  const juara = pemain.peringkat !== null;
  const tampilanInput = pemain.input ? formatAngka(Number(pemain.input)) : "";

  const tekan = (aksi: AksiPapan, nilai?: string) => {
    if (nonaktif || juara) return;
    onTombol(pemain.id, aksi, nilai);
  };

  return (
    <article
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-[3px] bg-kertas bayangan-kartu"
      style={{ borderColor: profil.tua }}
      aria-label={`Papan soal pemain ${pemain.id + 1} ${pemain.nama}`}
    >
      {/* kepala */}
      <header className="relative flex shrink-0 items-center gap-2 px-2 py-1.5" style={{ background: profil.utama }}>
        <span
          className="font-display flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-ink/20 text-xs font-extrabold text-ink"
          style={{ background: "#fffaf0" }}
        >
          {pemain.id + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-sm leading-tight font-extrabold text-white drop-shadow-[0_1px_0_rgba(22,35,61,.35)] sm:text-base">
            {pemain.nama}
          </p>
          <p className="text-[9px] leading-tight font-bold text-ink/55">
            Bebek {profil.nama}
            {pakaiKeyboard && pemain.id === 0 ? " · keyboard" : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-base leading-none font-extrabold text-white tabular-nums drop-shadow-[0_1px_0_rgba(22,35,61,.35)]">
            {pemain.langkah}
            <span className="text-[10px] opacity-80">/{target}</span>
          </p>
          <div className="mt-0.5 flex justify-end gap-[2px]">
            {Array.from({ length: target }).map((_, i) => (
              <span
                key={i}
                className="h-1 w-1 rounded-full transition-colors duration-300"
                style={{ background: i < pemain.langkah ? "#fffaf0" : "rgba(22,35,61,.22)" }}
              />
            ))}
          </div>
        </div>
      </header>

      {/* isi */}
      <div className="tekstur-kertas flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-2 pt-1.5 pb-1.5">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <span
            className="font-display rounded-full px-1.5 py-[2px] text-[9px] font-extrabold tracking-wide uppercase"
            style={{ background: profil.muda, color: profil.tua }}
          >
            Soal #{pemain.urutanSoal + 1}
            {" · "}
            {pemain.soal.jenis === "cerita" ? "Cerita" : "Hitung Cepat"}
          </span>
          <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-ink-3">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-p3" />
              {pemain.benar}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-p1" />
              {pemain.salah}
            </span>
            {pemain.streak >= 2 && (
              <span className="anim-pop flex items-center gap-0.5 rounded-full bg-p2 px-1.5 text-ink">
                <svg width="8" height="10" viewBox="0 0 12 16" aria-hidden="true">
                  <path d="M6 0s5 4 5 8a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 2 2c0-3 2-5 2-7z" fill="#ff7a1a" />
                </svg>
                {pemain.streak}
              </span>
            )}
          </div>
        </div>

        <div
          key={`${pemain.urutanSoal}-${pemain.soal.id}-${pemain.soal.tampilan}-${pemain.soal.jawaban}`}
          className="anim-muncul relative flex min-h-0 flex-1 shrink items-center rounded-xl border-[3px] border-dashed px-2 py-1.5"
          style={{ borderColor: `${profil.tua}55`, background: "#fffdf6" }}
        >
          {pemain.soal.jenis === "cerita" ? (
            <p className="font-body line-clamp-4 text-[11px] leading-snug font-bold text-ink sm:text-xs">{pemain.soal.teks}</p>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-0.5">
              <p className="font-display text-2xl leading-none font-extrabold tracking-tight text-ink tabular-nums sm:text-3xl">
                {pemain.soal.tampilan}
              </p>
              <p className="font-display text-xl leading-none font-extrabold" style={{ color: profil.tua }}>
                = ?
              </p>
            </div>
          )}

          {pemain.umpan !== "idle" && (
            <div
              className="anim-pop absolute inset-x-2 -bottom-3 z-10 flex items-center justify-center gap-1 rounded-full px-2 py-0.5 font-display text-[10px] font-extrabold text-white shadow-lg"
              style={{ background: pemain.umpan === "benar" ? "#35c46b" : "#ff5d5d" }}
            >
              {pemain.umpan === "benar" ? "Benar! Maju 1 langkah" : "Coba lagi ya!"}
            </div>
          )}
        </div>

        {/* layar jawaban */}
        <div
          className={`flex shrink-0 items-center justify-between gap-2 rounded-xl border-[3px] px-2 py-1 transition-colors ${
            pemain.umpan === "salah" ? "anim-goyang" : ""
          }`}
          style={{ borderColor: profil.tua, background: "#fff" }}
        >
          <span className="font-display text-[9px] font-extrabold tracking-widest text-ink-3 uppercase">Jawab</span>
          <span className="font-display min-h-[22px] flex-1 text-right text-xl leading-none font-extrabold text-ink tabular-nums sm:text-2xl">
            {tampilanInput || <span className="text-ink-3/50">—</span>}
            <span
              className="anim-kursor ml-0.5 inline-block h-5 w-[3px] translate-y-[2px]"
              style={{ background: profil.tua }}
            />
          </span>
        </div>

        {/* papan angka */}
        <div className="grid shrink-0 grid-cols-3 gap-1">
          {angka.map((n) => (
            <Tombol key={n} label={n} warna={profil} onClick={() => tekan("angka", n)} ariaLabel={`Angka ${n}`} />
          ))}
          <Tombol label="C" varian="aksi" warna={profil} onClick={() => tekan("bersih")} ariaLabel="Hapus semua" />
          <Tombol label="0" warna={profil} onClick={() => tekan("angka", "0")} ariaLabel="Angka 0" />
          <Tombol
            warna={profil}
            varian="aksi"
            onClick={() => tekan("hapus")}
            ariaLabel="Hapus satu angka"
            label={
              <svg width="18" height="14" viewBox="0 0 24 20" aria-hidden="true">
                <path d="M8 2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8L0 10z" fill="none" stroke="#16233d" strokeWidth="2.4" strokeLinejoin="round" />
                <path d="M12 6l7 8M19 6l-7 8" stroke="#16233d" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            }
          />
          <Tombol
            label={
              <span className="flex items-center gap-1">
                JAWAB
                <svg width="12" height="10" viewBox="0 0 18 14" aria-hidden="true">
                  <path d="M1 7l5 5L17 1" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            }
            varian="kirim"
            warna={profil}
            span={3}
            onClick={() => tekan("kirim")}
            ariaLabel="Kirim jawaban"
          />
        </div>

        <p className="shrink-0 text-center text-[9px] font-bold text-ink-3">
          {pemain.salahBeruntun > 0
            ? `${pemain.salahBeruntun}/3 salah — soal berganti otomatis`
            : `Ketik jawaban lalu tekan JAWAB`}
        </p>
      </div>

      {/* pita juara / batas panjang */}
      {juara && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1 bg-ink/55 backdrop-blur-[2px]">
          <p className="font-display anim-pop text-2xl font-extrabold text-p2">Selesai!</p>
          <p className="font-display text-xs font-bold text-kertas">
            Peringkat {pemain.peringkat}
            {pemain.peringkat === 1 ? " — Juara" : ""}
          </p>
        </div>
      )}
      {!juara && nonaktif && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink/35">
          <p className="font-display text-lg font-extrabold text-kertas">Balapan selesai</p>
        </div>
      )}
      {pemain.input.length >= panjangMaks && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1" style={{ background: profil.tua }} />
      )}
    </article>
  );
}
