#!/usr/bin/env bash
# Fail if any image in the repo still carries GPS, EXIF, XMP, or IPTC.
# ICC profiles are allowed. File, system, and composite dimension tags are ignored.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

if ! command -v exiftool >/dev/null 2>&1; then
  echo "exiftool is required (package libimage-exiftool-perl)" >&2
  exit 1
fi

# exiftool exits 2 when every file fails -if. That is a clean tree, not an error.
set +e
mapfile -t hits < <(exiftool -q -m -r -i .git \
  -if '$EXIF:All or $XMP:All or $IPTC:All or $GPS:All or $GPSLatitude or $GPSLongitude or $GPSPosition' \
  -p '$Directory/$FileName' \
  -ext jpg -ext jpeg -ext png -ext webp -ext avif \
  -ext heic -ext tif -ext tiff -ext gif .)
status=$?
set -e
if [[ $status -ne 0 && $status -ne 2 ]]; then
  echo "exiftool failed ($status)" >&2
  exit "$status"
fi

if ((${#hits[@]})); then
  echo "Images still have GPS, EXIF, XMP, or IPTC:" >&2
  printf '  %s\n' "${hits[@]}" >&2
  exit 1
fi

echo "No GPS, EXIF, XMP, or IPTC on images."
