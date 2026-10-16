"""Tiny printing helpers shared by every lesson script.

The lessons teach through their printed output, so the formatting lives in one
place instead of being re-invented per file.
"""

from __future__ import annotations

import textwrap
from typing import Any, Callable, Iterable

WIDTH = 78


def header(title: str) -> None:
    print(f"\n{'=' * WIDTH}\n{title}\n{'=' * WIDTH}")


def section(title: str) -> None:
    print(f"\n--- {title} " + "-" * max(0, WIDTH - len(title) - 5))


def note(text: str) -> None:
    print(textwrap.fill(text, WIDTH, initial_indent="  ", subsequent_indent="  "))


def demo(label: str, value: Any) -> None:
    """Print a labelled result. Multi-line values are indented under the label."""
    rendered = str(value)
    if "\n" in rendered:
        print(f"{label}:")
        print(textwrap.indent(rendered, "    "))
    else:
        print(f"{label}: {rendered}")


def run(sections: Iterable[Callable[[], None]]) -> None:
    for fn in sections:
        header(fn.__name__.replace("section_", "").replace("_", " ").upper())
        if fn.__doc__:
            note(" ".join(fn.__doc__.split()))
        fn()
