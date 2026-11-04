---
name: router
description: "Entry point for JavaScript development. Routes to js-dev:code, js-dev:validate or js-dev:test. Use whenever the user wants to write, implement, refactor or fix JavaScript; to review, validate, check or audit JavaScript; or to write, add or run tests, even if they do not name the sub-skills."
---

# JavaScript Development Skill

## Overview

Entry point for JavaScript work. Detect what the user wants, then hand off to the right sub-skill.

**This skill invokes one of three sub-skills:**
- `js-dev:code` - writing or changing JavaScript
- `js-dev:validate` - reviewing existing JavaScript
- `js-dev:test` - creating or running tests

## When This Skill Applies

Load this skill when the user:
- Writes, implements, refactors or fixes JavaScript
- Reviews, validates or audits JavaScript
- Writes, adds or runs tests for JavaScript

## Shared Standards

All sub-skills follow these. Reference this section when working with JavaScript.

- Detect the project's stack first (package manager, test runner, linter, module system) and follow it instead of imposing another.
- Use modern ES modules unless the project uses CommonJS.
- Use `const` by default, `let` when reassignment is needed, never `var`.
- Keep functions small and single-purpose.
- Use descriptive names; avoid abbreviations.
- Do not add dependencies unless necessary.

## Workflow: Context Detection and Routing

### Step 1: Analyze Context

**Writing code?**
- Keywords: "write", "implement", "create", "add", "refactor", "fix"
- Intent: user wants new or changed JavaScript

**Validating code?**
- Keywords: "review", "validate", "check", "audit", "look at"
- Intent: user wants feedback on existing JavaScript

**Testing?**
- Keywords: "test", "spec", "coverage", "unit test", "run the tests"
- Intent: user wants tests written or run

### Step 2: Choose Sub-Skill

- If writing code: use the Skill tool to invoke `js-dev:code`
- If validating: use the Skill tool to invoke `js-dev:validate`
- If testing: use the Skill tool to invoke `js-dev:test`
- If ambiguous: ask the user with AskUserQuestion:

```
Question: "What would you like to do with JavaScript?"
Options:
  - "Write code" (General coding guidelines)
  - "Validate code" (Review existing code)
  - "Write or run tests" (Testing guidelines)
```

### Step 3: Hand Off Control

Once the sub-skill is invoked, it takes over. The router's job is complete.

## Important Notes

- Always analyze context and route; do not skip routing.
- Do not duplicate sub-skill logic.
- The user can invoke sub-skills directly (e.g., "use js-dev:validate").
