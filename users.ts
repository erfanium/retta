export interface Dataset {
  latestEventDay: number;
  users: Record<string, User>;
}

export interface User {
  id: string;
  registerDay: number;
  retention: {
    dataAvailable: boolean | null;
    heatmap: number[];
  };
  latestActivities: number[];
  sumLatestActivities: number;
  latestEventDate: Date;
  firstAvailableEventDate: Date;
}

const twoMin = 2 * 60 * 1000;
export const dateToDay = (d: Date) =>
  Math.floor(d.getTime() / (1000 * 60 * 60 * 24));

function addUser(
  users: Record<string, User>,
  id: string,
  registerDate: Date,
  firstAvailableEventDate: Date,
): User {
  const registerDay = dateToDay(registerDate);

  const u: User = {
    id,
    registerDay,
    retention: {
      dataAvailable: null,
      heatmap: new Array(14).fill(0),
    },
    // activityAverage: 0,
    latestActivities: new Array(14).fill(0),
    sumLatestActivities: 0,
    latestEventDate: new Date(0),
    firstAvailableEventDate,
  };

  users[id] = u;
  return u;
}

function addToRetentionHeatmap(u: User, eventDay: number) {
  if (u.retention.dataAvailable === null) {
    const delta = u.registerDay - dateToDay(u.firstAvailableEventDate);
    if (delta > 1) {
      u.retention.dataAvailable = false;
      return;
    }
  }

  if (u.retention.dataAvailable === false) return;
  u.retention.dataAvailable = true;

  const delta = eventDay - u.registerDay;
  if (delta > 13) return;
  if (u.retention.heatmap[delta] >= 9) return;

  u.retention.heatmap[delta]++;
}

function latestActivities(dataset: Dataset, u: User, eventDay: number) {
  const delta = dataset.latestEventDay - eventDay;
  if (delta > 13) return;
  if (u.latestActivities[delta] >= 9) return;
  u.latestActivities[delta]++;
  u.sumLatestActivities++;
}

export function addActivity(
  dataset: Dataset,
  id: string,
  date: Date,
  userRegisterDate: Date,
) {
  const u = dataset.users[id] ||
    addUser(dataset.users, id, userRegisterDate, date);
  if (date.getTime() - u.latestEventDate.getTime() < twoMin) return;

  const eventDay = dateToDay(date);

  // retention

  addToRetentionHeatmap(u, eventDay);
  latestActivities(dataset, u, eventDay);

  u.latestEventDate = date;
}
