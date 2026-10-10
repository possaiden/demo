"""Interactive web planner: one self-contained HTML file with a Light/Dark switch.

The page re-plans in the browser (same WORKDAY rules as the Excel), so the CEO
or PM can change dates and durations without any software installed.
"""
from __future__ import annotations

import html
import json
from pathlib import Path

TEMPLATE = Path(__file__).with_name("web_template.html")


def render_web(config: dict) -> str:
    """Page body (no <html> wrapper) with the project config embedded."""
    payload = json.dumps(config, ensure_ascii=False).replace("</", "<\\/")
    page = TEMPLATE.read_text(encoding="utf-8").replace("__PLAN_CONFIG__", payload)
    title = html.escape(config.get("project_name") or "Transition Plan")
    return page.replace("<title>Transition Plan</title>", f"<title>{title}</title>", 1)


def export_web(config: dict, path) -> None:
    """Write a standalone HTML file that opens in any browser."""
    body = render_web(config)
    page = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            + body.replace("<div class=\"page\">", "</head>\n<body>\n<div class=\"page\">", 1)
            + "\n</body>\n</html>\n")
    Path(path).write_text(page, encoding="utf-8")
