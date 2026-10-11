# AI Stack Practice Lab

An interactive practice page for the IIT Madras session *Applying AI Decision Models Across Functions*. Learners practise choosing
the right Business AI Stack category, or combination of categories, for realistic use cases.

The page covers only the five core categories from the Week 2 deck: **Chat Interfaces, Search & Knowledge, Automation Platforms,
Analytics & Insights and Agent Frameworks**.

## What's inside

| Tab | What learners do |
| --- | --- |
| **Stack Guide** | Read the five categories (with the deck's example tools), the "start simple" principle, the "systems beat tools" pattern and the deck's worked examples. |
| **Practice** | Filter 53 use cases by industry, business function and level (Level 1 beginner / Level 2 challenging), or type their own. Answer with one category, a combination, or free-text tools, optionally adding a human approval step. Each answer gets a 1–10 score, a verdict, reasons, a simpler option where relevant and the recommended system. |
| **Quiz** | An optional 5- or 10-question multiple-choice quiz (mixed, Level 1 or Level 2). The learner's profile is required. Learners can download a `.txt` with the questions, their answers, the correct answers, explanations and the score. |
| **Score History** | Participants and scores, with filters and averages by industry and work-experience slab. Download as CSV, import CSVs from other devices, or clear this device's history. |

## How answers are scored

The scoring follows the deck's rubric. Each use case lists the categories it **needs**, optional extras that are allowed, and whether a
**human approval** step is required. Every answer starts at 10 points:

- A required category that is missing loses 4–6 points. A weaker stand-in loses less, and the feedback explains why. For example, Chat used instead of Search for policy answers isn't grounded in verified documents.
- Unnecessary extras lose points: 1.5 per extra category, or 2.5 for an Agent. The feedback then suggests the simpler stack.
- A governance-sensitive case without a human approval step loses 2 points, and an Agent without oversight loses 1 more.
- Valid alternatives that cover every need without extra complexity score full marks.

For free-text answers, tool names are mapped to categories. For example, Claude Projects, Glean and NotebookLM count as Search, and Zapier, n8n and Claude scheduled tasks count as Automation.

## Storage and limitations

- **Class board (shared):** when the page is opened as the published claude.ai Artifact, quiz scores are saved to the artifact's shared
  database. Everyone can read the board, and each learner can change only their own record. Saving needs a signed-in viewer with
  Contributor access. Viewers with view-only access, and outside visitors arriving by link, can read the board but save locally.
- **This device:** every score is also saved to the browser's local storage. That copy is lost if browser data is cleared or a private
  window is used, and it isn't shared across devices.
- **Combining results:** learners download their history CSV, and the instructor uses *Import CSV*. Duplicate attempts are skipped.

## Files

- `src/data.js`: categories, industries, use cases, the scoring engine and the tool-name parser.
- `src/page.html`: page markup, styles and interface logic.
- `build.sh`: combines both into `lab.html` (the published Artifact body) and `index.html` (a standalone page you can open in any browser).
