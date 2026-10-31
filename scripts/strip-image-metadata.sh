#!/usr/bin/env bash
# Remove EXIF, XMP, and IPTC (including GPS) from images in this repo.
# JPEG orientation is baked in first, losslessly, so a photo does not
# rotate when its Orientation tag is removed. An ICC profile is copied
# back after the strip so colors stay put. Filenames and paths stay the same.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

if ! command -v exiftool >/dev/null 2>&1; then
  echo "exiftool is required (package libimage-exiftool-perl)" >&2
  exit 1
fi

exts=(
  -ext jpg -ext jpeg -ext png -ext webp -ext avif
  -ext heic -ext tif -ext tiff -ext gif
)

# exiftool exits 2 when every file fails -if. That is an empty result, not an error.
exiftool_if() {
  local status
  set +e
  exiftool "$@"
  status=$?
  set -e
  if [[ $status -ne 0 && $status -ne 2 ]]; then
    echo "exiftool failed ($status)" >&2
    return "$status"
  fi
  return 0
}

count_gps() {
  local out
  out="$(exiftool_if -q -m -r -i .git \
    -if '$GPSLatitude or $GPSLongitude or $GPSPosition' \
    -p '$Directory/$FileName' \
    "${exts[@]}" .)"
  if [[ -z "$out" ]]; then
    echo 0
  else
    printf '%s\n' "$out" | wc -l | tr -d ' '
  fi
}

echo "GPS tags before: $(count_gps)"

mapfile -t rotate < <(exiftool_if -q -m -n -r -i .git \
  -if '$Orientation >= 2 and $Orientation <= 8' \
  -p '$Directory/$FileName' \
  -ext jpg -ext jpeg .)

if ((${#rotate[@]})); then
  if ! command -v exiftran >/dev/null 2>&1; then
    echo "exiftran is required to bake JPEG orientation" >&2
    exit 1
  fi
  for file in "${rotate[@]}"; do
    exiftran -a -i -p "$file"
  done
fi

mapfile -t strip < <(exiftool_if -q -m -r -i .git \
  -if '$EXIF:All or $XMP:All or $IPTC:All or $GPS:All or $GPSLatitude or $GPSLongitude or $GPSPosition' \
  -p '$Directory/$FileName' \
  "${exts[@]}" .)

if ((${#strip[@]})); then
  exiftool -all= -tagsfromfile @ -icc_profile -overwrite_original -q -- "${strip[@]}"
fi

# ImageMagick sometimes stores a tiny EXIF blob in a PNG zTXt chunk named
# "Raw profile type APP1". exiftool -all= reads it and then leaves it in place.
# Deleting the Software tag drops that chunk. Pixel data is unchanged.
mapfile -t raw_profile < <(exiftool_if -q -m -r -i .git \
  -if '$EXIF:All or $XMP:All or $IPTC:All or $GPS:All or $GPSLatitude or $GPSLongitude or $GPSPosition' \
  -p '$Directory/$FileName' \
  "${exts[@]}" .)

if ((${#raw_profile[@]})); then
  exiftool -Software= -overwrite_original -q -- "${raw_profile[@]}"
fi

# JPEG COM segments and PNG tEXt Software are not EXIF. -all= leaves both.
mapfile -t notes < <(exiftool_if -q -m -r -i .git \
  -if '$Comment or $Software' \
  -p '$Directory/$FileName' \
  "${exts[@]}" .)

if ((${#notes[@]})); then
  exiftool -Comment= -Software= -overwrite_original -q -- "${notes[@]}"
fi

echo "GPS tags after: $(count_gps)"
