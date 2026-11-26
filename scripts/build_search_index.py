#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成站内检索索引 data/search-index.json。

用法（在站点根目录执行）：
    python scripts/build_search_index.py

索引与 assets/js/app.js 中 slugify() 的锚点算法保持一致，
因此检索结果里的 #anchor 能直接跳到教材页面对应小节。
"""
from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LESSONS_JSON = ROOT / "data" / "lessons.json"
OUT = ROOT / "data" / "search-index.json"

HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")
FENCE_RE = re.compile(r"^\s*(```|~~~)")
INLINE_LINK_RE = re.compile(r"!?\[([^\]]*)\]\([^)]*\)")
HTML_TAG_RE = re.compile(r"<[^>]+>")
SLUG_STRIP_RE = re.compile(r"[^a-zA-Z0-9_\u4e00-\u9fa5]+")
SPACE_RE = re.compile(r"\s+")


def plain_text(text: str) -> str:
    """把一行 Markdown 粗略还原为渲染后的纯文本，用于标题与片段。

    代码片段（反引号包裹）中的 __name__、__init__ 等下划线必须保留，
    否则锚点会和 app.js 的 slugify 结果对不上。
    """
    spans: list[str] = []

    def keep_code(match: re.Match[str]) -> str:
        spans.append(match.group(1))
        return f"\x00{len(spans) - 1}\x00"

    text = re.sub(r"`([^`]*)`", keep_code, text)
    text = INLINE_LINK_RE.sub(r"\1", text)
    text = HTML_TAG_RE.sub("", text)
    text = text.replace("**", "")
    text = re.sub(r"(?<!\w)__(.+?)__(?!\w)", r"\1", text)
    for i, code in enumerate(spans):
        text = text.replace(f"\x00{i}\x00", code)
    return SPACE_RE.sub(" ", text).strip()


def slugify(text: str, used: set[str]) -> str:
    """与 app.js slugify() 一致：小写、非字母数字中文转 '-'、去首尾 '-'、重名加 -2。"""
    base = SLUG_STRIP_RE.sub("-", text.strip().lower()).strip("-")
    if not base:
        base = "section"
    ident, n = base, 2
    while ident in used:
        ident = f"{base}-{n}"
        n += 1
    used.add(ident)
    return ident


def parse_sections(md: str) -> list[dict]:
    """按 h2/h3/h4 切分，正文取到下一个任意级别标题为止。"""
    used: set[str] = set()
    sections: list[dict] = []
    lines = md.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    in_fence = False
    current: dict | None = None
    body: list[str] = []

    def flush() -> None:
        nonlocal current, body
        if current is not None:
            text = plain_text(" ".join(body))
            current["x"] = text[:200]
            sections.append(current)
        current, body = None, []

    for line in lines:
        if FENCE_RE.match(line):
            in_fence = not in_fence
            if current is not None:
                body.append(plain_text(line.lstrip("`~ ")))
            continue
        match = None if in_fence else HEADING_RE.match(line)
        if match:
            level = len(match.group(1))
            title = plain_text(match.group(2))
            flush()
            if level in (2, 3, 4) and title:
                current = {"h": title, "lv": level, "a": slugify(title, used)}
            continue
        if current is not None:
            body.append(plain_text(line))
    flush()
    return sections


def main() -> int:
    data = json.loads(LESSONS_JSON.read_text(encoding="utf-8"))
    items: list[dict] = []
    lessons: dict[str, dict] = {}
    seen_files: set[str] = set()
    missing: list[str] = []

    for group in data["groups"]:
        for lesson in group["items"]:
            file = lesson["file"]
            if file in seen_files:
                continue
            seen_files.add(file)
            path = ROOT / file
            if not path.exists():
                missing.append(file)
                continue
            lessons[lesson["id"]] = {
                "t": lesson["title"],
                "g": group["name"],
                "gi": group["id"],
                "tg": lesson.get("tags", []),
            }
            sections = parse_sections(path.read_text(encoding="utf-8"))
            for sec in sections:
                items.append({
                    "l": lesson["id"],
                    "a": sec["a"],
                    "h": sec["h"],
                    "lv": sec["lv"],
                    "x": sec["x"],
                })

    payload = {
        "generated": date.today().isoformat(),
        "count": len(items),
        "lessons": lessons,
        "items": items,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    size = OUT.stat().st_size
    print(f"lessons={len(lessons)} sections={len(items)} size={size/1024:.1f}KB -> {OUT}")
    if missing:
        print("missing files: " + ", ".join(missing), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
