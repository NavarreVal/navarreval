#!/usr/bin/env python3
"""Convert a Goodreads library export CSV into passion/books.json.

Usage:
    python3 tools/goodreads_csv_to_json.py LIBRARY.csv -o passion/books.json

The reading page loads /passion/books.json when that file is present.
currently-reading and read come from the Exclusive Shelf column. favorites
are rows whose Bookshelves list includes the favorites shelf. read is
ordered by Date Read, newest first. Cover images use Open Library when an
ISBN13 (or ISBN) is present. The generated field is the UTC date of the run.

Only title, author, image, link, and rating are written. Review text and
private notes are never copied. Do not commit the JSON until it is ready
to publish.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path

REQUIRED_COLUMNS = (
    "Book Id",
    "Title",
    "Author",
    "ISBN",
    "ISBN13",
    "My Rating",
    "Date Read",
    "Bookshelves",
    "Exclusive Shelf",
)

_ISBN13 = re.compile(r"^[0-9]{13}$")
_ISBN10 = re.compile(r"^[0-9]{9}[0-9X]$")


def unwrap_isbn(value: str) -> str:
    """Strip the ="..." wrapping Goodreads uses so spreadsheets keep the ISBN."""
    text = (value or "").strip()
    if text.startswith('="') and text.endswith('"') and len(text) >= 2:
        text = text[2:-1]
    elif text.startswith("="):
        text = text[1:].strip().strip('"')
    text = re.sub(r"[\s-]", "", text).upper()
    if _ISBN13.fullmatch(text) or _ISBN10.fullmatch(text):
        return text
    return ""


def cover_url(isbn13: str, isbn: str) -> str:
    chosen = unwrap_isbn(isbn13) or unwrap_isbn(isbn)
    if not chosen:
        return ""
    return "https://covers.openlibrary.org/b/isbn/" + chosen + "-M.jpg?default=false"


def rating_value(value: str) -> int:
    text = (value or "").strip()
    if not text:
        return 0
    try:
        number = float(text)
    except ValueError:
        return 0
    if number < 0:
        return 0
    # Goodreads writes whole stars as "4" or "4.0". 0 means unrated.
    return int(number)


def parse_read_date(value: str):
    text = (value or "").strip()
    if not text:
        return None
    for fmt in ("%Y/%m/%d", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def shelf_tokens(value: str) -> list[str]:
    return [part.strip().casefold() for part in (value or "").split(",") if part.strip()]


def book_from_row(row: dict) -> dict | None:
    title = (row.get("Title") or "").strip()
    author = (row.get("Author") or "").strip()
    book_id = (row.get("Book Id") or "").strip()
    if not title and not book_id:
        return None
    link = ""
    if book_id.isdigit():
        link = "https://www.goodreads.com/book/show/" + book_id
    return {
        "title": title,
        "author": author,
        "image": cover_url(row.get("ISBN13") or "", row.get("ISBN") or ""),
        "link": link,
        "rating": rating_value(row.get("My Rating") or ""),
    }


def convert_rows(rows: list[dict], generated: str) -> dict:
    currently = []
    read_items = []
    favorites = []
    for index, row in enumerate(rows):
        book = book_from_row(row)
        if book is None:
            continue
        exclusive = (row.get("Exclusive Shelf") or "").strip().casefold()
        if exclusive == "currently-reading":
            currently.append(dict(book))
        elif exclusive == "read":
            read_items.append((parse_read_date(row.get("Date Read") or ""), index, dict(book)))
        if "favorites" in shelf_tokens(row.get("Bookshelves") or ""):
            favorites.append(dict(book))
    read_items.sort(
        key=lambda item: (item[0] is not None, item[0] or date.min, -item[1]),
        reverse=True,
    )
    return {
        "generated": generated,
        "shelves": {
            "currently-reading": currently,
            "read": [item[2] for item in read_items],
            "favorites": favorites,
        },
    }


def load_csv(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames:
            reader.fieldnames = [name.strip() for name in reader.fieldnames]
        names = reader.fieldnames or []
        missing = [name for name in REQUIRED_COLUMNS if name not in names]
        if missing:
            raise SystemExit("Missing CSV columns: " + ", ".join(missing))
        return list(reader)


def dumps(payload: dict) -> str:
    return json.dumps(payload, indent=2, ensure_ascii=False) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Convert a Goodreads library export CSV into passion/books.json."
    )
    parser.add_argument("csv", help="Path to the Goodreads library export CSV")
    parser.add_argument(
        "-o",
        "--output",
        help="Output path. Prints to stdout when omitted.",
    )
    args = parser.parse_args(argv)
    generated = datetime.now(timezone.utc).date().isoformat()
    payload = convert_rows(load_csv(Path(args.csv)), generated)
    text = dumps(payload)
    if args.output:
        Path(args.output).write_text(text, encoding="utf-8")
    else:
        sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
