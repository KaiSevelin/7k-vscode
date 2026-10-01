import { readFileSync } from "node:fs";
import { join } from "node:path";
import { KEYWORDS, keywordsWithRole, type KeywordRole } from "@sevenk/core";
import { describe, expect, it } from "vitest";
import { buildGrammar } from "../src/grammar.js";

const COMMITTED = join(import.meta.dirname, "..", "syntaxes", "7k.tmLanguage.json");
const ROLES: KeywordRole[] = ["declaration", "clause", "value", "operator", "type", "reserved"];

describe("the generated TextMate grammar", () => {
  it("covers every keyword Core knows about", () => {
    // Core classifies its own keywords, so coverage is structural rather than
    // maintained here. This asserts the mapping has not lost a role.
    const covered = new Set(ROLES.flatMap((r) => keywordsWithRole(r)));
    expect([...KEYWORDS].filter((k) => !covered.has(k)).sort()).toEqual([]);
  });

  it("the committed file is current", () => {
    const expected = `${JSON.stringify(buildGrammar(), null, 2)}\n`;
    const actual = readFileSync(COMMITTED, "utf8").replaceAll("\r\n", "\n");
    expect(actual).toBe(expected);
  });
});
