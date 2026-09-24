import { useEffect, useRef } from "react";

/**
 * Skala font + transform agar teks selalu muat di dalam wadah (ikut zoom/resize).
 * Elemen target: `[data-pasang]` di dalam wadah (ref).
 */
export function usePasangTeks(isi: string, maks: number, min: number) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wadah = ref.current;
    if (!wadah) return;

    let batal = false;
    const pengamat: ResizeObserver[] = [];

    const hitung = () => {
      if (batal) return;
      const teks = wadah.querySelector<HTMLElement>("[data-pasang]");
      if (!teks) return;

      const gaya = getComputedStyle(wadah);
      const lebar =
        wadah.clientWidth - parseFloat(gaya.paddingLeft || "0") - parseFloat(gaya.paddingRight || "0");
      const tinggi =
        wadah.clientHeight - parseFloat(gaya.paddingTop || "0") - parseFloat(gaya.paddingBottom || "0");
      if (lebar < 4 || tinggi < 4) return;

      // reset
      teks.style.transform = "none";
      teks.style.transformOrigin = "center center";
      teks.style.fontSize = `${maks}px`;
      teks.style.lineHeight = "1.22";
      void teks.offsetHeight;

      let ukuran = maks;
      let jaga = 0;
      while (jaga++ < 100 && ukuran > min) {
        if (teks.scrollWidth <= lebar + 1 && teks.scrollHeight <= tinggi + 1) break;
        ukuran = Math.max(min, ukuran - 0.5);
        teks.style.fontSize = `${ukuran}px`;
        void teks.offsetHeight;
      }

      // cadangan: scale bila masih meluber
      if (teks.scrollWidth > lebar + 1 || teks.scrollHeight > tinggi + 1) {
        const skalaW = lebar / Math.max(1, teks.scrollWidth);
        const skalaH = tinggi / Math.max(1, teks.scrollHeight);
        const skala = Math.min(1, skalaW, skalaH);
        if (skala < 0.999) {
          teks.style.transform = `scale(${skala})`;
        }
      }
    };

    const jadwal = () => {
      cancelAnimationFrame(jadwal.raf);
      jadwal.raf = requestAnimationFrame(hitung);
    };
    jadwal.raf = 0;

    hitung();
    jadwal();

    const ro1 = new ResizeObserver(jadwal);
    ro1.observe(wadah);
    pengamat.push(ro1);
    const teks0 = wadah.querySelector<HTMLElement>("[data-pasang]");
    if (teks0) {
      const ro2 = new ResizeObserver(jadwal);
      ro2.observe(teks0);
      pengamat.push(ro2);
    }

    return () => {
      batal = true;
      cancelAnimationFrame(jadwal.raf);
      pengamat.forEach((r) => r.disconnect());
    };
  }, [isi, maks, min]);

  return ref;
}
