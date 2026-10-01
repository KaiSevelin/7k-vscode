# 7K for VS Code

Editing support for [**7K**](https://github.com/KaiSevelin/7k) — a descriptive language for loosely
coupled, message-driven systems.

| | |
|---|---|
| **Highlighting** | declarations and their names, clauses, enumerated values, kernel types against your own `PascalCase` names, annotations, versions, durations, regex dialects |
| **Diagnostics** | the **whole workspace**, resolved together — so a message declared in one file and referenced from another resolves, and every analysis reports in the editor |
| **Completion** | keywords scoped to the enclosing block, **and your own names** — messages after `emits`, pipes after `to`, records after `include`, qualified by import alias where they come from another package |
| **Go to definition** | across files, by the same rules the checker uses |
| **Hover** | `pipe acme.shop.events : topic — at-least-once` |
| **Outline** | declarations, with a service's subscriptions and a message's fields nested |

## Why this is a separate repository

7K is a description and runs nothing; everything that *consumes* a model — this extension, the sandbox,
Spider — sits outside the language
([spec](https://github.com/KaiSevelin/7k/blob/main/docs/spec/00-overview.md)). Keeping the editor in its
own repository makes that boundary physical rather than merely documented: if it ever needs something
Core should not know about, the split makes that visible straight away.

## Why it is not a language server

The language knowledge is in `@sevenk/core`, not here — `parse`, `buildWorkspace`, `editorCompletions`
and `definitionAt` all live there, so this repository is a translation layer either way. For one editor
the protocol buys editor-independence nobody is using, at the cost of a second process and a second
debugger. If another editor matters, the same Core functions sit behind an LSP in an afternoon.

## Developing

The extension depends on a **sibling checkout** of the language repository while Core's shape is still
settling, so a change there shows up here immediately rather than through a version bump:

```
git clone https://github.com/KaiSevelin/7k.git        7K
git clone https://github.com/KaiSevelin/7k-vscode.git 7k-vscode

cd 7K        && npm install
cd ../7k-vscode && npm install && npm test
```

Then open `7k-vscode` in VS Code and press **F5**. It launches an Extension Development Host with the
language repository's `examples/` folder loaded.

## The TextMate grammar is generated

`syntaxes/7k.tmLanguage.json` is **derived** from Core's keyword classification — nothing here lists
keywords. Which role a word plays (declaration, clause, value, operator, type) is a fact about the
language, so Core records it and `src/grammar.ts` only maps roles to TextMate scopes.

That means adding a keyword to 7K cannot leave this grammar stale, which matters because this
repository's CI is not Core's. Regenerate with:

```
npm run gen
```

A test fails if the committed file is out of date, or if a keyword in Core has no role.

## Licence

[Apache License 2.0](LICENSE). Copyright 2026 Kai Sevelin.
