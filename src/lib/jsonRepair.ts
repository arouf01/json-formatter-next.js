import { jsonrepair } from "jsonrepair";

/**
 * Best-effort repair of malformed JSON using the `jsonrepair` library. Handles
 * common mistakes — trailing commas, single quotes, unquoted keys, missing
 * commas, comments, Python-style `None/True/False`, etc. Isolated here (like
 * `parseJsonWithError` in jsonError.ts) so the dependency stays in one place and
 * is easy to unit-test.
 *
 * Returns the repaired JSON string on success, or `{ ok: false }` when the input
 * is too broken for jsonrepair to recover.
 */
export function tryRepairJson(
  text: string,
): { ok: true; repaired: string } | { ok: false } {
  try {
    return { ok: true, repaired: jsonrepair(text) };
  } catch {
    return { ok: false };
  }
}
