export type VisualQuality = "full" | "reduced";

/** Rendering heuristic, not a device benchmark. Cadence is learned from the
 * browser's own frames, so steady 30/60/120 Hz are not ranked as hardware tiers. */
export class VisualQualityPolicy {
  quality: VisualQuality = "full";
  private cadence: number | null = null;
  private bad = 0;
  private good = 0;
  private changedAt = 0;
  private recoveryUsed = false;

  resetEvidence() {
    this.cadence = null;
    this.bad = this.good = 0;
  }

  observe(intervals: readonly number[], now: number): VisualQuality {
    const frames = intervals.filter(n => Number.isFinite(n) && n >= 4 && n <= 250);
    if (frames.length < 8) { this.bad = this.good = 0; return this.quality; }
    const sorted = [...frames].sort((a, b) => a - b);
    const cadence = sorted[Math.floor(sorted.length * 0.2)];
    this.cadence = Math.min(this.cadence ?? cadence, cadence);
    const late = frames.filter(n => n > this.cadence! * 1.8).length / frames.length;
    this.bad = late >= 0.25 ? this.bad + 1 : 0;
    this.good = late <= 0.05 ? this.good + 1 : 0;
    if (this.quality === "full" && this.bad >= 2) {
      this.quality = "reduced";
      this.changedAt = now;
      this.bad = this.good = 0;
    } else if (this.quality === "reduced" && !this.recoveryUsed &&
      this.good >= 8 && now - this.changedAt >= 60_000) {
      // One recovery trial per page lifetime prevents repeated full/lite flips
      // when removing the effects is precisely what made rendering healthy.
      this.quality = "full";
      this.recoveryUsed = true;
      this.bad = this.good = 0;
    }
    return this.quality;
  }
}
