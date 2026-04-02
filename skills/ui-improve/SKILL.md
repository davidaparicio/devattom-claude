---
name: ui-improve
description: Iteratively analyze and improve UI interfaces via Gemini Vision. Score, feedback, implement, re-score until 8/10.
---

# UI Improve

Iterative user interface improvement guided by Gemini Vision scoring.

## When to Use

- Improve the design of an existing interface
- Get an objective UI quality score
- Iterate on a design until it reaches professional standards (8/10)

## Prerequisites

- `GEMINI_API_KEY` configured (env variable or `.env`)
- `uv` installed (`curl -LsSf https://astral.sh/uv/install.sh | sh`)

## Workflow

### Step 0: Choose Capture Mode

**REQUIRED — Ask the user before any action:**

> "How would you like to provide screenshots for iteration?
>
> **A) Playwright** — I take the screenshots myself (requires a running dev server, provide the URL)
>
> **B) Manual** — You provide screenshots at each iteration (drag & drop or file path)"

Remember the choice for the entire session.

- **If Playwright**: verify the dev server is reachable at the provided URL. Use Playwright MCP tools: `mcp__plugin_playwright_playwright__browser_navigate` then `mcp__plugin_playwright_playwright__browser_take_screenshot`.
- **If Manual**: ask the user for a screenshot at each iteration.

---

### Step 1: Pre-Analysis by Claude

Before sending anything to Gemini, analyze the context:

1. **Read the source code** of the target interface (components, styles, layout)
2. **Identify** the CSS framework (Tailwind, CSS modules, styled-components, etc.)
3. **Understand** the page structure (header, hero, sidebar, cards, etc.)
4. **Consult** design principles: [`references/design-principles.md`](references/design-principles.md)
5. **Note** initial impressions and potential improvement areas

Document this pre-analysis as a short summary (5-10 lines) before moving to Step 2.

---

### Step 2: Capture Initial Screenshot

**Playwright mode:**
```
1. mcp__plugin_playwright_playwright__browser_navigate → dev server URL
2. mcp__plugin_playwright_playwright__browser_take_screenshot → /tmp/ui-improve-v0.png
```

**Manual mode:**
Ask the user: "Please provide a screenshot of the current interface."

---

### Step 3: Gemini Scoring

Run the analysis via the script:

```bash
~/.claude/skills/ui-improve/scripts/run.sh gemini_analyze.py \
  /tmp/ui-improve-v0.png \
  --output /tmp/ui-improve-analysis-v0.json
```

Read the JSON result and present to the user:
- Scores per criterion (visual hierarchy, colors, typography, spacing, modern feel, consistency)
- Overall score
- Strengths to preserve
- Weaknesses to fix
- Improvements suggested by Gemini

---

### Step 4: Improvement Plan

Combine:
- Claude's pre-analysis (Step 1)
- Gemini scoring (Step 3)
- Design principles ([`references/design-principles.md`](references/design-principles.md))
- Micro-interactions ([`references/micro-interactions.md`](references/micro-interactions.md))

Propose a **concrete** improvement plan:
- Specific CSS/Tailwind changes to make
- Components to modify with exact files and lines
- Priority order (highest visual impact first)

**Wait for user approval** before implementing.

---

### Step 5: Implement Improvements

Apply the approved changes to the project source code.

---

### Step 6: Re-capture and Re-score

1. Capture a new screenshot (Playwright or Manual per initial choice)
2. Re-score via Gemini:

```bash
~/.claude/skills/ui-improve/scripts/run.sh gemini_analyze.py \
  /tmp/ui-improve-v1.png \
  --output /tmp/ui-improve-analysis-v1.json
```

3. Compare scores v0 vs v1

---

### Step 7: Iteration Loop

```
IF overall_score >= 8.0:
    DONE — Present before/after comparison
    Offer to document via template assets/design-guideline-template.md
ELSE IF iteration >= 4:
    STOP — Present scores, ask user if they want to continue
ELSE:
    Return to Step 4 with new Gemini feedback
```

**Maximum 4 iterations by default** (safety net to avoid infinite loops and excessive Gemini token consumption).

---

## References

- [`references/design-principles.md`](references/design-principles.md) — Visual hierarchy, typography, color theory, white space
- [`references/micro-interactions.md`](references/micro-interactions.md) — Duration, easing curves, animations
- [`references/storytelling-design.md`](references/storytelling-design.md) — Design storytelling, parallax, thematic consistency
- [`references/design-resources.md`](references/design-resources.md) — Inspiration platforms, tools

## Key Principles

1. **Claude pre-analyzes, Gemini scores** — separated and complementary roles
2. **Iterate on concrete data** — never improve without a reference score
3. **User approves** — no changes implemented without consent
4. **Safety net** — maximum 4 iterations, threshold at 8/10
5. **Zero external dependency** — the skill is self-contained (uv + google-genai)
