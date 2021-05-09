import { readCSVObjects } from "https://deno.land/x/csv@v0.5.1/mod.ts";
import { getDate } from "https://deno.land/x/objectid@0.1.0/mod.ts";
import { readerFromStreamReader } from "https://deno.land/std@0.95.0/io/mod.ts";
import { decodeString } from "https://deno.land/std@0.95.0/encoding/hex.ts";
import * as Retta from "./mod.ts";
import { getEvents } from "./client.ts";

let latestDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

async function sync(reader: Deno.Reader) {
  let n = 0;
  
  for await (const log of readCSVObjects(reader)) {
    const date = new Date(log.date);
    latestDate = date;
    const registerDate = getDate(decodeString(log.userID));
    Retta.addActivity(log.userID, date, registerDate);
    n++;
  }

  console.log('sync', n)
  return n;
}

async function syncRemote() {
  const response =  await getEvents(latestDate)
  const reader = readerFromStreamReader(response.body!.getReader());
  return sync(reader)
}

async function syncViaFile() {
  const file = await Deno.open("./logs.csv");
  return sync(file)
}

await syncViaFile()
syncRemote()

setInterval(syncRemote, 10 * 60 * 1000)

Retta.start();
console.log("Retta started");
