import { readCSVObjects } from "https://deno.land/x/csv/mod.ts";
import { getDate } from "https://deno.land/x/objectid@0.1.0/mod.ts";
import { decodeString } from "https://deno.land/std@0.95.0/encoding/hex.ts";
import * as Retta from "./mod.ts";

const file = await Deno.open("./logs.csv");
let latestEventDate: Date; 

for await (const log of readCSVObjects(file)) {
  const date = new Date(log.date);
  latestEventDate = date;
  const registerDate = getDate(decodeString(log.userID));
  Retta.addActivity(log.userID, date, registerDate);
}

Retta.setLatestEventDayFn(() => latestEventDate)
Retta.start()
console.log('Retta started')