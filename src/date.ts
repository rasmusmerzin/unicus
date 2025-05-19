export type DateLike = Date | string | number;

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const MONTHS_SHORT = MONTHS.map((month) => month.substring(0, 3));

export function formatDate(date: DateLike): string {
  date = new Date(date);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  const month_short = MONTHS_SHORT[date.getMonth()];
  if (isCurrentYear(date)) return `${date.getDate()} ${month_short}`;
  return `${date.getDate()} ${month_short}, ${date.getFullYear()}`;
}

export function formatTime(date: DateLike): string {
  return new Date(date).toLocaleTimeString("default", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function sameDate(a?: DateLike, b?: DateLike): boolean {
  if (!a || !b) return false;
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export function isToday(date: DateLike): boolean {
  return sameDate(date, new Date());
}

export function isYesterday(date: DateLike): boolean {
  return sameDate(date, new Date(Date.now() - DAY));
}

export function isCurrentYear(date: DateLike): boolean {
  return new Date(date).getFullYear() === new Date().getFullYear();
}
