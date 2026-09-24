import { useMemo } from "react";
import { WARNA_PEMAIN } from "@/types";

const WARNA_KONFETI = [
  ...WARNA_PEMAIN.map((w) => w.utama),
  "#ffd43b",
  "#ffffff",
  "#ff8fb1",
  "#b47cff",
  "#4dd7ff",
];

export default function Confetti({ jumlah = 110 }: { jumlah?: number }) {
  const keping = useMemo(
    () =>
      Array.from({ length: jumlah }).map((_, i) => ({
        id: i,
        kiri: Math.random() * 100,
        lebar: 6 + Math.random() * 9,
        tinggi: 8 + Math.random() * 14,
        warna: WARNA_KONFETI[i % WARNA_KONFETI.length],
        durasi: 2.6 + Math.random() * 2.6,
        tunda: Math.random() * 2.4,
        dx: `${(Math.random() - 0.5) * 240}px`,
        rot: `${(Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720)}deg`,
        bundar: Math.random() > 0.65,
      })),
    [jumlah],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {keping.map((k) => (
        <span
          key={k.id}
          className="konfeti-keping"
          style={
            {
              left: `${k.kiri}%`,
              width: k.bundar ? k.lebar : k.lebar * 0.7,
              height: k.bundar ? k.lebar : k.tinggi,
              background: k.warna,
              borderRadius: k.bundar ? "50%" : "2px",
              animationDuration: `${k.durasi}s`,
              animationDelay: `${k.tunda}s`,
              "--dx": k.dx,
              "--rot": k.rot,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
