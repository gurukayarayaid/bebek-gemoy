import Duck from "@/components/Duck";
import { LABEL_LEVEL, LABEL_OPERASI, NAMA_BEBEK, WARNA_PEMAIN, type Level, type Pengaturan, type PilihanOperasi } from "@/types";

interface Props {
  pengaturan: Pengaturan;
  nama: string[];
  ubah: (sebagian: Partial<Pengaturan>) => void;
  ubahNama: (i: number, nilai: string) => void;
  mulai: () => void;
  bukaMenu: () => void;
  infoBank: { versi: string; judul: string; sumber: string; jumlahBank: number };
}

const OPERASI_ICON: Record<PilihanOperasi, React.ReactNode> = {
  tambah: (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  ),
  kurang: (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2.5 10h15" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  ),
  kali: (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  ),
  bagi: (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 10h14" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="10" cy="4" r="2.2" fill="currentColor" />
      <circle cx="10" cy="16" r="2.2" fill="currentColor" />
    </svg>
  ),
  campur: (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2 5h5l6 10h5M2 15h5l2-3.4M13 6.6L15 3h3M14 13l1.6 2H18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function Judul({ children, langkah }: { children: React.ReactNode; langkah?: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      {langkah && (
        <span className="font-display flex h-5 w-5 items-center justify-center rounded-md bg-ink text-[10px] font-extrabold text-kertas">
          {langkah}
        </span>
      )}
      <h3 className="font-display text-xs font-extrabold tracking-[0.14em] text-ink-2 uppercase">{children}</h3>
      <span className="h-[2px] flex-1 rounded-full bg-ink/10" />
    </div>
  );
}

function Saklar({ aktif, onClick, label, deskripsi }: { aktif: boolean; onClick: () => void; label: string; deskripsi: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={aktif}
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl border-2 border-ink/12 bg-white/80 px-2.5 py-2 text-left transition-all hover:border-ink/25 hover:bg-white active:scale-[.985]"
    >
      <span
        className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
        style={{ background: aktif ? "#35c46b" : "#c9d4e5" }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200"
          style={{ left: aktif ? "18px" : "2px" }}
        />
      </span>
      <span className="min-w-0">
        <span className="font-display block text-[13px] leading-tight font-extrabold text-ink">{label}</span>
        <span className="block text-[10px] leading-tight font-semibold text-ink-3">{deskripsi}</span>
      </span>
    </button>
  );
}

export default function SetupScreen({ pengaturan, nama, ubah, ubahNama, mulai, bukaMenu, infoBank }: Props) {
  const opsiLevel: Level[] = ["mudah", "sedang", "sulit"];
  const opsiOperasi: PilihanOperasi[] = ["tambah", "kurang", "kali", "bagi", "campur"];

  return (
    <div className="flex h-full min-h-0 w-full max-w-6xl flex-col">
      <div className="anim-muncul flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border-[3px] border-ink/20 bg-kertas bayangan-kartu">
        {/* kepala */}
        <div className="relative shrink-0 overflow-hidden bg-[linear-gradient(120deg,#16233d,#2b4a7d_55%,#1c78d6)] px-4 py-3 text-center sm:px-6 sm:py-4">
          <div
            className="absolute inset-0 opacity-[0.16]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0 2px,transparent 2px 16px)" }}
          />
          <div className="kilau-teks pointer-events-none absolute inset-0" />
          <div className="relative flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={bukaMenu}
              className="font-display rounded-xl border-2 border-white/35 bg-white/12 px-3 py-1.5 text-xs font-extrabold text-white transition-all hover:bg-white/20 active:scale-95 sm:text-sm"
            >
              ☰ Menu
            </button>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[10px] font-extrabold tracking-[0.35em] text-p2 uppercase sm:text-[11px]">
                Arena Balap Matematika SD
              </p>
              <h1 className="font-display text-2xl leading-none font-extrabold text-white drop-shadow-[0_3px_0_rgba(0,0,0,.28)] sm:text-4xl">
                BEBEK GEMOY
              </h1>
              <p className="mx-auto mt-0.5 hidden max-w-xl text-xs font-bold text-white/80 sm:block sm:text-sm">
                Jawab soal dengan benar, bebekmu maju. Pertama sampai {pengaturan.langkahMenang} langkah jadi juara!
              </p>
            </div>
            <div className="hidden shrink-0 gap-1 sm:flex">
              {WARNA_PEMAIN.map((w, i) => (
                <div
                  key={w.kunci}
                  className="anim-melayang"
                  style={{ animationDelay: `${i * 220}ms`, opacity: i < pengaturan.jumlahPemain ? 1 : 0.22 }}
                >
                  <Duck profil={w} nomor={i + 1} ukuran={i < pengaturan.jumlahPemain ? 52 : 42} />
                </div>
              ))}
            </div>
            <div className="flex shrink-0 gap-1 sm:hidden">
              {WARNA_PEMAIN.slice(0, pengaturan.jumlahPemain).map((w, i) => (
                <Duck key={w.kunci} profil={w} nomor={i + 1} ukuran={36} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-3 overflow-hidden p-3 sm:gap-4 sm:p-4 lg:grid-cols-[1.35fr_1fr]">
          {/* kolom kiri */}
          <div className="flex min-h-0 flex-col justify-between gap-2.5 overflow-hidden">
            <section>
              <Judul langkah="1">Jenjang Kelas</Judul>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((k) => {
                  const aktif = pengaturan.kelas === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => ubah({ kelas: k })}
                      className={`font-display group relative flex h-11 flex-col items-center justify-center rounded-xl border-[3px] transition-all duration-150 active:translate-y-[3px] sm:h-12 ${
                        aktif
                          ? "border-ink bg-p2 text-ink shadow-[0_4px_0_0_#dd9b06]"
                          : "border-ink/12 bg-white text-ink-2 shadow-[0_4px_0_0_#cdd6e6] hover:border-ink/30"
                      }`}
                      aria-pressed={aktif}
                    >
                      <span className="text-lg leading-none font-extrabold">{k}</span>
                      <span className="text-[8px] font-extrabold tracking-wider uppercase opacity-70">Kelas</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <Judul langkah="2">Operasi Hitung</Judul>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                {opsiOperasi.map((op) => {
                  const aktif = pengaturan.operasi === op;
                  return (
                    <button
                      key={op}
                      type="button"
                      onClick={() => ubah({ operasi: op })}
                      className={`flex flex-col items-center gap-0.5 rounded-xl border-[3px] px-1.5 py-2 transition-all duration-150 active:translate-y-[3px] ${
                        aktif
                          ? "border-ink bg-p3 text-white shadow-[0_4px_0_0_#1f9a51]"
                          : "border-ink/12 bg-white text-ink-2 shadow-[0_4px_0_0_#cdd6e6] hover:border-ink/30"
                      }`}
                      aria-pressed={aktif}
                    >
                      {OPERASI_ICON[op]}
                      <span className="font-display text-[10px] leading-tight font-extrabold sm:text-[11px]">
                        {op === "campur" ? "Acak Semua" : LABEL_OPERASI[op]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <Judul langkah="3">Level Soal</Judul>
              <div className="grid grid-cols-3 gap-1.5">
                {opsiLevel.map((lv, i) => {
                  const aktif = pengaturan.level === lv;
                  const warnaAktif = ["#35c46b", "#ffc531", "#ff5d5d"][i];
                  const bayangan = ["#1f9a51", "#dd9b06", "#d33a3a"][i];
                  return (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => ubah({ level: lv })}
                      className="font-display flex flex-col items-center gap-0.5 rounded-xl border-[3px] px-1.5 py-2 transition-all duration-150 active:translate-y-[3px]"
                      style={
                        aktif
                          ? { borderColor: "#16233d", background: warnaAktif, color: "#fffaf0", boxShadow: `0 4px 0 0 ${bayangan}` }
                          : { borderColor: "rgba(22,35,61,.12)", background: "#fff", color: "#3b4d70", boxShadow: "0 4px 0 0 #cdd6e6" }
                      }
                      aria-pressed={aktif}
                    >
                      <span className="flex gap-[3px]">
                        {[0, 1, 2].map((b) => (
                          <span
                            key={b}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: b <= i ? (aktif ? "#fffaf0" : warnaAktif) : "rgba(22,35,61,.15)" }}
                          />
                        ))}
                      </span>
                      <span className="text-xs font-extrabold">{LABEL_LEVEL[lv]}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <Judul langkah="4">Target Langkah Finis</Judul>
              <div className="flex flex-wrap gap-1.5">
                {[5, 10, 15, 20].map((t) => {
                  const aktif = pengaturan.langkahMenang === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => ubah({ langkahMenang: t })}
                      className={`font-display rounded-xl border-[3px] px-3 py-1.5 text-xs font-extrabold transition-all active:translate-y-[3px] sm:text-sm ${
                        aktif
                          ? "border-ink bg-p4 text-white shadow-[0_4px_0_0_#1c78d6]"
                          : "border-ink/12 bg-white text-ink-2 shadow-[0_4px_0_0_#cdd6e6] hover:border-ink/30"
                      }`}
                      aria-pressed={aktif}
                    >
                      {t} langkah
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* kolom kanan */}
          <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
            <section className="min-h-0">
              <Judul>Jumlah & Nama Pemain</Judul>
              <div className="mb-2 grid grid-cols-3 gap-1.5">
                {[2, 3, 4].map((j) => {
                  const aktif = pengaturan.jumlahPemain === j;
                  return (
                    <button
                      key={j}
                      type="button"
                      onClick={() => ubah({ jumlahPemain: j })}
                      className={`font-display rounded-lg border-[3px] py-1.5 text-xs font-extrabold transition-all active:translate-y-[3px] ${
                        aktif
                          ? "border-ink bg-ink text-kertas shadow-[0_4px_0_0_#0b1220]"
                          : "border-ink/12 bg-white text-ink-2 shadow-[0_4px_0_0_#cdd6e6] hover:border-ink/30"
                      }`}
                      aria-pressed={aktif}
                    >
                      {j} Pemain
                    </button>
                  );
                })}
              </div>
              <div className="space-y-1.5">
                {Array.from({ length: pengaturan.jumlahPemain }).map((_, i) => {
                  const w = WARNA_PEMAIN[i];
                  return (
                    <label key={i} className="flex items-center gap-2 rounded-xl border-2 border-ink/10 bg-white/85 p-1.5">
                      <span className="shrink-0">
                        <Duck profil={w} nomor={i + 1} ukuran={32} kedip={false} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-display block text-[9px] font-extrabold tracking-wider uppercase" style={{ color: w.tua }}>
                          Pemain {i + 1} · Bebek {w.nama}
                        </span>
                        <input
                          value={nama[i]}
                          maxLength={14}
                          onChange={(e) => ubahNama(i, e.target.value)}
                          placeholder={NAMA_BEBEK[i]}
                          className="font-display w-full border-none bg-transparent text-sm font-extrabold text-ink outline-none placeholder:text-ink-3/50"
                        />
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="flex min-h-0 flex-col gap-1.5">
              <Judul>Opsi Balapan</Judul>
              <Saklar
                aktif={pengaturan.soalSama}
                onClick={() => ubah({ soalSama: !pengaturan.soalSama })}
                label="Urutan soal sama"
                deskripsi={
                  pengaturan.soalSama
                    ? "Semua pemain mendapat urutan soal yang sama persis."
                    : "Tiap pemain mendapat angka sendiri (sulit mencontek)."
                }
              />
              <Saklar
                aktif={pengaturan.keyboardFisik}
                onClick={() => ubah({ keyboardFisik: !pengaturan.keyboardFisik })}
                label="Keyboard untuk Pemain 1"
                deskripsi="Angka, Backspace, Enter, dan Esc pada keyboard komputer."
              />
              <Saklar
                aktif={pengaturan.suara}
                onClick={() => ubah({ suara: !pengaturan.suara })}
                label="Efek suara"
                deskripsi="Sorakan, bunyi benar/salah, dan fanfare juara."
              />
            </section>

            <div className="hidden rounded-xl border-2 border-dashed border-ink/20 bg-white/70 p-2.5 lg:block">
              <p className="font-display text-[9px] font-extrabold tracking-[0.18em] text-ink-3 uppercase">Database soal</p>
              <p className="font-display text-sm leading-tight font-extrabold text-ink">{infoBank.judul}</p>
              <p className="mt-0.5 text-[10px] leading-snug font-bold text-ink-2">
                v{infoBank.versi} · {infoBank.jumlahBank} soal kurasi + generator · sumber{" "}
                <span className="text-p3-tua">{infoBank.sumber}</span>
              </p>
            </div>
          </div>
        </div>

        {/* kaki */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t-[3px] border-ink/10 bg-white/70 px-3 py-2.5 sm:px-5 sm:py-3">
          <p className="hidden max-w-md text-xs font-bold text-ink-2 sm:block">
            Cocok untuk lomba cepat-tepat di kelas: sampai 4 anak menyentuh papan masing-masing di satu layar.
          </p>
          <button
            type="button"
            onClick={mulai}
            className="font-display group relative w-full overflow-hidden rounded-xl border-[3px] border-ink bg-p1 px-6 py-2.5 text-lg font-extrabold tracking-wide text-white uppercase shadow-[0_5px_0_0_#d33a3a] transition-all hover:brightness-105 active:translate-y-[4px] active:shadow-[0_1px_0_0_#d33a3a] sm:w-auto sm:text-xl"
          >
            <span className="relative z-10">Mulai Balapan!</span>
            <span className="kilau-teks absolute inset-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
