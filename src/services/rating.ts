import { Beach, BeachPosition } from '@src/models/beach';
// meters
const waveHeights = {
  ankleToKnee: {
    min: 0.3,
    max: 1.0,
  },
  waistHigh: {
    min: 1.0,
    max: 2.0,
  },
  headHigh: {
    min: 2.0,
    max: 2.5,
  },
};
export class Rating {
  constructor(private beach: Beach) {
    this.beach = beach;
  }

  public getRatingBasedOnWindAndWavePosition(
    waveDirection: BeachPosition,
    windDirection: BeachPosition
  ): number {
    if (windDirection === waveDirection) return 1;
    if (this.isWindOffShore(waveDirection, windDirection)) return 5;

    return 3;
  }

  public getRatingBasedOnSwellPeriod(swellPeriod: number): number {
    if (swellPeriod >= 7 && swellPeriod < 10) return 2;
    if (swellPeriod >= 10 && swellPeriod < 14) return 4;
    if (swellPeriod >= 14) return 5;
    return 1;
  }

  public getRatingForSwellSize(swellHeight: number): number {
    if (swellHeight < waveHeights.ankleToKnee.min) return 1;
    if (
      swellHeight >= waveHeights.ankleToKnee.min &&
      swellHeight < waveHeights.ankleToKnee.max
    )
      return 2;
    if (
      swellHeight >= waveHeights.waistHigh.min &&
      swellHeight < waveHeights.waistHigh.max
    )
      return 4;
    if (swellHeight > waveHeights.headHigh.min) return 5;
    return 1;
  }

  public getPositionFromLocation(coordinates: number): BeachPosition {
    if (coordinates >= 310 || (coordinates < 50 && coordinates >= 0)) {
      return BeachPosition.N;
    }
    if (coordinates >= 50 && coordinates < 120) {
      return BeachPosition.E;
    }
    if (coordinates >= 120 && coordinates < 220) {
      return BeachPosition.S;
    }
    if (coordinates >= 220 && coordinates < 310) {
      return BeachPosition.W;
    }
    return BeachPosition.E;
  }

  private isWindOffShore(
    waveDirection: string,
    windDirection: string
  ): boolean {
    return (
      (waveDirection === BeachPosition.N &&
        windDirection === BeachPosition.S &&
        this.beach.position === BeachPosition.N) ||
      (waveDirection === BeachPosition.S &&
        windDirection === BeachPosition.N &&
        this.beach.position === BeachPosition.S) ||
      (waveDirection === BeachPosition.E &&
        windDirection === BeachPosition.W &&
        this.beach.position === BeachPosition.E) ||
      (waveDirection === BeachPosition.W &&
        windDirection === BeachPosition.E &&
        this.beach.position === BeachPosition.W)
    );
  }
}
