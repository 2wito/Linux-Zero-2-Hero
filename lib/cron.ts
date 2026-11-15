// Explains a crontab schedule (the five time fields) in plain Hebrew or English, for <CronExplainer /> in chapter 19.
// Field syntax follows cron(5) on Ubuntu (Vixie cron): * , - / numbers, month and day names, and the @ shortcuts.

import type { Locale } from "@/lib/i18n";

type Segment = { from: number; to: number; step: number };
// A parsed field: `any` is a bare star; `every` is a star with a step (every n).
export type Field = { any: boolean; every: number | null; segments: Segment[] };
export type Schedule = { minute: Field; hour: Field; dom: Field; month: Field; dow: Field };
export type CronResult = { ok: true; special: string | null; schedule: Schedule | null } | { ok: false; field: number | null };

const FIELDS = [
  { min: 0, max: 59 },
  { min: 0, max: 23 },
  { min: 1, max: 31 },
  { min: 1, max: 12, names: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] },
  { min: 0, max: 7, names: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] },
];

const SPECIALS = ["@reboot", "@yearly", "@annually", "@monthly", "@weekly", "@daily", "@midnight", "@hourly"];

function parseField(raw: string, index: number): Field | null {
  const spec = FIELDS[index];
  const num = (s: string): number | null => {
    if (/^\d+$/.test(s)) return Number(s);
    const i = spec.names?.indexOf(s.toLowerCase()) ?? -1;
    return i >= 0 ? i + spec.min : null;
  };
  if (raw === "*") return { any: true, every: null, segments: [{ from: spec.min, to: spec.max, step: 1 }] };
  const everyMatch = raw.match(/^\*\/(\d+)$/);
  if (everyMatch) {
    const n = Number(everyMatch[1]);
    if (n < 1 || n > spec.max) return null;
    return { any: false, every: n, segments: [{ from: spec.min, to: spec.max, step: n }] };
  }
  const segments: Segment[] = [];
  for (const item of raw.split(",")) {
    const m = item.match(/^([a-zA-Z0-9]+)(?:-([a-zA-Z0-9]+))?(?:\/(\d+))?$/);
    if (!m) return null;
    const from = num(m[1]);
    const to = m[2] !== undefined ? num(m[2]) : m[3] !== undefined ? spec.max : from;
    const step = m[3] !== undefined ? Number(m[3]) : 1;
    if (from === null || to === null || from < spec.min || to > spec.max || from > to || step < 1) return null;
    segments.push({ from, to, step });
  }
  return { any: false, every: null, segments };
}

export function parseCron(expr: string): CronResult {
  const text = expr.trim();
  if (text.startsWith("@")) return SPECIALS.includes(text.toLowerCase()) ? { ok: true, special: text.toLowerCase(), schedule: null } : { ok: false, field: null };
  const parts = text.split(/\s+/);
  if (parts.length !== 5) return { ok: false, field: null };
  const fields: Field[] = [];
  for (let i = 0; i < 5; i++) {
    const f = parseField(parts[i], i);
    if (!f) return { ok: false, field: i };
    fields.push(f);
  }
  const [minute, hour, dom, month, dow] = fields;
  return { ok: true, special: null, schedule: { minute, hour, dom, month, dow } };
}

// ---------- wording ----------

type Words = {
  join: (items: string[]) => string;
  range: (a: string, b: string) => string;
  stepRange: (n: number, a: string, b: string) => string;
  everyMinute: string;
  everyNMinutes: (n: number) => string;
  atMinutes: (list: string) => string;
  minutesRange: (list: string) => string;
  minuteOfEveryHour: (list: string) => string;
  atTimes: (list: string) => string;
  everyNHours: (n: number) => string;
  duringHours: (list: string) => string;
  everyDay: string;
  onDays: (list: string) => string;
  inMonths: (list: string) => string;
  onWeekdays: (list: string) => string;
  or: string;
  months: string[];
  days: string[];
  specials: Record<string, string>;
};

