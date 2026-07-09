import { describe, it, expect } from "vitest";
import { tryRepairJson } from "@/lib/jsonRepair";

/** Helper: repair succeeds AND the repaired string is valid JSON. */
function repairsTo(input: string, expected: unknown) {
  const r = tryRepairJson(input);
  expect(r.ok).toBe(true);
  if (r.ok) {
    expect(JSON.parse(r.repaired)).toEqual(expected);
  }
}

describe("tryRepairJson", () => {
  it("fixes trailing commas", () => {
    repairsTo('{"a":1,}', { a: 1 });
    repairsTo("[1, 2, 3, ]", [1, 2, 3]);
  });

  it("fixes single quotes", () => {
    repairsTo("{'a': 'b'}", { a: "b" });
  });

  it("fixes unquoted keys", () => {
    repairsTo("{a: 1, b: 2}", { a: 1, b: 2 });
  });

  it("fixes missing commas between items", () => {
    repairsTo('{"a": 1 "b": 2}', { a: 1, b: 2 });
  });

  it("strips comments", () => {
    repairsTo('{\n  // a comment\n  "a": 1\n}', { a: 1 });
  });

  it("normalizes Python-style literals", () => {
    repairsTo('{"a": None, "b": True, "c": False}', {
      a: null,
      b: true,
      c: false,
    });
  });

  it("leaves already-valid JSON intact", () => {
    repairsTo('{"a":[1,2],"b":"x"}', { a: [1, 2], b: "x" });
  });

  it("returns ok:false for input that cannot be repaired", () => {
    // jsonrepair is very lenient (it even wraps bare prose in quotes), but a
    // genuinely nonsensical structure like "}{" or empty input still throws.
    expect(tryRepairJson("}{").ok).toBe(false);
    expect(tryRepairJson("   ").ok).toBe(false);
  });
});
