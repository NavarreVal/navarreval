# navarreval.com

Static HTML, CSS, and JavaScript site, hosted on Cloudflare Pages. Pages Functions live in `functions/`.

## Images

Commit photos with embedded metadata removed. Before adding or replacing a jpg, jpeg, png, webp, avif, heic, tif, or gif, run:

```bash
./scripts/strip-image-metadata.sh
```

The script needs `exiftool` and, for JPEGs that carry a rotate or mirror orientation, `exiftran`. It bakes that orientation into the pixels (lossless for JPEG), then deletes EXIF, XMP, and IPTC, including GPS, plus JPEG comments and PNG text software tags. An ICC color profile is kept, so stripping metadata does not shift colors. Filenames and paths stay the same.

`./scripts/check-image-metadata.sh` exits non-zero if any image still has GPS, EXIF, XMP, or IPTC. The Image metadata GitHub Action runs that check.