const WORDS: Record<Locale, Words> = {
  he: {
    join: (items) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} ו-${items[items.length - 1]}`),
    range: (a, b) => `${a} עד ${b}`,
    stepRange: (n, a, b) => `כל ${n} מ-${a} עד ${b}`,
    everyMinute: "כל דקה",
    everyNMinutes: (n) => `כל ${n} דקות`,
    atMinutes: (l) => `בדקה ${l}`,
    minutesRange: (l) => `כל דקה, בדקות ${l}`,
    minuteOfEveryHour: (l) => `בדקה ${l} של כל שעה`,
    atTimes: (l) => `בשעה ${l}`,
    everyNHours: (n) => `כל ${n} שעות`,
    duringHours: (l) => `בשעות ${l}`,
    everyDay: "כל יום",
    onDays: (l) => `ב-${l} לחודש`,
    inMonths: (l) => `בחודשים ${l}`,
    onWeekdays: (l) => `בימים ${l}`,
    or: "או",
    months: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
    days: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
    specials: {
      "@reboot": "פעם אחת, כשהמחשב עולה.",
      "@yearly": "פעם בשנה: ב-1 בינואר, בחצות.",
      "@annually": "פעם בשנה: ב-1 בינואר, בחצות.",
      "@monthly": "פעם בחודש: ב-1 לחודש, בחצות.",
      "@weekly": "פעם בשבוע: ביום ראשון, בחצות.",
      "@daily": "פעם ביום, בחצות.",
      "@midnight": "פעם ביום, בחצות.",
      "@hourly": "פעם בשעה, בדקה 0.",
    },
  },
  en: {
    join: (items) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`),
    range: (a, b) => `${a} through ${b}`,
    stepRange: (n, a, b) => `every ${n} from ${a} through ${b}`,
    everyMinute: "Every minute",
    everyNMinutes: (n) => `Every ${n} minutes`,
    atMinutes: (l) => `At minute ${l}`,
    minutesRange: (l) => `Every minute, at minutes ${l}`,
    minuteOfEveryHour: (l) => `At minute ${l} of every hour`,
    atTimes: (l) => `At ${l}`,
    everyNHours: (n) => `every ${n} hours`,
    duringHours: (l) => `during hours ${l}`,
    everyDay: "every day",
    onDays: (l) => `on day ${l} of the month`,
    inMonths: (l) => `in ${l}`,
    onWeekdays: (l) => `on ${l}`,
    or: "or",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    specials: {
      "@reboot": "Once, when the computer starts.",
      "@yearly": "Once a year: on January 1, at midnight.",
      "@annually": "Once a year: on January 1, at midnight.",
      "@monthly": "Once a month: on the 1st, at midnight.",
      "@weekly": "Once a week: on Sunday, at midnight.",
      "@daily": "Once a day, at midnight.",
      "@midnight": "Once a day, at midnight.",
      "@hourly": "Once an hour, at minute 0.",
    },
  },
};

const pad = (n: number) => String(n).padStart(2, "0");

/** The segments of a field as words: "1 through 5", "9 and 17", "every 2 from 0 through 23". */
function listOf(f: Field, w: Words, name: (n: number) => string): string {
  return w.join(
    f.segments.map((s) =>
      s.step > 1 ? w.stepRange(s.step, name(s.from), name(s.to)) : s.from === s.to ? name(s.from) : w.range(name(s.from), name(s.to)),
    ),
  );
}

const singles = (f: Field) => !f.any && f.every === null && f.segments.every((s) => s.from === s.to);

/** A one-sentence explanation of a crontab schedule, or null when the expression isn't valid. */
export function explainCron(expr: string, locale: Locale): string | null {
  const parsed = parseCron(expr);
  if (!parsed.ok) return null;
  const w = WORDS[locale];
  if (parsed.special) return w.specials[parsed.special];
  const { minute, hour, dom, month, dow } = parsed.schedule!;
  const num = (n: number) => String(n);

  let time: string;
  if (singles(minute) && minute.segments.length === 1 && singles(hour)) {
    time = w.atTimes(w.join(hour.segments.map((h) => `${pad(h.from)}:${pad(minute.segments[0].from)}`)));
  } else {
    time = minute.any
      ? w.everyMinute
      : minute.every !== null
        ? w.everyNMinutes(minute.every)
        : singles(minute)
          ? hour.any
            ? w.minuteOfEveryHour(listOf(minute, w, num))
            : w.atMinutes(listOf(minute, w, num))
          : w.minutesRange(listOf(minute, w, num));
    if (hour.every !== null) time += `, ${w.everyNHours(hour.every)}`;
    else if (!hour.any) time += `, ${w.duringHours(listOf(hour, w, num))}`;
  }

  const dates: string[] = [];
  const monthName = (n: number) => w.months[n - 1];
  const dayName = (n: number) => w.days[n % 7];
  if (!dom.any && !dow.any) dates.push(`${w.onDays(listOf(dom, w, num))} ${w.or} ${w.onWeekdays(listOf(dow, w, dayName))}`);
  else if (!dom.any) dates.push(w.onDays(listOf(dom, w, num)));
  else if (!dow.any) dates.push(w.onWeekdays(listOf(dow, w, dayName)));
  if (!month.any) dates.push(w.inMonths(listOf(month, w, monthName)));
  // "every day" only when a specific time of day would otherwise read as a one-off.
  if (!dates.length && singles(hour)) dates.push(w.everyDay);

  return [time, ...dates].join(", ") + ".";
}
