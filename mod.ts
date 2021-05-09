import { app } from "./server/mod.ts";

export interface User {
  id: string;
  registerDay: number;
  activities: {
    days: number[];
    daysActivity: Map<number, number>;
  };
  latestEventDate: Date;
  firstAvailableEventDay: number;
}

export interface Dataset {
  users: Record<string, User>;
}

type Users = Record<string, User>;

const twoMin = 2 * 60 * 1000;

export let latestEventDay = () => dateToDay(new Date());

export const dateToDay = (d: Date) =>
  Math.floor(d.getTime() / (1000 * 60 * 60 * 24));

export const dataset: Dataset = {
  users: Object.create({}),
};

function addUser(
  id: string,
  registerDate: Date,
  firstAvailableEventDate: Date,
): User {
  const registerDay = dateToDay(registerDate);

  const u: User = {
    id,
    registerDay,
    activities: {
      days: [],
      daysActivity: new Map(),
    },
    latestEventDate: new Date(0),
    firstAvailableEventDay: dateToDay(firstAvailableEventDate),
  };

  dataset.users[id] = u;
  return u;
}

function addActivityToUser(u: User, date: Date) {
  if (date.getTime() - u.latestEventDate.getTime() < twoMin) return;

  const day = dateToDay(date);

  const a = u.activities;
  let v = a.daysActivity.get(day);
  if (v === undefined) {
    v = 0;
    a.days.push(day);
  }

  if (v < 9) {
    v++;
    a.daysActivity.set(day, v);
  }

  u.latestEventDate = date;
}

export function addActivity(
  id: string,
  date: Date,
  registerDate: Date,
) {
  let u = dataset.users[id];
  if (!u) {
    u = addUser(id, registerDate, date);
    addActivityToUser(u, registerDate);
  }

  addActivityToUser(u, date);
}

export function setLatestEventDayFn(fn: () => Date) {
  latestEventDay = () => dateToDay(fn());
}

export function start() {
  app.start({ port: Number(Deno.env.get('PORT')) || 8000 });
}
