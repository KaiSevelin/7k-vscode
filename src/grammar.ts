/**
 * The TextMate grammar for 7K, **derived** from Core's keyword classification.
 *
 * TextMate highlighting is coarse by nature — regular expressions over lines, with
 * no idea what a declaration is. It earns its place anyway: it is instant, it works
 * in diffs and in Markdown code fences, and it needs nothing running.
 *
 * Nothing here lists keywords. Which role a word plays — declaration, clause,
 * value, operator, type — is a fact about the language, so Core records it
 * (`KEYWORD_ROLES`) and this file only maps roles to scopes. Adding a keyword to
 * Core therefore cannot leave the grammar stale, which matters more now that this
 * repository's CI is not Core's.
 */

import { keywordsWithRole, type KeywordRole } from "@sevenk/core";

/** A TextMate scope per keyword role. Mapping, not classification. */
const SCOPES: Readonly<Record<KeywordRole, string>> = {
  declaration: "keyword.declaration.7k",
  clause: "keyword.control.7k",
  value: "constant.language.7k",
  operator: "keyword.operator.word.7k",
  type: "support.type.primitive.7k",
  reserved: "invalid.deprecated.reserved.7k",
};

const ROLES = Object.keys(SCOPES) as KeywordRole[];

/** Escapes a keyword for use inside a regular expression. */
const esc = (w: string): string => w.replaceAll("-", "\\-");

/** A `\b`-anchored alternation, longest first so `at-least-once` beats `at`. */
function alternation(words: readonly string[]): string {
  const sorted = [...words].sort((a, b) => b.length - a.length).map(esc);
  return `(?i)\\b(${sorted.join("|")})\\b`;
}

export function buildGrammar(): unknown {
  const declarations = keywordsWithRole("declaration");

  return {
    $schema: "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
    name: "7K",
    scopeName: "source.7k",
    // Generated from @sevenk/core. Do not edit by hand; run `npm run gen`.
    patterns: [
      { include: "#comment" },
      { include: "#string" },
      { include: "#annotation" },
      { include: "#regex" },
      { include: "#number" },
      { include: "#declarationName" },
      { include: "#keyword" },
      { include: "#typeName" },
      { include: "#punctuation" },
    ],
    repository: {
      comment: {
        patterns: [
          { name: "comment.line.double-slash.7k", match: "//.*$" },
          { name: "comment.block.7k", begin: "/\\*", end: "\\*/" },
        ],
      },
      string: {
        name: "string.quoted.double.7k",
        begin: '"',
        end: '"',
        patterns: [
          { name: "constant.character.escape.7k", match: "\\\\(?:[nrt\\\\\"]|u[0-9A-Fa-f]{4})" },
          // Canonical-JSON generator directives read as a unit: "$auto", "$now".
          { name: "variable.language.directive.7k", match: "\\$[A-Za-z_][A-Za-z0-9_]*" },
        ],
      },
      annotation: {
        // @role(...), @internal(pkg), @command, and user labels alike.
        name: "entity.name.tag.annotation.7k",
        match: "@[A-Za-z_][A-Za-z0-9_]*",
      },
      regex: {
        // A `/` that is not a comment opener can only begin a pattern: 7K has no
        // arithmetic, so there is no division to confuse it with.
        name: "string.regexp.7k",
        begin: "/(?![/*])",
        end: "/\\s*(?i:(re2|pcre|ecma))?",
        endCaptures: { 1: { name: "storage.modifier.dialect.7k" } },
        patterns: [{ name: "constant.character.escape.7k", match: "\\\\." }],
      },
      number: {
        patterns: [
          { name: "constant.numeric.version.7k", match: "(?i)\\bv[0-9]+(?:\\.(?:[0-9]+|x))?\\b" },
          { name: "constant.numeric.duration.7k", match: "(?i)\\b[0-9][0-9_]*(?:ms|s|m|h|d)+\\b" },
          { name: "constant.numeric.size.7k", match: "(?i)\\b[0-9][0-9_]*(?:kb|mb|b)\\b" },
          { name: "constant.numeric.decimal.7k", match: "\\b[0-9][0-9_]*\\.[0-9]+\\b" },
          { name: "constant.numeric.integer.7k", match: "\\b[0-9][0-9_]*\\b" },
        ],
      },
      declarationName: {
        // `value PostCode`, `service TicketService` — highlight the name too, so a
        // file skims as a list of what it declares.
        match: `(?i)\\b(${declarations.join("|")})\\b\\s+([A-Za-z_][A-Za-z0-9_.]*)`,
        captures: {
          1: { name: SCOPES.declaration },
          2: { name: "entity.name.type.7k" },
        },
      },
      keyword: {
        patterns: ROLES.map((role) => ({
          name: SCOPES[role],
          match: alternation(keywordsWithRole(role)),
        })),
      },
      typeName: {
        // PascalCase is yours, lowercase is the language's.
        name: "entity.name.type.7k",
        match: "\\b[A-Z][A-Za-z0-9_]*\\b",
      },
      punctuation: {
        patterns: [
          { name: "keyword.operator.comparison.7k", match: "==|!=|<=|>=" },
          { name: "keyword.operator.range.7k", match: "\\.\\." },
          { name: "keyword.operator.alternative.7k", match: "\\|" },
          { name: "keyword.operator.assignment.7k", match: "=" },
          { name: "punctuation.separator.7k", match: "[:;,.?]" },
          { name: "punctuation.section.7k", match: "[{}\\[\\]()]" },
        ],
      },
    },
  };
}
