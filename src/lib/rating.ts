import { hourInZone } from "@/lib/dates";
import type { MoonInfo, SolunarPeriod } from "@/lib/solunar";
import { periodActive } from "@/lib/solunar";

export type Rating = {
  score: number;
  title: string;
  factors: string[];
};

export type RatingInput = {
  now: Date;
  timeZone: string;
  tempF: number;
  windMph: number;
  cloud: number;
  pressure: "rising" | "steady" | "falling";
  pressureDelta: number;
  sunrise: Date;
  sunset: Date;
  moon: MoonInfo;
  periods: SolunarPeriod[];
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function nearSun(now: Date, sunrise: Date, sunset: Date, minutes: number): boolean {
  const window = minutes * 60 * 1000;
  const t = now.getTime();
  return Math.abs(t - sunrise.getTime()) <= window || Math.abs(t - sunset.getTime()) <= window;
}

export function rateConditions(input: RatingInput): { bite: Rating; move: Rating } {
  const biteFactors: string[] = [];
  const moveFactors: string[] = [];
  let bite = 4.1;
  let move = 3.8;

  const inMajor = periodActive(input.periods, input.now, "major");
  const inMinor = periodActive(input.periods, input.now, "minor");
  const lowLight = nearSun(input.now, input.sunrise, input.sunset, 70);
  const hour = hourInZone(input.now, input.timeZone);
  const strongMoon = input.moon.age < 2.2 || (input.moon.age > 13.4 && input.moon.age < 16.8);

  if (input.pressure === "falling" && input.pressureDelta > -0.12) {
    bite += 1.5;
    biteFactors.push("Glass falling easy");
  } else if (input.pressure === "falling") {
    bite += 0.6;
    biteFactors.push("Glass dropping hard");
  } else if (input.pressure === "rising") {
    bite += 0.25;
    move += 1.0;
    moveFactors.push("Rising glass");
  } else {
    biteFactors.push("Steady glass");
  }

  if (input.windMph >= 4 && input.windMph <= 12) {
    bite += 1.3;
    move += 1.2;
    biteFactors.push("Light wind");
    moveFactors.push("Walkable wind");
  } else if (input.windMph > 12 && input.windMph <= 18) {
    bite += 0.35;
    move -= 0.4;
    biteFactors.push("Breeze getting sporty");
  } else if (input.windMph > 18) {
    bite -= 1.2;
    move -= 1.5;
    biteFactors.push("Wind too hard");
    moveFactors.push("They'll hold cover");
  } else {
    bite += 0.15;
  }

  if (input.cloud >= 70) {
    bite += 0.8;
    biteFactors.push("Cloud cover");
  } else if (input.cloud <= 20 && hour >= 10 && hour <= 15) {
    bite -= 0.45;
  }

  if (inMajor) {
    bite += 1.7;
    move += 0.7;
    biteFactors.push("Major period");
  } else if (inMinor) {
    bite += 0.85;
    biteFactors.push("Minor period");
  }

  if (lowLight) {
    bite += 1.05;
    move += 2.1;
    biteFactors.push("Dawn or dusk");
    moveFactors.push("Low light");
  } else if (hour >= 10 && hour <= 14) {
    move -= 1.15;
    moveFactors.push("Midday lull");
  }

  if (strongMoon) {
    bite += 0.65;
    biteFactors.push(input.moon.name);
  }

  if (input.tempF >= 48 && input.tempF <= 78) {
    bite += 0.55;
  } else if (input.tempF < 35 || input.tempF > 92) {
    bite -= 0.7;
    biteFactors.push("Temperature is working against you");
  }

  if (input.tempF >= 28 && input.tempF <= 62) {
    move += 0.65;
    moveFactors.push("Comfortable air");
  }
  if (input.pressure === "falling" && !lowLight) {
    move += 0.55;
    moveFactors.push("Front stirring them");
  }
  if (strongMoon && !lowLight) {
    move -= 0.35;
  }

  bite = clamp(round1(bite), 0.4, 9.8);
  move = clamp(round1(move), 0.4, 9.8);

  return {
    bite: { score: bite, title: biteTitle(bite), factors: biteFactors.slice(0, 3) },
    move: { score: move, title: moveTitle(move), factors: moveFactors.slice(0, 3) },
  };
}

function biteTitle(score: number): string {
  if (score >= 8) return "On the bite";
  if (score >= 6.5) return "Worth a cast";
  if (score >= 4.5) return "Scratching";
  return "Slow";
}

function moveTitle(score: number): string {
  if (score >= 8) return "On their feet";
  if (score >= 6.5) return "A window";
  if (score >= 4.5) return "Tight";
  return "Bedded down";
}

export function coarseDawnRating(input: {
  tempF: number;
  windMph: number;
  cloud: number;
  pressure: "rising" | "steady" | "falling";
  moonIllumination: number;
  majorNearSunrise: boolean;
}): { bite: number; move: number } {
  let bite = 4.4;
  let move = 5.6;
  if (input.pressure === "falling") bite += 1.3;
  if (input.pressure === "rising") move += 0.8;
  if (input.windMph >= 4 && input.windMph <= 12) {
    bite += 1.1;
    move += 0.9;
  } else if (input.windMph > 18) {
    bite -= 1;
    move -= 1.2;
  }
  if (input.cloud >= 60) bite += 0.6;
  if (input.majorNearSunrise) {
    bite += 1.2;
    move += 0.5;
  }
  if (input.moonIllumination > 0.9 || input.moonIllumination < 0.08) bite += 0.4;
  if (input.tempF >= 40 && input.tempF <= 70) move += 0.4;
  if (input.tempF >= 48 && input.tempF <= 78) bite += 0.4;
  return {
    bite: clamp(round1(bite), 0.5, 9.8),
    move: clamp(round1(move), 0.5, 9.8),
  };
}
