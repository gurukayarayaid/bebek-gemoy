import { useEffect } from "react";

/** Menambahkan kelas `sudah-muncul` pada elemen `.munculkan` saat masuk viewport. */
export function useScrollReveal(deps: unknown[]) {
  useEffect(() => {
    const elemen = Array.from(document.querySelectorAll<HTMLElement>(".munculkan"));
    if (!elemen.length) return;

    if (typeof IntersectionObserver === "undefined") {
      elemen.forEach((el) => el.classList.add("sudah-muncul"));
      return;
    }

    const io = new IntersectionObserver(
      (entri) => {
        entri.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("sudah-muncul");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    elemen.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
      io.observe(el);
    });

    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
