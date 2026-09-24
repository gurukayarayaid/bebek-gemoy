# 🦆 Bebek Gemoy — Balap Hitung untuk Murid SD

Game balap matematika **4 pemain dalam satu layar**. Setiap pemain punya bebek berwarna,
kolom soal, dan papan angka (keyboard) sendiri. Jawaban benar = bebek maju satu langkah.
Bebek pertama yang mencapai **10 langkah** menjadi juara.

Dibuat untuk lomba cepat-tepat di kelas: satu laptop/proyektor (atau tablet layar besar),
empat anak bermain bersamaan.

---

## ✨ Fitur

| Fitur | Keterangan |
| --- | --- |
| 4 pemain | Warna & aksesori bebek berbeda: **Merah** (topi), **Kuning** (pita), **Hijau** (mahkota daun), **Biru** (kacamata) + lencana nomor |
| Papan soal per pemain | Kolom soal + keyboard angka `1–9`, `0`, `C`, `⌫`, `JAWAB` di bawahnya |
| Jenjang kelas | Kelas **1, 2, 3, 4, 5, 6** |
| Operasi hitung | **Tambah, Kurang, Kali, Bagi**, plus mode **Acak Semua** |
| Level soal | **Mudah, Sedang, Sulit** (rentang angka menyesuaikan kurikulum tiap kelas) |
| Target langkah | 5 / **10** / 15 / 20 langkah sampai finis |
| Jenis soal | Soal hitungan cepat **dan** soal cerita (kurasi guru + template otomatis) |
| Umpan balik | Animasi bebek melompat, efek suara, combo/streak, hitung benar–salah |
| Hitung mundur | `3 – 2 – 1 – GO!` sebelum balapan dimulai |
| Layar juara | Konfeti, podium peringkat 1–4, durasi balapan, akurasi kelas |
| Keyboard fisik | Opsional untuk Pemain 1 (angka, `Backspace`, `Enter`, `Esc`) |
| Anti-contek | Opsi "tiap pemain mendapat angka sendiri" |
| Penyimpanan | Pengaturan & nama pemain tersimpan otomatis di `localStorage` |

---

## 🗂️ Database Soal (disimpan di GitHub sebagai JSON)

Database soal adalah berkas JSON biasa yang ikut berada di repositori ini:

```
src/data/soal-bank.json     ← sumber utama (di-commit ke GitHub)
public/data/soal.json       ← salinan yang ikut ter-deploy (dibuat otomatis saat build)
scripts/salin-soal.mjs      ← skrip penyalin + validator
```

Saat aplikasi dibuka, ia mencoba memuat `data/soal.json` dari server.
Kalau berkas itu tidak ada / gagal diakses, aplikasi **otomatis memakai salinan bawaan**
yang sudah tertanam di dalam bundle — permainan tetap jalan normal.

> **Keuntungannya:** soal bisa diedit/ditambah langsung di GitHub (bahkan pada branch
> `gh-pages` hasil deploy) **tanpa perlu membangun ulang** aplikasi.

### Struktur JSON

```jsonc
{
  "versi": "1.0.0",
  "judul": "Bank Soal Bebek Gemoy",
  "aturan": {
    "langkahMenang": 10,        // langkah yang dibutuhkan untuk finis
    "maksSalahGantiSoal": 3,    // setelah 3x salah beruntun, soal diganti otomatis
    "panjangJawabanMaks": 8     // jumlah digit maksimal yang bisa diketik
  },

  // Batas angka untuk generator soal (tanpa batas jumlah soal)
  "rentang": {
    "1": {
      "tambah": {
        "mudah":  { "aMin": 1, "aMax": 5, "bMin": 1, "bMax": 5 },
        "sedang": { "aMin": 2, "aMax": 10, "bMin": 1, "bMax": 9 },
        "sulit":  { "aMin": 11, "aMax": 20, "bMin": 2, "bMax": 9 }
      },
      "bagi": {
        // khusus pembagian: h = hasil bagi, b = pembagi, soal menjadi (h × b) ÷ b
        "mudah": { "hMin": 1, "hMax": 2, "bMin": 2, "bMax": 3 }
      }
    }
  },

  // Soal cerita hasil kurasi guru — boleh ditambah sebanyak apa pun
  "bank": [
    {
      "id": "k1-cerita-01",
      "kelas": 1,
      "operasi": "tambah",   // tambah | kurang | kali | bagi
      "level": "mudah",      // mudah | sedang | sulit
      "teks": "Bebek Kuni punya 3 buah apel. Ibu memberi 2 apel lagi. Berapa apel Kuni sekarang?",
      "jawaban": 5
    }
  ]
}
```

### Menambah soal baru

1. Buka `src/data/soal-bank.json`.
2. Tambahkan objek baru ke dalam array `"bank"` (id harus unik).
3. Jalankan `node scripts/salin-soal.mjs` untuk memvalidasi + menyalin ke `public/data/soal.json`.
4. Commit & push — GitHub Actions akan membangun dan menerbitkan ulang situsnya.

Data yang tidak valid **tidak akan merusak aplikasi**: loader menambal field yang hilang
dengan nilai bawaan, dan item bank yang tidak lengkap otomatis diabaikan.

---

