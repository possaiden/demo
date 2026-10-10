#!/usr/bin/env python3
"""Generate the Project Plan (Excel + PowerPoint) with a Gantt view.

Usage:
    python generate_plan.py                                  # uses config/project_config.json
    python generate_plan.py --contract-date 2026-11-02       # re-plan from a new contract date
    python generate_plan.py --config my_project.json --out-dir out
"""
from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path

from gantt_planner.excel_export import export_excel
from gantt_planner.ppt_export import export_ppt
from gantt_planner.schedule import build_plan, load_config
from gantt_planner.web_export import export_web


def main() -> None:
    here = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--config", default=here / "config" / "project_config.json",
                        help="Path to the project config JSON")
    parser.add_argument("--contract-date", type=date.fromisoformat,
                        help="Override the contract signed date (YYYY-MM-DD) for all processes")
    parser.add_argument("--out-dir", default=here / "output", help="Output folder")
    parser.add_argument("--name", default="Project_Plan", help="Output file name (no extension)")
    args = parser.parse_args()

    config = load_config(args.config)
    if args.contract_date:
        config["contract_signed_date"] = args.contract_date.isoformat()
        for proc in config["processes"]:
            proc.pop("contract_signed_date", None)
    plan = build_plan(config)
    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    xlsx, pptx, html = (out / f"{args.name}.{ext}" for ext in ("xlsx", "pptx", "html"))
    export_excel(plan, xlsx)
    export_ppt(plan, pptx)
    export_web(config, html)

    print(f"{plan.project_name}: contract signed {plan.contract_date:%d-%b-%Y}")
    for p in plan.processes:
        print(f"  {p.name:<20} ({p.vertical})  Go-Live {p.go_live:%a %d-%b-%Y}  "
              f"[{p.weeks_to_go_live} wks]")
    print(f"Wrote {xlsx}\nWrote {pptx}\nWrote {html}")


if __name__ == "__main__":
    main()
