import { HandlerFunc } from "https://deno.land/x/abc@v1.3.1/mod.ts";
import { dataset, latestEventDay } from "../../data.ts";
import { genHeatmap } from "../../heatmap.ts";
import { calculateRegression } from "../../regression.ts";

interface Result {
  id: string;
  registerDay: number;
  heatmap: number[];
  slope: number;
}

export const getDecliningUsers: HandlerFunc = function (ctx) {
  const page: number = Number(ctx.queryParams.page) || 0;
  const maxDay = latestEventDay();
  const minDay = maxDay - 13;
  const results: Result[] = [];

  for (const id in dataset.users) {
    const u = dataset.users[id];

    // filter very new users
    if (u.registerDay - 7 > maxDay) continue;

    const heatmap = genHeatmap(u.activities, minDay, maxDay);

    // filter inactive users
    if (heatmap.sumActivities < 5) continue;

    const slope = calculateRegression(heatmap).slope;
    if (slope >= -0.1) continue;

    results.push({
      id,
      registerDay: u.registerDay,
      heatmap: heatmap.values,
      slope,
    });
  }

  return results
    .sort((a, b) => a.slope - b.slope)
    .slice(page, (page + 1) * 20);
};
