/**
 * Generates the TextMate grammar from Core's keyword classification.
 *
 * A hand-written grammar would be a second copy of the keyword list and would
 * drift. Core records which role each keyword plays, so this only maps roles to
 * scopes — and a test asserts the committed file is current.
 *
 *   npm run gen
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildGrammar } from "../src/grammar.js";

const target = join(import.meta.dirname, "..", "syntaxes", "7k.tmLanguage.json");
writeFileSync(target, `${JSON.stringify(buildGrammar(), null, 2)}\n`, "utf8");
process.stdout.write(`wrote ${target}\n`);
