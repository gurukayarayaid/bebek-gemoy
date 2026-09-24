import type { ProfilWarna } from "@/types";

interface PropsDuck {
  profil: ProfilWarna;
  nomor: number;
  ukuran?: number;
  className?: string;
  kedip?: boolean;
  title?: string;
}

/** Bebek gemoy: SVG murni, warna + aksesori berbeda tiap pemain. */
export default function Duck({ profil, nomor, ukuran = 76, className = "", kedip = true, title }: PropsDuck) {
  const k = profil.kunci;
  const bulu = `url(#bulu-${k}-${nomor})`;

  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 124 122"
      className={className}
      role="img"
      aria-label={title ?? `Bebek ${profil.nama} pemain ${nomor}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`bulu-${k}-${nomor}`} cx="36%" cy="28%" r="78%">
          <stop offset="0%" stopColor={profil.bulu} />
          <stop offset="100%" stopColor={profil.buluGelap} />
        </radialGradient>
        <linearGradient id={`sayap-${k}-${nomor}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* bayangan */}
      <ellipse cx="62" cy="115" rx="33" ry="5.5" fill="#16233d" opacity="0.16" />

      {/* ekor */}
      <path d="M32 64 L10 52 L30 84 Z" fill={profil.buluGelap} />

      {/* kaki */}
      <path d="M48 96 l-14 11 17 3z" fill="#ff9f1c" />
      <path d="M70 98 l-4 13 16 2z" fill="#ef8400" />

      {/* badan */}
      <ellipse cx="60" cy="76" rx="34" ry="27" fill={bulu} />

      {/* sayap */}
      <path d="M54 70c13-8 30-3 30 10 0 11-19 15-27 7-6-5-6-13-3-17z" fill={profil.buluGelap} opacity="0.9" />
      <path d="M54 70c13-8 30-3 30 10 0 11-19 15-27 7-6-5-6-13-3-17z" fill={`url(#sayap-${k}-${nomor})`} />

      {/* leher & kepala */}
      <circle cx="72" cy="58" r="17" fill={bulu} />
      <circle cx="84" cy="42" r="23" fill={bulu} />

      {/* paruh */}
      <path d="M103 38q20 3 20 9.5T103 57q-6-9.5 0-19z" fill="#ffab1f" />
      <path d="M104 51q13 1 13 5t-13 4q-4-5 0-9z" fill="#ef8400" />

      {/* mata */}
      <g className={kedip ? "anim-kedip" : undefined}>
        <ellipse cx="90" cy="37" rx="7.6" ry="8.2" fill="#fffdf7" />
        <circle cx="92.2" cy="37.6" r="4.7" fill="#16233d" />
        <circle cx="93.9" cy="35.5" r="1.8" fill="#ffffff" />
      </g>

      {/* pipi merona */}
      <ellipse cx="88" cy="53" rx="6.5" ry="4" fill="#ff8fa3" opacity="0.62" />

      {/* dasi kupu-kupu */}
      <g transform="translate(85 66) rotate(8)">
        <path d="M0 0 L-13 -8.5 L-13 8.5 Z" fill={profil.utama} />
        <path d="M0 0 L13 -8.5 L13 8.5 Z" fill={profil.utama} />
        <circle cx="0" cy="0" r="4.6" fill={profil.tua} />
      </g>

      {/* aksesori khas tiap pemain */}
      {k === "p1" && (
        <g>
          <path d="M61 27a23 23 0 0 1 46 0z" fill={profil.aksesori} />
          <path d="M101 25q22 3 20 12-11-3-22-6z" fill="#e8b21f" />
          <circle cx="84" cy="4" r="4.6" fill="#e8b21f" />
        </g>
      )}
      {k === "p2" && (
        <g transform="translate(64 24) rotate(-14)">
          <path d="M0 0 L-15 -10 L-15 10 Z" fill={profil.aksesori} />
          <path d="M0 0 L15 -10 L15 10 Z" fill={profil.aksesori} />
          <circle cx="0" cy="0" r="5.4" fill={profil.tua} />
        </g>
      )}
      {k === "p3" && (
        <g transform="translate(80 20)">
          <path d="M0 3C-5-8-14-11-17-3c4 5 11 8 17 6z" fill="#2f9e44" />
          <path d="M0 3C5-9 14-13 18-4c-4 6-12 9-18 7z" fill="#69db7c" />
          <circle cx="0" cy="0" r="5" fill="#ffd43b" />
          <circle cx="0" cy="0" r="2" fill="#f08c00" />
        </g>
      )}
      {k === "p4" && (
        <g>
          <circle cx="90" cy="37" r="11.5" fill="#ffffff" opacity="0.32" />
          <circle cx="90" cy="37" r="11.5" fill="none" stroke={profil.aksesori} strokeWidth="3.6" />
          <path d="M101 35q10-1 14 5" stroke={profil.aksesori} strokeWidth="3.6" fill="none" strokeLinecap="round" />
          <path d="M79 34q-9-3-15 1" stroke={profil.aksesori} strokeWidth="3.6" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* lencana nomor */}
      <g>
        <circle cx="39" cy="85" r="11.5" fill="#fffaf0" stroke={profil.tua} strokeWidth="3" />
        <text
          x="39"
          y="90"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill={profil.tua}
          fontFamily="'Baloo 2', sans-serif"
        >
          {nomor}
        </text>
      </g>
    </svg>
  );
}
