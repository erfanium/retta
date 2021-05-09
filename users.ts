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

type Users = Record<string, User>;

const twoMin = 2 * 60 * 1000;
export const dateToDay = (d: Date) =>
  Math.floor(d.getTime() / (1000 * 60 * 60 * 24));

function addUser(
  users: Users,
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

  users[id] = u;
  return u;
}

// function addToRetentionHeatmap(u: User, eventDay: number) {
//   if (u.retention.dataAvailable === null) {
//     const delta = u.registerDay - dateToDay(u.firstAvailableEventDate);
//     if (delta > 1) {
//       u.retention.dataAvailable = false;
//       return;
//     }
//   }

//   if (u.retention.dataAvailable === false) return;
//   u.retention.dataAvailable = true;

//   const delta = eventDay - u.registerDay;
//   if (delta > 13) return;
//   if (u.retention.heatmap[delta] >= 9) return;

//   u.retention.heatmap[delta]++;
// }

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
  users: Users,
  id: string,
  date: Date,
  registerDate: Date,
) {
  let u = users[id];
  if (!u) {
    u = addUser(users, id, registerDate, date);
    addActivityToUser(u, registerDate);
  }

  addActivityToUser(u, date);
}
