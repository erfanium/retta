import { HandlerFunc } from "https://deno.land/x/abc@v1.3.1/mod.ts";
import { dataset } from "../../data.ts";
import { calculateUserRegression } from "../../regression.ts";

interface Result {
  id: string;
  registerDay: number,
  heatmap: number[];
  activityAverage: number;
  a: number;
}

export const getTopUsers: HandlerFunc = function () {
  const maxRegisterDay = dataset.latestEventDay - 13;
  const results: Result[] = [];

  for (const id in dataset.users) {
    const u = dataset.users[id];
    if (u.registerDay > maxRegisterDay) continue;
    const a = calculateUserRegression(dataset, id).a;
    if (Math.abs(a) >= 0.1) continue;

    results.push({
      id,
      registerDay: u.registerDay,
      heatmap: u.latestActivities.slice().reverse(),
      activityAverage: u.sumLatestActivities / 14,
      a
    });
  }

  return results
    .sort((a, b) => b.activityAverage - a.activityAverage)
    .slice(0, 20);
};
