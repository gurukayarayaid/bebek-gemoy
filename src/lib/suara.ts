type Gelombang = OscillatorType;

class MesinSuara {
  private ctx: AudioContext | null = null;
  aktif = true;

  private konteks(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      try {
        this.ctx = new AC();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  setAktif(v: boolean) {
    this.aktif = v;
    if (v) this.konteks();
  }

  /** Buka konteks audio setelah interaksi pengguna (kebijakan browser). */
  buka() {
    this.konteks();
  }

  private nada(freq: number, mulai: number, durasi: number, tipe: Gelombang = "sine", volume = 0.16) {
    const ctx = this.konteks();
    if (!ctx || !this.aktif) return;
    const t0 = ctx.currentTime + mulai;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tipe;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durasi);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + durasi + 0.03);
  }

  private sapuan(fAwal: number, fAkhir: number, mulai: number, durasi: number, tipe: Gelombang = "triangle", volume = 0.14) {
    const ctx = this.konteks();
    if (!ctx || !this.aktif) return;
    const t0 = ctx.currentTime + mulai;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tipe;
    osc.frequency.setValueAtTime(fAwal, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, fAkhir), t0 + durasi);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durasi);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + durasi + 0.03);
  }

  klik() {
    this.nada(620, 0, 0.07, "square", 0.05);
  }

  langkah() {
    this.nada(523, 0, 0.09, "triangle", 0.1);
    this.nada(784, 0.06, 0.12, "triangle", 0.1);
  }

  benar() {
    this.nada(659, 0, 0.1, "triangle", 0.13);
    this.nada(880, 0.08, 0.1, "triangle", 0.13);
    this.nada(1175, 0.16, 0.2, "sine", 0.12);
  }

  salah() {
    this.sapuan(280, 90, 0, 0.3, "sawtooth", 0.09);
  }

  hitungMundur(akhir = false) {
    if (akhir) {
      this.nada(880, 0, 0.16, "square", 0.1);
      this.nada(1320, 0.1, 0.3, "square", 0.09);
    } else {
      this.nada(520, 0, 0.12, "square", 0.09);
    }
  }

  menang() {
    const nada = [523, 659, 784, 1047, 784, 1047, 1319];
    nada.forEach((f, i) => this.nada(f, i * 0.13, 0.24, "triangle", 0.15));
    this.sapuan(300, 1200, 0.1, 0.9, "sine", 0.07);
  }

  kecewa() {
    const nada = [523, 466, 392];
    nada.forEach((f, i) => this.nada(f, i * 0.16, 0.28, "sine", 0.11));
  }
}

export const suara = new MesinSuara();
