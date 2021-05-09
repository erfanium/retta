import { User } from "./users.ts";

export interface Dataset {
   users: Record<string, User>;
 }

export const dataset: Dataset = {
   users: Object.create({})
}

export function latestEventDay() {
   return 18753
}