#!/usr/bin/env python3
"""Vérifie les limites de caractères de Google Play dans play-store/textes/*.md (lancé aussi par la CI)."""
import os
import re
import sys

LIMITS = [("name", 30), ("short", 80), ("full", 4000), ("notes", 500)]
LABELS = {
    "fr.md": ["Nom", "Description courte", "Description complète", "Notes de version"],
    "en.md": ["Name", "Short description", "Full description", "Release notes"],
}


def sections(text, labels):
    out = {}
    for i, label in enumerate(labels):
        m = re.search(r"\*\*" + re.escape(label) + r"\*\*\s*:?\s*(.*?)(?=\n\*\*[^*]+\*\*\s*:|\Z)", text, re.S)
        if not m:
            raise SystemExit(f"section manquante : {label}")
        out[LIMITS[i][0]] = m.group(1).strip()
    return out


ok = True
root = os.path.join(os.path.dirname(__file__), "..", "textes")
for f, labels in LABELS.items():
    s = sections(open(os.path.join(root, f), encoding="utf-8").read(), labels)
    for key, limit in LIMITS:
        n = len(s[key])
        good = 0 < n <= limit
        ok &= good
        print(f"{f:6} {key:6} {n:5}/{limit} {'OK' if good else 'TROP LONG'}")
sys.exit(0 if ok else 1)
