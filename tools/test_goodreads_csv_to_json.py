import csv
import json
import re
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import goodreads_csv_to_json as conv

HEADER = [
    "Book Id",
    "Title",
    "Author",
    "ISBN",
    "ISBN13",
    "My Rating",
    "Date Read",
    "Bookshelves",
    "Exclusive Shelf",
    "My Review",
    "Private Notes",
]


def row(**fields):
    base = {name: "" for name in HEADER}
    base.update(fields)
    return base


class ConvertTests(unittest.TestCase):
    def test_shelves_order_isbn_and_private_fields(self):
        rows = [
            row(**{
                "Book Id": "1",
                "Title": "Older",
                "Author": "Ann",
                "ISBN": '="0553380168"',
                "ISBN13": '="9780553380163"',
                "My Rating": "4",
                "Date Read": "2023/06/01",
                "Bookshelves": "owned, favorites",
                "Exclusive Shelf": "read",
                "My Review": "REVIEW_SENTINEL_do_not_copy",
                "Private Notes": "PRIVATE_NOTE_SENTINEL",
            }),
            row(**{
                "Book Id": "2",
                "Title": "Newest, with a comma",
                "Author": "Bea",
                "ISBN": '="080533029X"',
                "ISBN13": '=""',
                "My Rating": "0",
                "Date Read": "2024/12/15",
                "Bookshelves": "favorites",
                "Exclusive Shelf": "read",
            }),
            row(**{
                "Book Id": "3",
                "Title": "Same day, later row",
                "Author": "Cy",
                "ISBN": "",
                "ISBN13": "9780451524935",
                "My Rating": "5",
                "Date Read": "2024/12/15",
                "Bookshelves": "sci-fi",
                "Exclusive Shelf": "read",
            }),
            row(**{
                "Book Id": "4",
                "Title": "Undated",
                "Author": "Dee",
                "My Rating": "",
                "Date Read": "",
                "Bookshelves": "my-favorites, owned",
                "Exclusive Shelf": "read",
            }),
            row(**{
                "Book Id": "5",
                "Title": "Now",
                "Author": "Eve",
                "My Rating": "2",
                "Bookshelves": "currently-reading, favorites",
                "Exclusive Shelf": "currently-reading",
            }),
            row(**{
                "Book Id": "6",
                "Title": "Queued favorite",
                "Author": "Fay",
                "My Rating": "0",
                "Bookshelves": "to-read, Favorites",
                "Exclusive Shelf": "to-read",
            }),
            row(**{
                "Book Id": "7",
                "Title": "Not a favorite shelf",
                "Author": "Gus",
                "Bookshelves": "favorite-books",
                "Exclusive Shelf": "to-read",
            }),
            row(),
        ]
        payload = conv.convert_rows(rows, "2026-11-01")
        self.assertEqual(payload["generated"], "2026-11-01")
        shelves = payload["shelves"]
        self.assertEqual(
            [book["title"] for book in shelves["currently-reading"]],
            ["Now"],
        )
        self.assertEqual(
            [book["title"] for book in shelves["read"]],
            ["Newest, with a comma", "Same day, later row", "Older", "Undated"],
        )
        self.assertEqual(
            [book["title"] for book in shelves["favorites"]],
            ["Older", "Newest, with a comma", "Now", "Queued favorite"],
        )
        older = shelves["read"][2]
        self.assertEqual(list(older.keys()), ["title", "author", "image", "link", "rating"])
        self.assertEqual(
            older["image"],
            "https://covers.openlibrary.org/b/isbn/9780553380163-M.jpg?default=false",
        )
        self.assertEqual(older["link"], "https://www.goodreads.com/book/show/1")
        self.assertEqual(older["rating"], 4)
        newest = shelves["read"][0]
        self.assertEqual(
            newest["image"],
            "https://covers.openlibrary.org/b/isbn/080533029X-M.jpg?default=false",
        )
        self.assertEqual(newest["rating"], 0)
        plain = shelves["read"][1]
        self.assertEqual(
            plain["image"],
            "https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg?default=false",
        )
        self.assertEqual(shelves["read"][3]["image"], "")
        self.assertEqual(shelves["read"][3]["rating"], 0)
        encoded = json.dumps(payload)
        self.assertNotIn("REVIEW_SENTINEL_do_not_copy", encoded)
        self.assertNotIn("PRIVATE_NOTE_SENTINEL", encoded)
        self.assertNotIn("My Review", encoded)
        self.assertNotIn("Private Notes", encoded)

    def test_decimal_rating_is_a_whole_star(self):
        payload = conv.convert_rows([
            row(**{
                "Book Id": "9",
                "Title": "Decimal",
                "Author": "Ann",
                "My Rating": "4.0",
                "Date Read": "2024/01/01",
                "Exclusive Shelf": "read",
            }),
            row(**{
                "Book Id": "10",
                "Title": "Unrated",
                "Author": "Bea",
                "My Rating": "0",
                "Exclusive Shelf": "currently-reading",
            }),
        ], "2026-11-01")
        self.assertEqual(payload["shelves"]["read"][0]["rating"], 4)
        self.assertIsInstance(payload["shelves"]["read"][0]["rating"], int)
        self.assertEqual(payload["shelves"]["currently-reading"][0]["rating"], 0)

    def test_cli_round_trip_strips_excel_isbn_and_rejects_a_short_header(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            source = folder / "library.csv"
            with source.open("w", encoding="utf-8-sig", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=HEADER)
                writer.writeheader()
                writer.writerow(row(**{
                    "Book Id": "42",
                    "Title": "Exported",
                    "Author": "Jo",
                    "ISBN": '="014143984X"',
                    "ISBN13": '=""',
                    "My Rating": "3",
                    "Date Read": "2024-01-02",
                    "Bookshelves": "favorites",
                    "Exclusive Shelf": "read",
                    "My Review": "do not keep this review",
                    "Private Notes": "do not keep this note",
                }))
            out = folder / "books.json"
            self.assertEqual(conv.main([str(source), "-o", str(out)]), 0)
            payload = json.loads(out.read_text(encoding="utf-8"))
            self.assertRegex(payload["generated"], r"^\d{4}-\d{2}-\d{2}$")
            book = payload["shelves"]["read"][0]
            self.assertEqual(book["title"], "Exported")
            self.assertEqual(
                book["image"],
                "https://covers.openlibrary.org/b/isbn/014143984X-M.jpg?default=false",
            )
            self.assertEqual(book["rating"], 3)
            self.assertNotIn("do not keep this review", out.read_text(encoding="utf-8"))
            self.assertNotIn("do not keep this note", out.read_text(encoding="utf-8"))

            short = folder / "short.csv"
            short.write_text("Title,Author\nHi,Jo\n", encoding="utf-8")
            with self.assertRaises(SystemExit):
                conv.load_csv(short)

    def test_published_books_json_shape(self):
        path = Path(__file__).resolve().parents[1] / "passion" / "books.json"
        raw = path.read_text(encoding="utf-8")
        payload = json.loads(raw)
        self.assertEqual(set(payload), {"generated", "shelves"})
        self.assertRegex(payload["generated"], r"^\d{4}-\d{2}-\d{2}$")
        shelves = payload["shelves"]
        self.assertEqual(list(shelves), ["currently-reading", "read", "favorites"])
        self.assertEqual(len(shelves["currently-reading"]), 4)
        self.assertEqual(len(shelves["read"]), 233)
        self.assertEqual(len(shelves["favorites"]), 12)
        for needle in ("My Review", "Private Notes", "Bookshelves", "Date Read", "Exclusive Shelf", "Date Added"):
            self.assertNotIn(needle, raw)
        for books in shelves.values():
            for book in books:
                self.assertEqual(list(book), ["title", "author", "image", "link", "rating"])
                self.assertIsInstance(book["rating"], int)
                self.assertGreaterEqual(book["rating"], 0)
                self.assertLessEqual(book["rating"], 5)
                self.assertRegex(book["link"], r"^https://www\.goodreads\.com/book/show/[0-9]+$")
                self.assertTrue(
                    book["image"] == ""
                    or re.fullmatch(
                        r"https://covers\.openlibrary\.org/b/isbn/[0-9X]{10,13}-M\.jpg\?default=false",
                        book["image"],
                    )
                )


if __name__ == "__main__":
    unittest.main()
