import { useEffect, useRef } from "react";
import Duck from "@/components/Duck";
import { WARNA_PEMAIN, type Pemain } from "@/types";

interface Props {
  pemain: Pemain[];
  target: number;
  juaraId: number | null;
  mulai: boolean;
}

const LEBAR_BEBEK = 72;

function posisi(langkah: number, target: number) {
  const r = Math.max(0, Math.min(1, langkah / target));
  return `calc((100% - ${LEBAR_BEBEK}px) * ${r} + ${LEBAR_BEBEK / 2}px)`;
}

const polaKotak = {
  backgroundImage:
    "linear-gradient(45deg, #16233d 25%, transparent 25%, transparent 75%, #16233d 75%), linear-gradient(45deg, #16233d 25%, #ffffff 25%, #ffffff 75%, #16233d 75%)",
  backgroundSize: "14px 14px",
  backgroundPosition: "0 0, 7px 7px",
};

function Awan({ atas, skala, durasi, tunda }: { atas: string; skala: number; durasi: number; tunda: number }) {
  return (
    <div
      className="anim-awan pointer-events-none absolute"
      style={{ top: atas, animationDuration: `${durasi}s`, animationDelay: `${tunda}s`, transform: `scale(${skala})` }}
    >
      <svg width="150" height="60" viewBox="0 0 150 60" aria-hidden="true">
        <g fill="#ffffff" opacity="0.92">
          <ellipse cx="42" cy="38" rx="34" ry="18" />
          <ellipse cx="78" cy="30" rx="30" ry="22" />
          <ellipse cx="112" cy="40" rx="28" ry="15" />
        </g>
      </svg>
    </div>
  );
}

