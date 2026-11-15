import { describe, expect, it } from "vitest";
import { explainCron, parseCron } from "@/lib/cron";

const en = (e: string) => explainCron(e, "en");
const he = (e: string) => explainCron(e, "he");

describe("explainCron", () => {
  it("explains the schedules chapter 19 uses", () => {
    expect(en("0 2 * * *")).toBe("At 02:00, every day.");
    expect(en("30 8 * * 1-5")).toBe("At 08:30, on Monday through Friday.");
    expect(en("30 8 * * 0-4")).toBe("At 08:30, on Sunday through Thursday.");
    expect(en("*/15 * * * *")).toBe("Every 15 minutes.");
    expect(en("0 9 1 * *")).toBe("At 09:00, on day 1 of the month.");
    expect(en("0 0 * * 0")).toBe("At 00:00, on Sunday.");
    expect(en("* * * * *")).toBe("Every minute.");
    expect(en("@reboot")).toBe("Once, when the computer starts.");
  });

  it("handles steps, lists, ranges, names and both day fields", () => {
    expect(en("*/15 9-17 * * 1-5")).toBe("Every 15 minutes, during hours 9 through 17, on Monday through Friday.");
    expect(en("0 9,17 * * *")).toBe("At 09:00 and 17:00, every day.");
    expect(en("5 * * * *")).toBe("At minute 5 of every hour.");
    expect(en("0 */2 * * *")).toBe("At minute 0, every 2 hours.");
    expect(en("0 0 1 jan *")).toBe("At 00:00, on day 1 of the month, in January.");
    expect(en("0 12 * * sat,sun")).toBe("At 12:00, on Saturday and Sunday.");
    expect(en("0 12 * * 7")).toBe("At 12:00, on Sunday.");
    expect(en("0 6 1 * 1")).toBe("At 06:00, on day 1 of the month or on Monday.");
    expect(en("0-10 * * * *")).toBe("Every minute, at minutes 0 through 10.");
  });

  it("speaks Hebrew too", () => {
    expect(he("*/15 9-17 * * 1-5")).toBe("כל 15 דקות, בשעות 9 עד 17, בימים שני עד שישי.");
    expect(he("0 2 * * *")).toBe("בשעה 02:00, כל יום.");
    expect(he("30 8 * * 0-4")).toBe("בשעה 08:30, בימים ראשון עד חמישי.");
  });

  it("rejects invalid schedules and says which field is wrong", () => {
    expect(parseCron("60 * * * *")).toEqual({ ok: false, field: 0 });
    expect(parseCron("0 24 * * *")).toEqual({ ok: false, field: 1 });
    expect(parseCron("0 0 0 * *")).toEqual({ ok: false, field: 2 });
    expect(parseCron("0 0 * 13 *")).toEqual({ ok: false, field: 3 });
    expect(parseCron("0 0 * * 8")).toEqual({ ok: false, field: 4 });
    expect(parseCron("0 0 * *")).toEqual({ ok: false, field: null });
    expect(parseCron("5-1 * * * *")).toEqual({ ok: false, field: 0 });
    expect(explainCron("@sometimes", "en")).toBeNull();
  });
});
