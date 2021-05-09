import { HandlerFunc } from "https://deno.land/x/abc@v1.3.1/mod.ts";
import { dataset, latestEventDay } from "../../mod.ts";
import { genHeatmap } from "../../heatmap.ts";
import { calculateRegression } from "../../regression.ts";

interface Result {
  id: string;
  registerDay: number;
  heatmap: number[];
  slope: number;
  intercept: number;
  rating: number;
}

const limit = (v: number, max: number, min: number) => {
  if (v > max) return max;
  if (v < min) return min;
  return v;
};

export const getGrowingUsers: HandlerFunc = function (ctx) {
  const page: number = Number(ctx.queryParams.page) || 0;
  const maxDay = latestEventDay();
  const minDay = maxDay - 13;
  const results: Result[] = [];

  for (const id in dataset.users) {
    const u = dataset.users[id];

    // filter very new users
    if (u.registerDay > maxDay) continue;

    const heatmap = genHeatmap(u.activities, minDay, maxDay);

    // filter inactive users
    if (heatmap.sumActivities < 5) continue;

    const { slope, intercept } = calculateRegression(heatmap);
    if (slope <= 0.1) continue;

    results.push({
      id,
      registerDay: u.registerDay,
      heatmap: heatmap.values,
      slope,
      intercept,
      rating: (slope * 4) + limit(intercept, 1, -1),
    });
  }

  return results
    .sort((a, b) => b.rating - a.rating)
    .slice(page, (page + 1) * 20);
};
