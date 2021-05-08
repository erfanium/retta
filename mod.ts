import { readCSVObjects } from "https://deno.land/x/csv/mod.ts";
import { getDate } from "https://deno.land/x/objectid@0.1.0/mod.ts";
import { decodeString } from "https://deno.land/std@0.95.0/encoding/hex.ts";
import { addActivity } from "./users.ts";
import { dataset } from "./data.ts";
import { app } from "./server/mod.ts";

const file = "./logs.csv";

const f = await Deno.open(file);

for await (const log of readCSVObjects(f)) {
  const date = new Date(log.date);
  const registerDate = getDate(decodeString(log.userID));
  addActivity(dataset, log.userID, date, registerDate);
}


app.start({ port: 8000 })