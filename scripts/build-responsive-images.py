#!/usr/bin/env python3
"""Genera i WebP usati dall'app a partire dagli originali.

Originali (non importati, fuori dal bundle): design-assets/originali/**/*.{png,jpg,jpeg}
Uscite (importate dall'app):                 src/assets/**/<nome>.webp      larghezza massima 1280 px
                                             src/assets/**/<nome>-640.webp  640 px, per card e miniature
Tabella per srcset/width/height:             src/app/components/media/responsive-images.generated.ts

Regole:
- nessun ingrandimento: un originale più stretto di 1280 px resta alla sua
  larghezza; sotto i 640 px (icone della timeline, 256 px) si genera un solo
  WebP e nessuna variante 640;
- la trasparenza si conserva (alpha_quality 100) quando l'originale ne ha;
- si scartano i metadati EXIF; il profilo ICC, se presente, si conserva.

Uso:
    python3 scripts/build-responsive-images.py              # tutte le immagini
    python3 scripts/build-responsive-images.py --quality 82 # qualità diversa (default 80)
    python3 scripts/build-responsive-images.py --posters    # anche i poster dei video (serve ffmpeg)

Richiede Python 3.9+ e Pillow con supporto WebP (python3 -m pip install Pillow).
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageOps, features

ROOT = Path(__file__).resolve().parent.parent
ORIGINALS = ROOT / "design-assets" / "originali"
OUT = ROOT / "src" / "assets"
TABLE = ROOT / "src" / "app" / "components" / "media" / "responsive-images.generated.ts"
VIDEOS = ROOT / "public" / "videos"

MAX_WIDTH = 1280
SMALL_WIDTH = 640
SOURCE_EXTS = {".png", ".jpg", ".jpeg"}


def has_transparency(image: Image.Image) -> bool:
    if image.mode in ("RGBA", "LA"):
        low, _high = image.getchannel("A").getextrema()
        return low < 255
    if image.mode == "P":
        return "transparency" in image.info
    return False


def resized(image: Image.Image, width: int) -> Image.Image:
    if width >= image.width:
        return image
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def save_webp(image: Image.Image, target: Path, quality: int, icc: bytes | None) -> None:
    options: dict = {"quality": quality, "method": 6}
    if image.mode == "RGBA":
        options["alpha_quality"] = 100
    if icc:
        options["icc_profile"] = icc
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, "WEBP", **options)


def identifier(rel_stem: str, suffix: str = "") -> str:
    name = re.sub(r"[^0-9A-Za-z]+", "_", rel_stem).strip("_")
    return f"img_{name}{suffix}"


def convert_all(quality: int) -> tuple[list[tuple[str, int, int, int, int]], int, int]:
    entries: list[tuple[str, int, int, int, int]] = []
    written = 0
    sources = sorted(p for p in ORIGINALS.rglob("*") if p.suffix.lower() in SOURCE_EXTS)
    if not sources:
        sys.exit(f"Nessun originale in {ORIGINALS}")
    total_in = 0
    for source in sources:
        rel = source.relative_to(ORIGINALS).with_suffix("")
        total_in += source.stat().st_size
        with Image.open(source) as opened:
            opened.load()
            icc = opened.info.get("icc_profile")
            image = ImageOps.exif_transpose(opened)
        image = image.convert("RGBA") if has_transparency(image) else image.convert("RGB")

        main = resized(image, MAX_WIDTH)
        main_path = OUT / rel.with_suffix(".webp")
        save_webp(main, main_path, quality, icc)
        written += 1
        if main.width > SMALL_WIDTH:
            small = resized(image, SMALL_WIDTH)
            small_path = OUT / rel.parent / f"{rel.name}-{SMALL_WIDTH}.webp"
            save_webp(small, small_path, quality, icc)
            written += 1
            entries.append((rel.as_posix(), main.width, main.height, small.width, small.height))
        print(f"{rel.as_posix():55} {image.width}x{image.height} -> {main.width}x{main.height}")
    return entries, written, total_in


def write_table(entries: list[tuple[str, int, int, int, int]]) -> None:
    import_base = Path("../../../assets")
    lines = [
        "/* File generato da scripts/build-responsive-images.py: non modificarlo a mano.",
        " * Per ogni immagine con due larghezze: [WebP fino a 1280 px, WebP 640 px,",
        " * larghezza, altezza, larghezza 640, altezza 640]. Gli originali stanno in",
        " * design-assets/originali/ (vedi il README lì). */",
    ]
    for rel, *_ in entries:
        rel_path = Path(rel)
        lines.append(f'import {identifier(rel)} from "{(import_base / rel_path).as_posix()}.webp";')
        lines.append(
            f'import {identifier(rel, "_640")} from "{(import_base / rel_path.parent / (rel_path.name + "-640")).as_posix()}.webp";'
        )
    lines += [
        "",
        "export type ResponsiveImageEntry = readonly [string, string, number, number, number, number];",
        "",
        "export const RESPONSIVE_IMAGE_ENTRIES: readonly ResponsiveImageEntry[] = [",
    ]
    for rel, w, h, sw, sh in entries:
        lines.append(f"  [{identifier(rel)}, {identifier(rel, '_640')}, {w}, {h}, {sw}, {sh}],")
    lines += ["];", ""]
    TABLE.write_text("\n".join(lines), encoding="utf-8")


def report_orphans() -> None:
    expected = set()
    for source in ORIGINALS.rglob("*"):
        if source.suffix.lower() in SOURCE_EXTS:
            rel = source.relative_to(ORIGINALS).with_suffix("")
            expected.add(OUT / rel.with_suffix(".webp"))
            expected.add(OUT / rel.parent / f"{rel.name}-{SMALL_WIDTH}.webp")
    orphans = sorted(p for p in OUT.rglob("*.webp") if p not in expected)
    for orphan in orphans:
        print(f"ATTENZIONE: {orphan.relative_to(ROOT)} non ha un originale (non cancellato)")


def build_posters(quality: int) -> None:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        sys.exit("--posters richiede ffmpeg nel PATH")
    for video in sorted(VIDEOS.glob("*.mp4")):
        poster = video.with_name(f"{video.stem}-poster.webp")
        subprocess.run(
            [
                ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
                "-ss", "0", "-i", str(video), "-frames:v", "1",
                "-c:v", "libwebp", "-quality", str(quality), "-compression_level", "6",
                str(poster),
            ],
            check=True,
        )
        print(f"poster {poster.relative_to(ROOT)} {poster.stat().st_size // 1000} kB")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--quality", type=int, default=80, help="qualità WebP 0-100 (default 80)")
    parser.add_argument("--posters", action="store_true", help="rigenera anche i poster dei video")
    args = parser.parse_args()
    if not features.check("webp"):
        sys.exit("Pillow senza supporto WebP")

    entries, written, total_in = convert_all(args.quality)
    write_table(entries)
    total_out = sum(p.stat().st_size for p in OUT.rglob("*.webp"))
    print(
        f"\n{written} WebP scritti, {len(entries)} con variante {SMALL_WIDTH} px. "
        f"Originali {total_in / 1e6:.1f} MB -> WebP {total_out / 1e6:.1f} MB. "
        f"Tabella: {TABLE.relative_to(ROOT)}"
    )
    report_orphans()
    if args.posters:
        build_posters(args.quality)


if __name__ == "__main__":
    main()
