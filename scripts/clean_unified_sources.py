#!/usr/bin/env python3
"""Delete individual unified module sources from stats/static/stats/unified/

This script is safe to run multiple times and will only remove the development
module files we don't want collected by Django's collectstatic. It keeps
`index.js` and `unified.bundle.js`.

Run this in CI before `python manage.py collectstatic --noinput` or locally if
you want to remove the files from your working tree.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
STATIC_UNIFIED = ROOT / "stats" / "static" / "stats" / "unified"

MODULE_FILES = [
    "ui.js",
    "page-helpers.js",
    "team.js",
    "forms.js",
    "delete.js",
    "kpi-list.js",
    "chart.js",
    "websocket.js",
]


def main():
    if not STATIC_UNIFIED.exists():
        print(f"Directory not found: {STATIC_UNIFIED}")
        return 0

    removed = []
    for name in MODULE_FILES:
        p = STATIC_UNIFIED / name
        if p.exists():
            try:
                p.unlink()
                removed.append(name)
            except Exception as e:
                print(f"Failed to remove {p}: {e}", file=sys.stderr)
    if removed:
        print("Removed:", ", ".join(removed))
    else:
        print("No development module files found in static unified directory.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
