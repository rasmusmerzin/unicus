import { expect, test } from "vitest";
import { Subject } from "./Subject";

test("Subject", () => {
  const buffer = new Array<{ current: number; previous?: number }>();
  const control = new AbortController();
  const subject = new Subject(0);
  subject.next(1);
  subject.subscribe(
    (current, previous) => buffer.push({ current, previous }),
    control
  );
  expect(buffer.length).toBe(1);
  expect(buffer[0].current).toBe(1);
  expect(buffer[0].previous).toBeUndefined();
  subject.next(2);
  expect(buffer.length).toBe(2);
  expect(buffer[1].current).toBe(2);
  expect(buffer[1].previous).toBe(1);
  control.abort();
  subject.next(2);
  expect(buffer.length).toBe(2);
});
