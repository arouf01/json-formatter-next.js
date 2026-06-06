export interface JsonParseSuccess {
  ok: true;
  data: unknown;
}

export interface JsonParseFailure {
  ok: false;
  message: string;
  line?: number;
  column?: number;
}

export type JsonParseResult = JsonParseSuccess | JsonParseFailure;

// Convert a character offset into 1-based line/column.
function locate(text: string, position: number): { line: number; column: number } {
  const upto = text.slice(0, Math.max(0, position));
  const lines = upto.split("\n");
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column };
}

/**
 * Parse JSON and, on failure, derive a human-friendly message with the
 * line/column of the problem when the engine reports a position.
 */
export function parseJsonWithError(text: string): JsonParseResult {
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Invalid JSON";

    // Modern V8 may already include "(line X column Y)".
    const lc = raw.match(/line (\d+) column (\d+)/i);
    if (lc) {
      return {
        ok: false,
        message: cleanMessage(raw),
        line: Number(lc[1]),
        column: Number(lc[2]),
      };
    }

    // Fall back to "at position N" and compute line/column ourselves.
    const pos = raw.match(/position (\d+)/i);
    if (pos) {
      const { line, column } = locate(text, Number(pos[1]));
      return { ok: false, message: cleanMessage(raw), line, column };
    }

    return { ok: false, message: cleanMessage(raw) };
  }
}

// Trim engine-specific noise so the message reads cleanly in the UI.
function cleanMessage(raw: string): string {
  return raw.replace(/^JSON\.parse:\s*/i, "").replace(/\s+/g, " ").trim();
}

export function formatParseError(result: JsonParseFailure): string {
  if (result.line != null && result.column != null) {
    return `${result.message} (line ${result.line}, column ${result.column})`;
  }
  return result.message;
}
