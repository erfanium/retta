import SimpleLinearRegression from "https://esm.sh/ml-regression-simple-linear@2.0.3";
import { Dataset, User } from "./users.ts";
import { getCache, setCache } from "./cache.ts";

const x = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function regression(u: User) {
  return new SimpleLinearRegression(x, u.latestActivities);
}

interface activityRegression {
  a: number;
  b: number;
}

const cache: Map<string, activityRegression> = new Map();

export function calculateUserRegression(
  dataset: Dataset,
  id: string,
): activityRegression {
  const cacheData = getCache(cache, id);
  if (cacheData) return cacheData;
  const u = dataset.users[id];
  const r = regression(u);
  const activityRegression: activityRegression = {
    a: -r.slope,
    b: r.intercept,
  };

  setCache(cache, id, activityRegression);
  return activityRegression;
}
