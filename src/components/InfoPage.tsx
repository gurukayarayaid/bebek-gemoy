import Duck from "@/components/Duck";
import { WARNA_PEMAIN, type BankSoal } from "@/types";

const LANGKAH_MAIN = [
  {
    judul: "Pilih jenjang & operasi",
    teks: "Guru menentukan kelas 1–6, operasi hitung (tambah, kurang, kali, bagi, atau acak), dan level soal.",
  },
  {
    judul: "Isi nama 4 pemain",
    teks: "Tiap pemain punya bebek dengan warna dan aksesori berbeda: Merah, Kuning, Hijau, dan Biru.",
  },
  {
    judul: "Ketik jawaban di papan angka",
    teks: "Setiap pemain punya kolom soal dan keyboard angka sendiri di bawahnya. Tekan JAWAB untuk mengirim.",
  },
  {
    judul: "Jawab benar, bebek maju",
    teks: "Satu jawaban benar = satu langkah maju. Bebek pertama yang mencapai garis finis menjadi juara.",
  },
];

interface Props {
  bank: BankSoal;
  sumber: string;
  keyboard: boolean;
  tutup: () => void;
}

export default function InfoPage({ bank, sumber, keyboard, tutup }: Props) {
  const jumlahPerKelas = [1, 2, 3, 4, 5, 6].map((k) => ({
    kelas: k,
    kurasi: bank.bank.filter((b) => b.kelas === k).length,
  }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-kertas">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute right-[-6rem] bottom-[-8rem] h-96 w-96 rounded-full bg-p2/25 blur-3xl" />
      </div>

      <header className="sticky top-0 z-10 border-b-[3px] border-ink/15 bg-kertas/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Duck profil={WARNA_PEMAIN[1]} nomor={2} ukuran={40} kedip={false} />
          <div className="min-w-0 flex-1 leading-none">
            <p className="font-display text-xl font-extrabold text-ink">Menu & Panduan</p>
            <p className="text-[10px] font-extrabold tracking-[0.18em] text-ink-3 uppercase">Bebek Gemoy</p>
          </div>
          <button
            type="button"
            onClick={tutup}
            className="font-display rounded-2xl border-2 border-ink bg-ink px-4 py-2 text-sm font-extrabold text-kertas transition-transform active:scale-95"
          >
            ← Kembali
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-12 sm:px-6">
        <section className="anim-muncul">
          <div className="mb-4 flex items-end gap-3">
            <h2 className="font-display text-2xl leading-none font-extrabold text-ink sm:text-3xl">Cara Bermain</h2>
            <span className="mb-1 h-[3px] flex-1 rounded-full bg-ink/15" />
          </div>
          <ol className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LANGKAH_MAIN.map((l, i) => (
              <li
                key={l.judul}
                className="group relative rounded-3xl border-[3px] border-ink/12 bg-white p-4 transition-all duration-300 hover:-translate-y-1.5 hover:border-ink/30"
                style={{ borderTopColor: WARNA_PEMAIN[i].utama, borderTopWidth: 6 }}
              >
                <span
                  className="font-display mb-2 flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-extrabold text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                  style={{ background: WARNA_PEMAIN[i].utama }}
                >
                  {i + 1}
                </span>
                <h3 className="font-display text-lg leading-tight font-extrabold text-ink">{l.judul}</h3>
                <p className="mt-1 text-[13px] leading-snug font-semibold text-ink-2">{l.teks}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="anim-muncul mt-8 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-3xl border-[3px] border-ink bg-[#16233d] p-5 text-kertas sm:p-6">
            <p className="font-display text-[11px] font-extrabold tracking-[0.3em] text-p2 uppercase">Untuk Guru & Orang Tua</p>
            <h2 className="font-display mt-1 text-2xl leading-tight font-extrabold sm:text-3xl">
              Database soal disimpan sebagai berkas JSON di GitHub
            </h2>
            <p className="mt-2 text-sm leading-relaxed font-semibold text-white/75">
              Semua soal disimpan di <code className="rounded bg-white/15 px-1.5 py-0.5 font-bold text-p2">data/soal.json</code> dan
              ikut ter-deploy bersama situs. Berkas itu dibaca saat aplikasi dibuka; jika tidak ditemukan, aplikasi otomatis memakai
              salinan bawaan sehingga permainan tetap jalan.
            </p>
            <ul className="mt-4 space-y-2 text-sm font-semibold text-white/85">
              {[
                "rentang → batas angka tiap kelas, operasi, dan level (dipakai generator soal tanpa batas).",
                "bank → soal cerita hasil kurasi guru, bisa ditambah kapan saja tanpa mengubah kode.",
                "aturan → jumlah langkah finis, batas salah sebelum soal diganti, dan panjang jawaban.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <svg className="mt-[3px] shrink-0" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M2 8l4 4 8-9" fill="none" stroke="#ffc531" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-2xl bg-white/10 p-3 text-xs leading-relaxed font-bold text-white/80">
              Sumber data aktif sekarang: <span className="text-p2">{sumber}</span> · versi {bank.versi} · {bank.bank.length} soal
              kurasi
              {keyboard ? " · keyboard fisik aktif untuk Pemain 1" : ""}
            </p>
          </div>

          <div className="rounded-3xl border-[3px] border-ink/12 bg-white p-5 sm:p-6">
            <h3 className="font-display text-xl leading-none font-extrabold text-ink">Sebaran soal kurasi</h3>
            <p className="mt-1 text-xs font-bold text-ink-3">Jumlah soal cerita per jenjang kelas di dalam bank.</p>
            <div className="mt-4 space-y-2.5">
              {jumlahPerKelas.map((d) => {
                const maks = Math.max(...jumlahPerKelas.map((x) => x.kurasi), 1);
                return (
                  <div key={d.kelas} className="flex items-center gap-2">
                    <span className="font-display w-14 shrink-0 text-xs font-extrabold text-ink-2">Kelas {d.kelas}</span>
                    <span className="h-4 flex-1 overflow-hidden rounded-full bg-ink/8">
                      <span
                        className="block h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(d.kurasi / maks) * 100}%`,
                          background: `linear-gradient(90deg, ${WARNA_PEMAIN[(d.kelas - 1) % 4].utama}, ${WARNA_PEMAIN[(d.kelas - 1) % 4].tua})`,
                        }}
                      />
                    </span>
                    <span className="font-display w-6 shrink-0 text-right text-xs font-extrabold text-ink tabular-nums">
                      {d.kurasi}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 rounded-2xl border-2 border-dashed border-ink/20 bg-kertas p-3 text-xs leading-relaxed font-bold text-ink-2">
              Selain soal kurasi, aplikasi memiliki <span className="text-ink">generator soal</span> yang membuat angka baru setiap
              babak sesuai rentang kelas — jadi soal tidak pernah habis dan tiap pemain mendapat angka berbeda.
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t-2 border-dashed border-ink/15 pt-5 pb-2 text-center">
          <p className="font-display text-sm font-extrabold text-ink">
            Bebek Gemoy · Balap Hitung untuk Murid SD Kelas 1–6
          </p>
          <p className="mt-1 text-[11px] font-bold text-ink-3">
            Dibangun dengan React + Vite + Tailwind · siap di-hosting gratis di GitHub Pages · satu layar untuk 4 pemain
          </p>
        </footer>
      </main>
    </div>
  );
}
