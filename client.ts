import { getCache, setCache } from "./cache.ts";

const metaSecret = Deno.env.get("META_SECRET")!;
if (metaSecret === undefined) {
  throw new Error('Deno.env.get("META_SECRET") not found');
}

const j = (res: Response) => res.json();

const namesCache: Map<string, { d: string }> = new Map();
const tagsCache: Map<string, { d: string[] }> = new Map();

export async function getUserName(uid: string): Promise<string> {
  const fromCache = getCache(namesCache, uid);
  if (fromCache) return fromCache.d;

  const data = await fetch(
    "https://meta.rghm.ir/api/field/136/remapping/137?value=" + uid,
    {
      headers: { "X-Metabase-Session": metaSecret },
    },
  ).then(j);

  setCache(namesCache, uid, { d: data[1] });
  return data[1];
}

export async function getUserTags(uid: string): Promise<string[]> {
  const fromCache = getCache(tagsCache, uid);
  if (fromCache) return fromCache.d;

  const json = {
    type: "query",
    query: {
      "source-table": 5,
      filter: ["=", ["field-id", 41], uid],
    },
    database: 2,
  };

  const form: Record<string, string> = {
    query: JSON.stringify(json),
  };

  const formBody = [];
  for (const property in form) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(form[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }

  const [result]: [{ limited: number }] = await fetch(
    "https://meta.rghm.ir/api/dataset/json",
    {
      method: "POST",
      headers: {
        "X-Metabase-Session": metaSecret,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: formBody.join("&"),
    },
  ).then(j);

  const tags = [];
  if (result.limited === 0) tags.push("Pro");
  setCache(tagsCache, uid, { d: tags });
  return tags;
}

export function getEvents(latestDate: Date) {
  const json = {
    database: 2,
    query: {
      "source-table": 10,
      fields: [
        ["field-id", 79],
        ["datetime-field", ["field-id", 77], "default"],
      ],
      // "order-by": [["asc", ["field-id", 77]]],,
      filter: [
        ">",
        ["datetime-field", ["field-id", 77], "minute"],
        latestDate.toISOString(),
      ],
    },
    type: "query",
  };

  const form: Record<string, string> = {
    query: JSON.stringify(json),
  };

  const formBody = [];
  for (const property in form) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(form[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }

  return fetch("https://meta.rghm.ir/api/dataset/csv", {
    method: "POST",
    headers: {
      "X-Metabase-Session": metaSecret,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: formBody.join("&"),
  });
}
