export interface Activities {
  days: number[];
  daysActivity: Map<number, number>;
}

export interface Heatmap {
  values: number[],
  sumActivities: number
}

const between = (v: number, min: number, max: number) => v >= min && v <= max;

export function genHeatmap(a: Activities, minDay: number, maxDay: number): Heatmap {
  const length = maxDay - minDay + 1;

  const values: number[] = new Array(length).fill(0);
  let sumActivities = 0;

  for (let i = 0; i < a.days.length; i++) {
    const day = a.days[i];
    if (!between(day, minDay, maxDay)) continue;
    const v = a.daysActivity.get(day);
    if (v === undefined) throw new Error("Panic!");
    if (v === 0) continue;
    values[day - minDay] = v;
    sumActivities += v;
  }

  return {
    values,
    sumActivities,
  };
}
