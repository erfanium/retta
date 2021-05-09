import SimpleLinearRegression from "https://esm.sh/ml-regression-simple-linear@2.0.3";
import { Heatmap } from "./heatmap.ts";

const x = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

interface activityRegression {
  slope: number;
  intercept: number;
}

export function calculateRegression(heatmap: Heatmap): activityRegression {
  if (heatmap.values.length !== 14) throw new Error('Heatmap length should be 14')
  return new SimpleLinearRegression(x, heatmap.values);
}
