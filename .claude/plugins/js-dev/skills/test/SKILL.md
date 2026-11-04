---
name: test
description: Guidelines for creating and running JavaScript tests. Use when the user asks to write, add, create or run tests, specs, unit tests or coverage for JavaScript.
---

# JavaScript Development: Test

## Overview

How to create and run tests. **This is a sub-skill of `js-dev`** (invoked via `js-dev:router`).

## Pattern Reference

See `js-dev:router` for the shared standards.

## Guidelines

1. **Use the project's test runner** (Vitest, Jest, `node:test`, etc.). Check `package.json`. Do not add a new one without asking.
2. **Test behavior, not implementation.** Assert on outputs and effects, not internals.
3. **Structure.** Arrange, act, assert. One focus per test, with a name that describes the behavior.
4. **Cover:** the happy path, edge cases (empty, null, boundaries) and error paths.
5. **Deterministic.** No real network, clock or randomness; mock or fake them.
6. **Placement.** Follow the project's convention (e.g. `*.test.js` next to the source, or a `tests/` folder).

## Workflow

1. Read the code under test.
2. Write the tests.
3. Run them and report the results. If a test fails, say whether the test or the code is wrong before changing anything.
