/**
 * Menyalin database soal dari src/data/soal-bank.json ke public/data/soal.json
 * supaya ikut ter-deploy ke GitHub Pages dan bisa diedit tanpa membangun ulang.
 *
 * Jalankan:  node scripts/salin-soal.mjs
 * (Workflow .github/workflows/deploy.yml memanggil skrip ini otomatis sebelum build.)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const akar = dirname(dirname(fileURLToPath(import.meta.url)));
const sumber = join(akar, "src", "data", "soal-bank.json");
const tujuanDir = join(akar, "public", "data");
const tujuan = join(tujuanDir, "soal.json");

async function utama() {
  const mentah = await readFile(sumber, "utf8");
  const data = JSON.parse(mentah);

  // Validasi ringan agar kesalahan ketik cepat ketahuan.
  const wajib = ["versi", "judul", "aturan", "rentang", "bank"];
  const hilang = wajib.filter((k) => !(k in data));
  if (hilang.length) throw new Error(`Field wajib tidak ada di soal-bank.json: ${hilang.join(", ")}`);
  for (let k = 1; k <= 6; k++) {
    if (!data.rentang[String(k)]) throw new Error(`rentang untuk kelas ${k} belum ada.`);
  }
  if (!Array.isArray(data.bank)) throw new Error(`"bank" harus berupa array soal.`);

  await mkdir(tujuanDir, { recursive: true });
  await writeFile(tujuan, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  // .nojekyll membuat GitHub Pages melayani folder `data/` apa adanya (tanpa Jekyll).
  await writeFile(join(akar, "public", ".nojekyll"), "", "utf8");

  console.log(
    `[bebek-gemoy] data/soal.json siap · v${data.versi} · ${data.bank.length} soal kurasi · ${
      Object.keys(data.rentang).length
    } kelas`,
  );
}

utama().catch((galat) => {
  console.error("[bebek-gemoy] Gagal menyalin database soal:", galat.message);
  process.exit(1);
});
