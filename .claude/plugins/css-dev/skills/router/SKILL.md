---
name: router
description: "Entry point for plain CSS development with *.module.css files. Routes to css-dev:create-component or css-dev:validate. Use whenever the user wants to create, add, build or style a CSS component, or to review, validate, check or audit existing CSS, even if they do not mention the sub-skills by name."
---

# CSS Development Skill

## Overview

Comprehensive workflow for CSS development. This skill automatically routes you to the appropriate specialized workflow based on context.

**This skill will invoke one of two sub-skills:**
- `css-dev:create-component` - Creating new CSS components
- `css-dev:validate` - Reviewing existing CSS

## When This Skill Applies

Claude Code will automatically load this skill when you:
- Create new CSS components or styles
- Review or validate existing CSS code
- Work with component styling in any framework

## CSS Development Patterns

All sub-skills follow these core patterns. Reference this section when working with CSS.

### Core Principles


### Component Class Pattern


### File Structure Convention

```
styles/
|--- Component.module.css
|--- AnotherComponent.module.css
```

### Markup Integration (Framework-Agnostic)


### Atomic Design Levels

- **Atoms:** Basic building blocks (`.button`, `.input`, `.badge`, `.spinner`)
- **Molecules:** Composed components (`.card`, `.form-field`, `.empty-state`)
- **Organisms:** Complex components (`.page-layout`, `.session-card`, `.conversation-timeline`)

## Workflow: Context Detection and Routing

When this skill is invoked, follow these steps to route to the appropriate sub-skill:

### Step 1: Analyze Context

Look at the user's request and recent conversation to determine intent:

**Creating new components?**
- Keywords: "create", "add", "new component", "build a", "make a"
- Files: Mention of `*.module.css` files or new component names
- Intent: User wants to add new CSS

**Validating existing CSS?**
- Keywords: "review", "validate", "check", "audit", "look at"
- Files: Reference to existing CSS files or components
- Intent: User wants feedback on existing CSS

### Step 2: Choose Sub-Skill

Based on context analysis:

**If creating:** Use the Skill tool to invoke `css-dev:create-component`

**If validating:** Use the Skill tool to invoke `css-dev:validate`

**If ambiguous:** Ask the user using AskUserQuestion tool:

```
Question: "What would you like to do with CSS?"
Options:
  - "Create new component" (Guide creating new semantic CSS component classes)
  - "Validate existing CSS" (Review CSS against established patterns)
```

### Step 3: Invoke Sub-Skill

Use the Skill tool to invoke the chosen sub-skill:

**Example:**
```
I'm routing you to the create-component workflow.
[Invoke Skill tool with skill: "css-dev:create-component"]
```

### Step 4: Hand Off Control

Once the sub-skill is invoked, it takes over. The main skill's job is complete.

## Important Notes

- **Don't skip routing:** Always analyze context and choose the right sub-skill
- **Don't duplicate sub-skill logic:** Let sub-skills handle their workflows
- **Reference pattern documentation:** Sub-skills will reference the patterns documented above
- **User can invoke directly:** User can call sub-skills directly (e.g., "use css-dev:validate")

