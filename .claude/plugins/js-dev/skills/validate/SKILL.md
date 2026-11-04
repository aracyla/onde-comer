---
name: validate
description: Guidelines for validating and reviewing written JavaScript. Use when the user asks to review, validate, check, audit or look at JavaScript, before merging changes, or as refactoring prep.
---

# JavaScript Development: Validate

## Overview

How to review existing JavaScript. **This is a sub-skill of `js-dev`** (invoked via `js-dev:router`).

## Pattern Reference

See `js-dev:router` for the shared standards and `js-dev:code` for the coding guidelines.

## Workflow

Create a task list with TaskCreate and update it with TaskUpdate as each check completes.

### Validation Checklist

1. **Correctness.** Does it do what was asked? Check edge cases, off-by-one errors, and null/undefined handling.
2. **Error handling.** Are errors thrown and handled properly? No silent catches or unhandled rejections.
3. **Readability.** Clear names, small functions, no dead or unused code.
4. **Guidelines.** Matches `js-dev:code` and the project's conventions.
5. **Security basics.** No `eval`, no unsanitized input into HTML, SQL or shell commands, no secrets in code.
6. **Tests.** Tests exist for the changed behavior. Run the linter and tests if the project has them.

### Report

Produce a short report:

- **Blockers:** must fix (bugs, security)
- **Suggestions:** should fix
- **Nits:** optional polish

Reference each finding by file and line.

### Completion

Ask the user what to do next: fix everything, fix specific issues, or just keep the report.
