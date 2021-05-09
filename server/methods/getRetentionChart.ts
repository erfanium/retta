import { HandlerFunc } from "https://deno.land/x/abc@v1.3.1/mod.ts";
import { dataset, latestEventDay } from "../../data.ts";

export const getRetentionChart: HandlerFunc = function (ctx) {
  const nDays = Number(ctx.queryParams.nDays) || 7;
  const registerMaxDay = Number(ctx.queryParams.registerMaxDay) ||
    latestEventDay() - 1;
  const registerMinDay = Number(ctx.queryParams.registerMinDay) ||
    registerMaxDay - 30 - nDays;

  const result = Array(nDays).fill(0);
  let nUsers = 0;

  for (const id in dataset.users) {
    const u = dataset.users[id];

    // filter very new users
    if (u.registerDay > registerMaxDay - nDays) continue;
    if (u.registerDay < registerMinDay) continue;
    if (u.firstAvailableEventDay - u.registerDay > 0) continue;

    result[0]++;
    nUsers++;

    for (let i = 0; i < u.activities.days.length; i++) {
      const delta = u.activities.days[i] - u.registerDay;
      if (delta > nDays - 1) continue;
      if (delta === 0) continue;
      result[delta]++;
    }
  }

  return {
    chart: result,
    nUsers,
  };
};
