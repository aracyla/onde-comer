---
name: code
description: General guidelines for writing JavaScript. Use when the user asks to write, implement, create, add, refactor or fix JavaScript code, functions, modules or scripts.
---

# JavaScript Development: Code

## Overview

Basic guidelines for writing JavaScript. **This is a sub-skill of `js-dev`** (invoked via `js-dev:router`).

## Pattern Reference

See `js-dev:router` for the shared standards.

## Guidelines

1. **Understand before writing.** Read the surrounding code and match its style and conventions.
2. **Naming.** `camelCase` for variables and functions, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants. Names say what a thing is or does.
3. **Functions.** Small, single-purpose, few parameters (use an options object past three). Prefer returning values over mutating arguments.
4. **Async.** Use `async`/`await` over raw promise chains. Always handle rejections.
5. **Errors.** Throw `Error` objects with useful messages. Never swallow errors with an empty `catch`.
6. **Equality and types.** Use `===`. Validate input at module boundaries.
7. **Comments.** Explain why, not what. Add JSDoc to exported functions.
8. **Scope.** Change only what the task needs; no unrelated refactors.

## Completion

After writing code, suggest running `js-dev:validate` and `js-dev:test` on it.