## 💻 Menjalankan di Komputer

```bash
npm install
npm run dev        # http://localhost:5173
```

Membuat versi produksi:

```bash
node scripts/salin-soal.mjs     # siapkan public/data/soal.json
npx vite build --base=./        # hasil ada di folder dist/
npm run preview                 # uji hasil build
```

> Flag `--base=./` **wajib** untuk GitHub Pages agar path aset bersifat relatif
> (proyek repo berada di sub-folder `https://username.github.io/nama-repo/`).

---

## 🚀 Deploy ke GitHub Pages

### Cara A — GitHub Actions (disarankan, otomatis)

Workflow sudah tersedia di [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Buat repositori baru di GitHub, lalu push proyek ini:
   ```bash
   git init
   git add .
   git commit -m "Bebek Gemoy: game balap hitung SD"
   git branch -M main
   git remote add origin https://github.com/USERNAME/bebek-gemoy.git
   git push -u origin main
   ```
2. Di GitHub buka **Settings → Pages**.
3. Pada bagian **Build and deployment → Source**, pilih **GitHub Actions**.
4. Buka tab **Actions** — workflow *Deploy ke GitHub Pages* berjalan otomatis.
5. Selesai. Situs tayang di `https://USERNAME.github.io/bebek-gemoy/`.

Setiap `git push` ke branch `main` akan men-deploy ulang secara otomatis.

### Cara B — Manual dengan paket `gh-pages`

```bash
npm install --save-dev gh-pages
node scripts/salin-soal.mjs
npx vite build --base=./
npx gh-pages -d dist --dotfiles
```

Lalu di **Settings → Pages → Source** pilih **Deploy from a branch**, branch `gh-pages`, folder `/ (root)`.

> `--dotfiles` diperlukan agar berkas `.nojekyll` ikut ter-upload.

### Cara C — Netlify / Vercel / Cloudflare Pages

- **Build command:** `node scripts/salin-soal.mjs && vite build --base=./`
- **Publish/output directory:** `dist`

---

## 🎮 Cara Bermain

1. Pilih **jenjang kelas**, **operasi hitung**, **level soal**, dan **target langkah**.
2. Pilih jumlah pemain (2–4) dan tulis nama masing-masing.
3. Tekan **Mulai Balapan!** — hitung mundur `3 · 2 · 1 · GO!`.
4. Tiap pemain mengetik jawaban di papan angka miliknya, lalu tekan **JAWAB**.
5. Benar → bebek maju 1 langkah & dapat soal baru. Salah → papan bergetar, coba lagi.
   Setelah 3× salah beruntun, soal diganti otomatis supaya anak tidak frustrasi.
6. Bebek pertama yang mencapai target langkah menjadi juara; layar peringkat muncul
   lengkap dengan durasi dan akurasi kelas.

### Papan ketik (opsional, Pemain 1)

| Tombol | Fungsi |
| --- | --- |
| `0`–`9` | mengetik angka |
| `Backspace` | hapus satu angka |
| `Esc` | kosongkan jawaban |
| `Enter` | kirim jawaban |

---

## 🧮 Peta Rentang Angka per Jenjang

| Kelas | Tambah / Kurang | Kali / Bagi |
| --- | --- | --- |
| 1 | sampai 20 | perkalian & pembagian dasar 1–5 |
| 2 | sampai 99 | tabel perkalian 1–10 |
| 3 | sampai 900 | 2–9 × 2–9 hingga 50 × 9 |
| 4 | sampai 9.999 | 2–3 digit × 2 digit |
| 5 | sampai 99.999 | 3–4 digit × 2 digit |
| 6 | sampai 999.999 | 4–5 digit × 2 digit |

Level **Mudah → Sedang → Sulit** menaikkan rentang angka serta memperbesar peluang
munculnya soal cerita.

---

## 🛠️ Teknologi

- **React 19** + **TypeScript**
- **Vite 7** (build satu berkas HTML melalui `vite-plugin-singlefile`)
- **Tailwind CSS 4**
- SVG murni untuk karakter bebek & latar (tanpa berkas gambar)
- **Web Audio API** untuk efek suara (tanpa berkas audio)
- **GitHub Actions** untuk deploy ke GitHub Pages

```
src/
├─ App.tsx                     # alur permainan: atur → hitung → main → selesai
├─ components/
│  ├ Duck.tsx                  # karakter bebek SVG (4 warna + aksesori)
│  ├ RaceTrack.tsx             # lintasan, latar langit/bukit, garis finis
│  ├ PlayerStation.tsx         # kolom soal + papan angka tiap pemain
│  ├ SetupScreen.tsx           # pilihan kelas, operasi, level, pemain
│  ├ WinScreen.tsx             # podium & peringkat
│  └ Confetti.tsx              # hujan konfeti
├─ data/soal-bank.json         # DATABASE SOAL
├─ lib/
│  ├ generator.ts              # generator soal deterministik (adil antar pemain)
│  ├ loader.ts                 # muat data/soal.json + fallback
│  ├ suara.ts                  # efek suara Web Audio
│  └ useReveal.ts              # animasi muncul saat digulir
└─ types.ts
```

---

## 📄 Lisensi

Bebas dipakai dan dimodifikasi untuk keperluan pendidikan.
