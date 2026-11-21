import type { Destination, Itinerary } from '@shared/types';
import { MONTHS } from './format';

export type Budget = 'low' | 'mid' | 'high';
export type TripType = 'nature' | 'adventure' | 'relaxed' | 'culture';
export type Group = 'solo' | 'couple' | 'family' | 'friends';

export interface PlannerInput {
  budget: Budget;
  days: number;
  type: TripType;
  group: Group;
  month: number;
  activities: string[];
}

const TYPE_EXP: Record<TripType, string[]> = {
  nature: ['river', 'photography', 'waterfalls', 'adventure'],
  adventure: ['adventure', 'river', 'waterfalls'],
  relaxed: ['tea', 'photography', 'food'],
  culture: ['culture', 'food', 'tea'],
};
const GROUP_EXP: Record<Group, string> = { solo: 'adventure', couple: 'photography', family: 'tea', friends: 'river' };

/** Geographic clusters around Sylhet. Changing cluster costs travel time. */
export const CLUSTER: Record<string, 'north' | 'south' | 'west'> = {
  sust: 'north', ratargul: 'north', bisanakandi: 'north', jaflong: 'north', lalakhal: 'north',
  sreemangal: 'south', 'hakaluki-haor': 'south', madhabkunda: 'south',
  'tanguar-haor': 'west',
};
const ORDER = { north: 0, south: 1, west: 2 } as const;

export interface Match {
  d: Destination;
  score: number;
  reasons: string[];
  warn?: string;
}

export function rank(list: Destination[], i: PlannerInput): Match[] {
  return list
    .map((d) => {
      let score = 0;
      const reasons: string[] = [];
      let warn: string | undefined;
      const picked = d.experiences.filter((e) => i.activities.includes(e));
      score += picked.length * 3;
      if (picked.length) reasons.push(`Matches ${picked.length} of your activities`);
      const typed = d.experiences.filter((e) => TYPE_EXP[i.type].includes(e)).length;
      score += typed * 2;
      if (typed >= 2) reasons.push(`Strong fit for a ${i.type} trip`);
      if (d.bestMonths.includes(i.month)) {
        score += 4;
        reasons.push(`In season in ${MONTHS[i.month - 1]}`);
      } else {
        score -= 3;
        warn = `Off season in ${MONTHS[i.month - 1]}. Best: ${d.bestSeason}`;
      }
      const budgetFit = { low: [2, 0, -5], mid: [1, 1, -1], high: [1, 1, 2] }[i.budget][d.budgetLevel - 1];
      score += budgetFit;
      if (budgetFit < 0) warn = warn ?? 'Above your budget';
      if (d.experiences.includes(GROUP_EXP[i.group])) score += 1;
      if (d.minDays > i.days) {
        score -= 4;
        warn = warn ?? `Needs at least ${d.minDays} days`;
      }
      if (d.featured) score += 0.5;
      return { d, score, reasons, warn };
    })
    .sort((a, b) => b.score - a.score);
}

/** Lay chosen destinations over the available days, grouped by area to cut travel. */
export function autoPlan(chosen: Destination[], days: number) {
  const sorted = [...chosen].sort((a, b) => ORDER[CLUSTER[a.slug] ?? 'north'] - ORDER[CLUSTER[b.slug] ?? 'north'] || a.distanceKm - b.distanceKm);
  const stops: Itinerary['stops'] = [];
  const dropped: Destination[] = [];
  let day = 1;
  for (const d of sorted) {
    const cluster = CLUSTER[d.slug] ?? 'north';
    const need = d.minDays;
    if (day + need - 1 > days) {
      dropped.push(d);
      continue;
    }
    // Two short half-day places in the same cluster can share a day.
    const last = stops.at(-1);
    const lastDest = last && chosen.find((c) => c.slug === last.destinationSlug);
    const share = lastDest && CLUSTER[lastDest.slug] === cluster && lastDest.minDays === 1 && d.minDays === 1 && stops.filter((s) => s.day === last!.day).length < 2 && d.distanceKm + lastDest.distanceKm < 80;
    if (share) {
      stops.push({ destinationSlug: d.slug, day: last!.day });
    } else {
      stops.push({ destinationSlug: d.slug, day });
      day += need;
    }
  }
  return { stops, dropped, usedDays: Math.max(0, day - 1) };
}

const STAY = { low: [600, 1200], mid: [1800, 3500], high: [6000, 10000] } as const; // per person per night
const FOOD = { low: [400, 700], mid: [700, 1200], high: [1200, 2500] } as const; // per person per day

export function estimate(trip: Itinerary, all: Destination[], budget: Budget) {
  const people = Math.max(1, trip.travelers);
  let lo = 0;
  let hi = 0;
  const lines: { label: string; min: number; max: number }[] = [];
  for (const s of trip.stops) {
    const d = all.find((x) => x.slug === s.destinationSlug);
    if (!d) continue;
    let a = 0;
    let b = 0;
    for (const c of d.costs) {
      if (/stay|houseboat/i.test(c.label) && !/per person/i.test(c.note ?? c.label)) continue;
      const f = /boat|transport/i.test(c.label) && !/per person/i.test(c.label + (c.note ?? '')) ? 1 / people : 1;
      a += c.min * f;
      b += c.max * f;
    }
    lines.push({ label: d.name, min: a, max: b });
    lo += a;
    hi += b;
  }
  const nights = Math.max(0, trip.days - 1);
  const stay = { label: `${nights} night${nights === 1 ? '' : 's'} of stay`, min: STAY[budget][0] * nights, max: STAY[budget][1] * nights };
  const food = { label: `Food for ${trip.days} day${trip.days === 1 ? '' : 's'}`, min: FOOD[budget][0] * trip.days, max: FOOD[budget][1] * trip.days };
  lines.push(stay, food);
  lo += stay.min + food.min;
  hi += stay.max + food.max;
  return { lines, perPerson: [lo, hi] as const, group: [lo * people, hi * people] as const };
}

/** Minimum days the current stops need, including a half day per change of area. */
export function minimumDays(trip: Itinerary, all: Destination[]) {
  const ds = trip.stops.map((s) => all.find((d) => d.slug === s.destinationSlug)).filter(Boolean) as Destination[];
  const clusters = new Set(ds.map((d) => CLUSTER[d.slug] ?? 'north'));
  const base = ds.reduce((n, d) => n + (d.minDays > 1 ? d.minDays : 0.6), 0);
  return Math.max(1, Math.ceil(base + (clusters.size - 1) * 0.5));
}
