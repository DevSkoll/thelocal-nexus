export const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export const MONTHLY_NTHS = ["first", "second", "third", "fourth", "last"] as const;

export type Weekday = (typeof WEEKDAYS)[number];
export type MonthlyNth = (typeof MONTHLY_NTHS)[number];
export type RecurrencePreset = "none" | "daily" | "weekly" | "monthly" | "custom";

export const RECURRENCE_PRESETS: { value: RecurrencePreset; label: string }[] = [
  { value: "none", label: "Doesn't repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Other" },
];

export const WEEKDAY_OPTIONS: { value: Weekday; label: string }[] = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

export const MONTHLY_NTH_OPTIONS: { value: MonthlyNth; label: string }[] = [
  { value: "first", label: "First" },
  { value: "second", label: "Second" },
  { value: "third", label: "Third" },
  { value: "fourth", label: "Fourth" },
  { value: "last", label: "Last" },
];

export type ParsedRecurrence = {
  preset: RecurrencePreset;
  weekday: Weekday;
  nth: MonthlyNth;
  time: string;
  custom: string;
};

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const WEEKDAY_SET = new Set<string>(WEEKDAYS);

function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function formatClock(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr ?? 0);
  if (!Number.isFinite(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${Number.isFinite(m) ? m.toString().padStart(2, "0") : "00"} ${period}`;
}

export function parseRecurrenceRule(rule: string | null | undefined): ParsedRecurrence {
  const empty: ParsedRecurrence = {
    preset: "none",
    weekday: "saturday",
    nth: "first",
    time: "09:00",
    custom: "",
  };
  const raw = rule?.trim() ?? "";
  if (!raw) return empty;

  const daily = raw.match(/^daily:(\d{2}:\d{2})$/i);
  if (daily && TIME_RE.test(daily[1])) {
    return { ...empty, preset: "daily", time: daily[1] };
  }

  const weekly = raw.match(/^weekly:([a-z]+):(\d{2}:\d{2})$/i);
  if (weekly) {
    const day = weekly[1].toLowerCase();
    if (WEEKDAY_SET.has(day) && TIME_RE.test(weekly[2])) {
      return { ...empty, preset: "weekly", weekday: day as Weekday, time: weekly[2] };
    }
  }

  const monthly = raw.match(
    /^monthly:(first|second|third|fourth|last):([a-z]+):(\d{2}:\d{2})$/i
  );
  if (monthly) {
    const day = monthly[2].toLowerCase();
    if (WEEKDAY_SET.has(day) && TIME_RE.test(monthly[3])) {
      return {
        ...empty,
        preset: "monthly",
        nth: monthly[1].toLowerCase() as MonthlyNth,
        weekday: day as Weekday,
        time: monthly[3],
      };
    }
  }

  const customPrefixed = raw.match(/^custom:([\s\S]*)$/);
  if (customPrefixed) {
    return { ...empty, preset: "custom", custom: customPrefixed[1] };
  }

  return { ...empty, preset: "custom", custom: raw };
}

export function serializeRecurrenceRule(parsed: ParsedRecurrence): string {
  switch (parsed.preset) {
    case "none":
      return "";
    case "daily":
      return `daily:${parsed.time}`;
    case "weekly":
      return `weekly:${parsed.weekday}:${parsed.time}`;
    case "monthly":
      return `monthly:${parsed.nth}:${parsed.weekday}:${parsed.time}`;
    case "custom":
      return `custom:${parsed.custom}`;
  }
}

export function formatRecurrenceRule(rule: string | null | undefined): string | null {
  const parsed = parseRecurrenceRule(rule);
  if (parsed.preset === "none") return null;
  const time = formatClock(parsed.time);
  const day = capitalize(parsed.weekday);
  switch (parsed.preset) {
    case "daily":
      return `Every day at ${time}`;
    case "weekly":
      return `Every ${day} at ${time}`;
    case "monthly":
      return `${capitalize(parsed.nth)} ${day} of each month at ${time}`;
    case "custom":
      return parsed.custom.trim() || null;
  }
}
