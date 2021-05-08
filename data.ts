import { Dataset, dateToDay, User } from "./users.ts";

export const dataset: Dataset = {
   latestEventDay: dateToDay(new Date('2021-05-07T01:52:58')),
   users: Object.create({})
}