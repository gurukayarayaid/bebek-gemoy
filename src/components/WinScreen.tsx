import Confetti from "@/components/Confetti";
import Duck from "@/components/Duck";
import { formatAngka } from "@/lib/generator";
import { LABEL_LEVEL, LABEL_OPERASI, WARNA_PEMAIN, type Pemain, type Pengaturan } from "@/types";

interface Props {
  pemain: Pemain[];
  juara: Pemain;
  target: number;
  waktuMs: number;
  pengaturan: Pengaturan;
  onUlang: () => void;
  onGanti: () => void;
}

function waktu(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const d = total % 60;
  return `${String(m).padStart(2, "0")}:${String(d).padStart(2, "0")}`;
}

export default function WinScreen({ pemain, juara, target, waktuMs, pengaturan, onUlang, onGanti }: Props) {
  const profilJuara = WARNA_PEMAIN[juara.id];
  const peringkat = [...pemain].sort((a, b) => {
    if (a.peringkat !== null && b.peringkat !== null) return a.peringkat - b.peringkat;
    if (a.peringkat !== null) return -1;
    if (b.peringkat !== null) return 1;
    if (b.langkah !== a.langkah) return b.langkah - a.langkah;
    return b.benar - a.benar;
  });

  const totalBenar = pemain.reduce((s, p) => s + p.benar, 0);
  const totalSalah = pemain.reduce((s, p) => s + p.salah, 0);
  const akurasi = totalBenar + totalSalah > 0 ? Math.round((totalBenar / (totalBenar + totalSalah)) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/70 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <Confetti />
      <div className="anim-muncul relative w-full max-w-4xl overflow-hidden rounded-[32px] border-[3px] border-ink/25 bg-kertas bayangan-kartu">
        <div
          className="relative overflow-hidden px-5 py-8 text-center sm:py-10"
          style={{ background: `linear-gradient(135deg, ${profilJuara.tua}, ${profilJuara.utama})` }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "repeating-linear-gradient(-45deg,#fff 0 2px,transparent 2px 18px)" }}
          />
          <div className="relative">
            <p className="font-display text-xs font-extrabold tracking-[0.35em] text-white/85 uppercase">
              Balapan selesai · waktu {waktu(waktuMs)}
            </p>
            <h2 className="font-display mt-1 text-4xl leading-none font-extrabold text-white drop-shadow-[0_4px_0_rgba(0,0,0,.25)] sm:text-6xl">
              {juara.nama} JUARA!
            </h2>
            <div className="anim-melayang mx-auto mt-3 w-fit">
              <Duck profil={profilJuara} nomor={juara.id + 1} ukuran={132} />
            </div>
            <p className="font-display text-base font-extrabold text-white/90 sm:text-lg">
              Sampai finis dengan {target} langkah · {juara.benar} jawaban benar
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.15fr_1fr]">
          <section>
            <h3 className="font-display mb-3 text-sm font-extrabold tracking-[0.16em] text-ink-3 uppercase">
              Papan Peringkat
            </h3>
            <ol className="space-y-2">
              {peringkat.map((p, i) => {
                const w = WARNA_PEMAIN[p.id];
                return (
                  <li
                    key={p.id}
                    className="anim-naik flex items-center gap-3 rounded-2xl border-2 bg-white p-2.5"
                    style={{ borderColor: i === 0 ? w.tua : "rgba(22,35,61,.1)", animationDelay: `${i * 90}ms` }}
                  >
                    <span
                      className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-extrabold"
                      style={{ background: i === 0 ? "#ffd43b" : "#eef2f9", color: i === 0 ? "#8a6100" : "#3b4d70" }}
                    >
                      {i + 1}
                    </span>
                    <Duck profil={w} nomor={p.id + 1} ukuran={40} kedip={false} />
                    <div className="min-w-0 flex-1">
                      <p className="font-display truncate text-base leading-tight font-extrabold text-ink">{p.nama}</p>
                      <p className="text-[11px] font-bold text-ink-3">
                        Bebek {w.nama} · {p.langkah}/{target} langkah · benar {p.benar} · salah {p.salah}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-lg leading-none font-extrabold tabular-nums" style={{ color: w.tua }}>
                        {p.streakTerbaik}×
                      </p>
                      <p className="text-[9px] font-extrabold tracking-wider text-ink-3 uppercase">streak</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="font-display mb-3 text-sm font-extrabold tracking-[0.16em] text-ink-3 uppercase">
                Ringkasan Balapan
              </h3>
              <dl className="grid grid-cols-2 gap-2">
                {[
                  { label: "Durasi", nilai: waktu(waktuMs) },
                  { label: "Akurasi kelas", nilai: `${akurasi}%` },
                  { label: "Jawaban benar", nilai: formatAngka(totalBenar) },
                  { label: "Jawaban salah", nilai: formatAngka(totalSalah) },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border-2 border-ink/10 bg-white p-3">
                    <dt className="text-[10px] font-extrabold tracking-wider text-ink-3 uppercase">{s.label}</dt>
                    <dd className="font-display text-2xl leading-tight font-extrabold text-ink tabular-nums">{s.nilai}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-ink/20 bg-white/70 p-3">
              <p className="font-display text-[10px] font-extrabold tracking-[0.18em] text-ink-3 uppercase">Pengaturan tadi</p>
              <p className="font-display text-sm leading-snug font-extrabold text-ink">
                Kelas {pengaturan.kelas} · {LABEL_OPERASI[pengaturan.operasi]} · Level {LABEL_LEVEL[pengaturan.level]}
              </p>
              <p className="mt-0.5 text-[11px] font-bold text-ink-2">
                {pengaturan.soalSama ? "Soal sama untuk semua pemain" : "Soal acak berbeda tiap pemain"} ·{" "}
                {pengaturan.jumlahPemain} pemain · target {target} langkah
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onUlang}
                className="font-display flex-1 rounded-2xl border-[3px] border-ink bg-p3 px-5 py-3.5 text-lg font-extrabold text-white uppercase shadow-[0_6px_0_0_#1f9a51] transition-all hover:brightness-105 active:translate-y-[4px] active:shadow-[0_2px_0_0_#1f9a51]"
              >
                Balapan Lagi
              </button>
              <button
                type="button"
                onClick={onGanti}
                className="font-display flex-1 rounded-2xl border-[3px] border-ink bg-white px-5 py-3.5 text-lg font-extrabold text-ink uppercase shadow-[0_6px_0_0_#cdd6e6] transition-all hover:brightness-[.98] active:translate-y-[4px] active:shadow-[0_2px_0_0_#cdd6e6]"
              >
                Ganti Soal
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
