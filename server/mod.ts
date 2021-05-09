import {
  Application,
  HandlerFunc,
} from "https://deno.land/x/abc@v1.3.1/mod.ts";
import { cors } from "https://deno.land/x/abc@v1.3.1/middleware/cors.ts";
import { getGrowingUsers } from "./methods/getGrowingUsers.ts";
import { getTopUsers } from "./methods/getTopUsers.ts";
import { getDecliningUsers } from "./methods/getDecliningUsers.ts";
import { getRetentionChart } from "./methods/getRetentionChart.ts";

const methods: Record<string, HandlerFunc> = {
  getGrowingUsers,
  getTopUsers,
  getDecliningUsers,
  getRetentionChart
};

export const app = new Application();

app.use(cors());

for (const methodName in methods) {
  const path = "/" + methodName;
  const handler = methods[methodName];

  if (methodName.startsWith("get")) {
    app.get(path, handler);
  } else {
    app.post(path, handler);
  }
}
