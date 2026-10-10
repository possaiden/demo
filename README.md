# Project Plan & Gantt Generator

Produces a **CEO-ready project plan** from contract signature to Go-Live, process by process, in three formats:

| Output | What it is |
|---|---|
| `output/Project_Plan.xlsx` | **A live planner.** Every date is an Excel formula: change the contract date or a duration and the whole plan and its Gantt bars redraw. |
| `output/Project_Plan.pptx` | **A 3-slide deck for the CEO**, built from native, editable PowerPoint shapes: (1) Go-Live summary, (2) Gantt chart, (3) key dates & rules. Every slide exists in a light and a dark version (slides 1–3 light, 4–6 dark). |
| `output/Project_Plan.html` | **An interactive web planner** that opens in any browser and needs no install. It has the Go-Live summary, the Gantt chart and the key dates, plus inputs that re-plan everything live. |

## Light and dark themes

Both the deck and the web page have a **☀ Light | ☾ Dark** switch in the top-right corner. They open in light mode.

- **PowerPoint:** in slideshow mode, click the switch to jump to the same slide in the other theme. Present slides 1–3 for light or 4–6 for dark, and delete the set you don't need before sending the file.
- **Web page:** click the switch to change theme. The browser remembers your choice.

## Planning rules

| Activity | Rule |
|---|---|
| ★ **Contract Signed** | Project date, can be overridden per process |
| **Hiring** | 8–10 weeks standard (default: 8 wks P2P/OTC, 10 wks RTR). Starts the next working day after contract |
| **Pre-Onboarding** | 2 weeks, starting the working day after hiring ends |
| **Knowledge Transfer** | 4 weeks P2P & OTC · 8 weeks RTR |
| **Guided Production** | 4 weeks P2P & OTC · 8 weeks RTR |
| ◆ **Go-Live** | Next working day after Guided Production ends |

Working days are Mon–Fri, so 1 week = 5 working days. Dates on the `Holidays` sheet (or in `holidays` in the config) are skipped.

With a contract date of 19-Oct-2026, P2P and OTC go live on **23-Feb-2027** and RTR on **04-May-2027**.

## Option A: just use the Excel (no code)

1. Open `output/Project_Plan.xlsx`.
2. On the **Inputs** sheet, edit the **yellow cells**:
   - contract date
   - hiring weeks per process
   - KT and Guided Production rules per vertical
   - a different contract date for one process, if needed
3. Add public or client holidays on the **Holidays** sheet.
4. The **Plan** sheet updates by itself: the Go-Live tiles, the dates, the Gantt bars, ★ and ◆, and a red marker for today's week.

## Option B: regenerate both files

```bash
pip install -r requirements.txt
python generate_plan.py                              # uses config/project_config.json
python generate_plan.py --contract-date 2026-11-02   # what-if: new contract date
python generate_plan.py --config my.json --out-dir out --name Client_X_Plan
```

Edit `config/project_config.json` to change the project name, the processes (add as many as needed), the vertical rules, or the holidays:

```jsonc
{"name": "Procure-to-Pay", "vertical": "P2P", "hiring_weeks": 8,
 "contract_signed_date": "2026-11-02"}      // optional per-process override
```

## Code layout

- `gantt_planner/schedule.py`: the scheduling engine. Its `workday()` behaves exactly like Excel's `WORKDAY`, so the Python dates and the Excel formulas always agree.
- `gantt_planner/excel_export.py`: builds the formula-driven workbook (bars drawn with conditional formatting).
- `gantt_planner/ppt_export.py`: builds the deck.
- `gantt_planner/web_export.py` + `web_template.html`: builds the interactive web page.
- `gantt_planner/style.py`: the colour palette and light/dark themes shared by all outputs.
