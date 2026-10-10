"""Scheduling engine: turns the project config into dated phases.

Date rules mirror Excel's WORKDAY so the Python schedule (used for the PPT)
and the live formulas in the Excel workbook always agree:

  Hiring            starts WORKDAY(contract, 1), lasts hiring_weeks * 5 working days
  Pre-Onboarding    starts WORKDAY(hiring_end, 1), lasts pre_onboarding_weeks * 5
  Knowledge Transfer starts WORKDAY(pre_end, 1), lasts kt_weeks * 5
  Guided Production starts WORKDAY(kt_end, 1),  lasts gp_weeks * 5
  Go-Live           = WORKDAY(gp_end, 1)  (next working day)
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import date, timedelta
from pathlib import Path

WORKING_DAYS_PER_WEEK = 5

# Activity keys in display order, with their labels.
ACTIVITIES = [
    ("hiring", "Hiring"),
    ("pre_onboarding", "Pre-Onboarding"),
    ("kt", "Knowledge Transfer"),
    ("gp", "Guided Production"),
]


def workday(start: date, days: int, holidays: frozenset[date] = frozenset()) -> date:
    """Python equivalent of Excel WORKDAY(start, days, holidays) for days >= 0."""
    current = start
    remaining = days
    while remaining > 0:
        current += timedelta(days=1)
        if current.weekday() < 5 and current not in holidays:
            remaining -= 1
    return current


def phase_end(start: date, weeks: float, holidays: frozenset[date]) -> date:
    """Last working day of a phase that starts on `start` and runs `weeks` weeks."""
    return workday(start, int(round(weeks * WORKING_DAYS_PER_WEEK)) - 1, holidays)


@dataclass
class Phase:
    key: str
    label: str
    weeks: float
    start: date
    end: date


@dataclass
class ProcessPlan:
    name: str
    vertical: str
    contract_date: date
    hiring_weeks: float
    phases: list[Phase] = field(default_factory=list)
    go_live: date | None = None

    @property
    def weeks_to_go_live(self) -> float:
        return round((self.go_live - self.contract_date).days / 7, 1)


@dataclass
class ProjectPlan:
    project_name: str
    client_name: str
    contract_date: date
    pre_onboarding_weeks: float
    vertical_rules: dict
    holidays: list[date]
    processes: list[ProcessPlan]

    @property
    def start(self) -> date:
        return min(p.contract_date for p in self.processes)

    @property
    def final_go_live(self) -> date:
        return max(p.go_live for p in self.processes)


def _parse_date(value: str) -> date:
    return date.fromisoformat(value)


def load_config(path: str | Path) -> dict:
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def build_plan(config: dict, contract_override: date | None = None) -> ProjectPlan:
    holidays = sorted(_parse_date(h) for h in config.get("holidays", []))
    hol = frozenset(holidays)
    project_contract = contract_override or _parse_date(config["contract_signed_date"])
    pre_weeks = config.get("pre_onboarding_weeks", 2)
    rules = config["vertical_rules"]

    processes = []
    for proc in config["processes"]:
        vertical = proc["vertical"]
        if vertical not in rules:
            raise ValueError(f"No KT/GP rule for vertical '{vertical}' in vertical_rules")
        contract = (
            _parse_date(proc["contract_signed_date"])
            if proc.get("contract_signed_date") and not contract_override
            else project_contract
        )
        durations = {
            "hiring": proc.get("hiring_weeks", 8),
            "pre_onboarding": pre_weeks,
            "kt": rules[vertical]["kt_weeks"],
            "gp": rules[vertical]["gp_weeks"],
        }
        plan = ProcessPlan(proc["name"], vertical, contract, durations["hiring"])
        prev_end = contract
        for key, label in ACTIVITIES:
            start = workday(prev_end, 1, hol)
            end = phase_end(start, durations[key], hol)
            plan.phases.append(Phase(key, label, durations[key], start, end))
            prev_end = end
        plan.go_live = workday(prev_end, 1, hol)
        processes.append(plan)

    return ProjectPlan(
        project_name=config.get("project_name", "Project"),
        client_name=config.get("client_name", ""),
        contract_date=project_contract,
        pre_onboarding_weeks=pre_weeks,
        vertical_rules=rules,
        holidays=holidays,
        processes=processes,
    )
