"""Shared palette so Excel and PowerPoint look like one product."""

ACTIVITY_COLORS = {
    "hiring": "3B6EA5",          # blue
    "pre_onboarding": "9BBBD9",  # light blue
    "kt": "F2A541",              # amber
    "gp": "7B5EA7",              # purple
}
CONTRACT_COLOR = "D4A017"  # gold star
GO_LIVE_COLOR = "C0392B"   # red diamond
TODAY_COLOR = "E74C3C"

INK = "1F2937"        # primary text
MUTED = "6B7280"      # secondary text
GRID = "E5E7EB"       # light rules
HEADER_FILL = "1F2937"
BAND_FILL = "F3F4F6"  # process header band
INPUT_FILL = "FFF59D" # yellow input cells
INPUT_FONT = "0000FF" # blue input text

STAR = "★"
DIAMOND = "◆"

FONT = "Arial"


# Slide / web themes. Bars keep the same hue family in both themes; dark mode
# lifts them slightly so they stay readable on a deep slate background.
THEMES = {
    "light": {
        "bg": "FFFFFF", "ink": INK, "muted": MUTED, "grid": GRID, "band": BAND_FILL,
        "card": BAND_FILL, "tag": INK, "tag_text": "FFFFFF",
        "table_head": INK, "table_head_text": "FFFFFF", "table_bg": "FFFFFF",
        "table_alt": BAND_FILL,
        "contract": CONTRACT_COLOR, "go_live": GO_LIVE_COLOR, "today": TODAY_COLOR,
        "activities": dict(ACTIVITY_COLORS),
        "bar_text": {"hiring": "FFFFFF", "pre_onboarding": INK, "kt": INK, "gp": "FFFFFF"},
    },
    "dark": {
        "bg": "0F172A", "ink": "F1F5F9", "muted": "94A3B8", "grid": "334155",
        "band": "1E293B", "card": "1E293B", "tag": "E2E8F0", "tag_text": "0F172A",
        "table_head": "334155", "table_head_text": "F1F5F9", "table_bg": "0F172A",
        "table_alt": "1E293B",
        "contract": "F2C94C", "go_live": "F87171", "today": "FB7185",
        "activities": {"hiring": "5B8FD0", "pre_onboarding": "A9C6E8", "kt": "F5B85A",
                       "gp": "A68BD6"},
        "bar_text": {"hiring": "FFFFFF", "pre_onboarding": INK, "kt": INK, "gp": "FFFFFF"},
    },
}