export default function RaceTrack({ pemain, target, juaraId, mulai }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const isiRef = useRef<HTMLDivElement>(null);
  const kunci = `${pemain.length}-${target}-${pemain.map((p) => p.langkah).join(",")}`;

  useEffect(() => {
    const section = sectionRef.current;
    const isi = isiRef.current;
    if (!section || !isi) return;

    let batal = false;
    const pengamat: ResizeObserver[] = [];

    const fit = () => {
      if (batal) return;
      isi.style.transform = "none";
      isi.style.width = "100%";
      isi.style.transformOrigin = "top left";
      void isi.offsetHeight;

      const tersedia = section.clientHeight - 6;
      const alami = isi.scrollHeight;
      if (tersedia < 8 || alami < 8) return;

      const skala = Math.max(0.2, Math.min(2.2, tersedia / alami));
      if (Math.abs(skala - 1) > 0.005) {
        isi.style.transform = `scale(${skala})`;
        isi.style.width = `${100 / skala}%`;
      }
    };

    const jadwal = () => {
      cancelAnimationFrame(jadwal.raf);
      jadwal.raf = requestAnimationFrame(fit);
    };
    jadwal.raf = 0;

    fit();
    jadwal();

    const ro1 = new ResizeObserver(jadwal);
    ro1.observe(section);
    pengamat.push(ro1);
    const ro2 = new ResizeObserver(jadwal);
    ro2.observe(isi);
    pengamat.push(ro2);

    return () => {
      batal = true;
      cancelAnimationFrame(jadwal.raf);
      pengamat.forEach((r) => r.disconnect());
    };
  }, [kunci, pemain.length, target]);

  return (
    <section
      ref={sectionRef}
      className="lintasan relative isolate min-h-0 max-h-[52vh] flex-[3] overflow-hidden rounded-[18px] border-[3px] border-ink/25 shadow-[0_18px_40px_-20px_rgba(22,35,61,.65)] sm:rounded-[22px]"
      aria-label="Lintasan balap bebek"
    >
      {/* langit */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#dff4ff_0%,#a6dcfb_45%,#8ed0f7_62%,#7ec6ef_100%)]" />

      {/* matahari */}
      <div className="absolute -top-8 right-8 h-24 w-24 sm:h-28 sm:w-28">
        <div className="anim-putar absolute inset-0 opacity-70">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <rect
                key={i}
                x="48.5"
                y="2"
                width="3"
                height="16"
                rx="1.5"
                fill="#ffd43b"
                transform={`rotate(${i * 30} 50 50)`}
              />
            ))}
          </svg>
        </div>
        <div className="absolute inset-5 rounded-full bg-[radial-gradient(circle_at_35%_32%,#fff6c9,#ffd43b_55%,#ffb020)] shadow-[0_0_40px_12px_rgba(255,208,64,.55)]" />
      </div>

      <Awan atas="6%" skala={1} durasi={54} tunda={-6} />
      <Awan atas="20%" skala={0.68} durasi={72} tunda={-30} />
      <Awan atas="-2%" skala={0.5} durasi={92} tunda={-58} />

      {/* burung */}
      <div className="anim-terbang pointer-events-none absolute top-[16%] left-0" aria-hidden="true">
        <svg width="40" height="16" viewBox="0 0 46 18">
          <path d="M2 12q8-10 14 0q6-10 14 0q6-8 12-1" fill="none" stroke="#3b4d70" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>

      {/* bukit */}
      <svg className="absolute inset-x-0 bottom-[38%] w-full" viewBox="0 0 1200 180" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 180 L0 120 Q150 40 320 110 Q470 168 620 96 Q780 22 940 104 Q1080 168 1200 112 L1200 180 Z" fill="#8ed08a" opacity="0.75" />
        <path d="M0 180 L0 150 Q180 96 380 148 Q560 192 760 140 Q960 92 1200 152 L1200 180 Z" fill="#63bd63" />
      </svg>

      {/* tanah rumput */}
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,#7ed957_0%,#5ec24d_38%,#3fa63f_100%)]" />
      <div
        className="absolute inset-x-0 bottom-0 h-[42%] opacity-25"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, rgba(22,35,61,.16) 0 2px, transparent 2px 26px)",
        }}
      />

      {/* bendera rumbai */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between px-1.5" aria-hidden="true">
        {Array.from({ length: 26 }).map((_, i) => (
          <svg key={i} width="22" height="24" viewBox="0 0 26 30" className="origin-top anim-ayun" style={{ animationDelay: `${i * 90}ms` }}>
            <path d="M13 2 Q25 2 13 26 Q1 2 13 2 Z" fill={WARNA_PEMAIN[i % 4].utama} opacity="0.92" />
          </svg>
        ))}
      </div>

      {/* isi lintasan */}
      <div ref={isiRef} className="lintasan-isi relative z-20 overflow-hidden px-2 pt-3 pb-1 sm:px-3 sm:pt-6 sm:pb-2">
        <div className="mb-1 flex items-center justify-between px-0.5 font-display text-[9px] font-extrabold tracking-[0.16em] text-ink/70 uppercase sm:text-[10px]">
          <span className="rounded-full bg-white/70 px-2 py-0.5">Garis Start</span>
          <span className="hidden rounded-full bg-white/70 px-2 py-0.5 sm:inline">{target} langkah sampai finis</span>
          <span className="flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-kertas">
            Finis
            <svg width="14" height="12" viewBox="0 0 16 14" aria-hidden="true" style={polaKotak} className="rounded-[2px]" />
          </span>
        </div>

        <div className="relative rounded-2xl border-[3px] border-ink/20 bg-[#f3d9a6]/60 p-1 shadow-inner sm:p-2">
          {/* garis finis */}
          <div className="pointer-events-none absolute top-1 right-1 bottom-1 z-30 w-3 rounded-sm opacity-90" style={polaKotak} />
          <div className="pointer-events-none absolute top-1 bottom-1 left-1 z-30 w-1.5 rounded-sm bg-white/70" />

          {/* tiang bendera */}
          <div className="pointer-events-none absolute -top-7 right-1 z-30 hidden sm:block" aria-hidden="true">
            <div className="relative">
              <div className="h-8 w-[3px] rounded bg-ink/70" />
              <svg className="anim-ayun absolute top-0 right-1" width="30" height="22" viewBox="0 0 34 24">
                <path d="M0 2 Q10 -2 18 4 Q26 10 33 4 L33 18 Q25 24 17 18 Q9 12 0 16 Z" fill="#ff5d5d" />
              </svg>
            </div>
          </div>

          <div className="relative z-20 space-y-1 sm:space-y-1.5">
            {pemain.map((p) => {
              const profil = WARNA_PEMAIN[p.id];
              const menang = juaraId === p.id;
              return (
                <div key={p.id} className="grid grid-cols-[54px_1fr] items-center gap-1.5 sm:grid-cols-[88px_1fr] sm:gap-2">
                  <div className="flex flex-col items-end gap-0.5 pr-0.5 text-right">
                    <span
                      className="font-display max-w-full truncate text-[10px] leading-none font-extrabold sm:text-xs"
                      style={{ color: profil.tua }}
                    >
                      {p.nama}
                    </span>
                    <span className="font-display text-[9px] leading-none font-bold text-ink/60 tabular-nums sm:text-[10px]">
                      {p.langkah}/{target}
                    </span>
                  </div>

                  <div className="relative h-[38px] overflow-hidden rounded-xl border-2 border-white/60 bg-[linear-gradient(180deg,#f7e3b8,#e6c48c)] shadow-[inset_0_2px_6px_rgba(22,35,61,.18)] sm:h-[54px]">
                    {/* jalur putus-putus */}
                    <div
                      className="absolute inset-x-2 top-1/2 h-[3px] -translate-y-1/2 rounded opacity-60"
                      style={{ backgroundImage: "repeating-linear-gradient(90deg,#fffaf0 0 16px, transparent 16px 32px)" }}
                    />
                    {/* jejak langkah */}
                    {Array.from({ length: target }).map((_, i) => {
                      const aktif = p.langkah >= i + 1;
                      return (
                        <span
                          key={i}
                          className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-500"
                          style={{
                            left: posisi(i + 1, target),
                            borderColor: aktif ? profil.tua : "rgba(22,35,61,.22)",
                            background: aktif ? profil.utama : "rgba(255,250,240,.5)",
                            transform: `translate(-50%,-50%) scale(${aktif ? 1.1 : 0.85})`,
                          }}
                        />
                      );
                    })}

                    {/* bebek */}
                    <div
                      className="absolute bottom-0.5 z-10 -translate-x-1/2 transition-[left] duration-700 ease-[cubic-bezier(.34,1.5,.64,1)]"
                      style={{ left: posisi(p.langkah, target) }}
                    >
                      <div className={p.lompat && mulai ? "anim-lompat" : mulai ? "anim-waddle" : "anim-idle"}>
                        <Duck profil={profil} nomor={p.id + 1} ukuran={42} className="drop-shadow-[0_4px_6px_rgba(22,35,61,.28)] sm:scale-100" />
                      </div>
                      {menang && (
                        <div className="anim-pop absolute -top-5 left-1/2 -translate-x-1/2">
                          <svg width="28" height="22" viewBox="0 0 34 24" aria-hidden="true">
                            <path d="M3 4h6l3 6 5-9 5 9 3-6h6l-4 14H7z" fill="#ffd43b" stroke="#e8a90d" strokeWidth="2" strokeLinejoin="round" />
                            <rect x="7" y="19" width="20" height="5" rx="2" fill="#e8a90d" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
