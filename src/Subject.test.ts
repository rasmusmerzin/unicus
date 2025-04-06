import { expect, test } from "vitest";
import { Subject } from "./Subject";

test("Subject", () => {
  const buffer = new Array<number>();
  const control = new AbortController();
  const subject = new Subject(0);
  subject.next(1);
  subject.subscribe(buffer.push.bind(buffer), control);
  expect(buffer.length).toBe(1);
  expect(buffer[0]).toBe(1);
  subject.next(2);
  expect(buffer.length).toBe(2);
  expect(buffer[1]).toBe(2);
  control.abort();
  subject.next(2);
  expect(buffer.length).toBe(2);
});
