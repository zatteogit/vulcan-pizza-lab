#!/usr/bin/env python3
"""Genera i WebP usati dall'app a partire dagli originali.

Originali (non importati, fuori dal bundle): design-assets/originali/**/*.{png,jpg,jpeg}
Uscite (importate dall'app):                 src/assets/**/<nome>.webp        larghezza massima 1280 px
                                             src/assets/**/<nome>-<w>.webp    variante piccola, w = 640 px
                                                                              (320 px per i condimenti)
Tabella per srcset/width/height:             src/app/components/media/responsive-images.generated.ts

Regole:
- nessun ingrandimento: un originale più stretto di 1280 px resta alla sua
  larghezza; sotto la larghezza piccola (icone della timeline, 256 px) si
  genera un solo WebP e nessuna variante piccola;
- qualità e larghezza piccola dipendono dalla cartella (PROFILES): i
  condimenti si vedono grandi solo nel carosello della scheda Condimento e
  piccoli solo come miniature da 40–48 px, quindi qualità 75 e variante da
  320 px (docs/budget-prestazioni.md, «Immagini: margine per il catalogo»);
- la trasparenza si conserva (alpha_quality 100) quando l'originale ne ha;
- si scartano i metadati EXIF; il profilo ICC, se presente, si conserva;
- non si riscrivono le foto di riserva delle schede dell'archivio CMS
  (public/media/catalog.json: la versione «Precedente» ne è la copia byte per
  byte) né i WebP consegnati più compressi del loro originale (DELIVERED).

Uso:
    python3 scripts/build-responsive-images.py              # tutte le immagini
    python3 scripts/build-responsive-images.py --quality 82 # qualità di base diversa (default 80)
    python3 scripts/build-responsive-images.py --posters    # anche i poster dei video (serve ffmpeg)
    python3 scripts/build-responsive-images.py --table-only # solo la tabella, dai WebP esistenti

Richiede Python 3.9+ e Pillow con supporto WebP (python3 -m pip install Pillow).
"""

from __future__ import annotations

import argparse
import json
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
MEDIA_CATALOG = ROOT / "public" / "media" / "catalog.json"

MAX_WIDTH = 1280
SMALL_WIDTH = 640
SOURCE_EXTS = {".png", ".jpg", ".jpeg"}

# Profili per la prima cartella sotto originali/ (e sotto src/assets/).
# Condimenti (31 MB su 42 del budget il 31/10/2026): la foto grande si vede
# solo nel carosello (896 px CSS a 1280, 354 px CSS a 390) e a qualità 75 non
# si distingue dalla 80; la piccola serve solo alle miniature da 40–48 px CSS
# (al massimo 288 px reali con `sizes` 96px a 3x).
PROFILES: dict[str, dict[str, int]] = {
    "toppings": {"quality": 75, "small": 320},
}

# WebP consegnati già pronti accanto al loro originale, più compressi di quanto
# farebbe lo script (Lotto 3, #180): lo script non li riscrive; per la
# variante piccola vale la regola delle foto consegnate (vedi delivered_small).
DELIVERED = {"pizzas/tegliaingiornata", "toppings/topping_sfincionebianco"}


def profile(rel: str, base_quality: int) -> tuple[int, int]:
    """(qualità, larghezza piccola) per un percorso relativo come «toppings/x»."""
    settings = PROFILES.get(rel.split("/", 1)[0], {})
    return settings.get("quality", base_quality), settings.get("small", SMALL_WIDTH)


def cms_fallbacks() -> set[str]:
    """Percorsi (senza estensione) delle foto di riserva delle schede CMS."""
    if not MEDIA_CATALOG.exists():
        return set()
    catalog = json.loads(MEDIA_CATALOG.read_text(encoding="utf-8"))
    return {str(Path(slot).with_suffix("")) for slot in catalog.get("active", {})}


def small_path(main_path: Path, width: int) -> Path:
    return main_path.with_name(f"{main_path.stem}-{width}.webp")


def existing_small(main_path: Path, preferred: int) -> Path | None:
    """La variante piccola presente accanto a un WebP grande: quella del
    profilo se c'è, altrimenti l'unica che esiste (es. le schede CMS a 640)."""
    pattern = re.compile(rf"^{re.escape(main_path.stem)}-(\d+)\.webp$")
    found = {int(m.group(1)): p for p in main_path.parent.glob(f"{main_path.stem}-*.webp") if (m := pattern.match(p.name))}
    if preferred in found:
        return found[preferred]
    return found[max(found)] if found else None


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


def convert_all(base_quality: int) -> tuple[list[tuple[str, str, int, int, int, int]], int, int]:
    entries: list[tuple[str, str, int, int, int, int]] = []
    written = 0
    sources = sorted(p for p in ORIGINALS.rglob("*") if p.suffix.lower() in SOURCE_EXTS)
    if not sources:
        sys.exit(f"Nessun originale in {ORIGINALS}")
    protected = cms_fallbacks() | DELIVERED
    total_in = 0
    for source in sources:
        rel = source.relative_to(ORIGINALS).with_suffix("")
        if rel.as_posix() in protected:
            print(f"{rel.as_posix():55} non riscritto (scheda CMS o WebP consegnato)")
            continue
        quality, small_width = profile(rel.as_posix(), base_quality)
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
        if main.width > small_width:
            small = resized(image, small_width)
            target = small_path(main_path, small_width)
            save_webp(small, target, quality, icc)
            written += 1
            entries.append((rel.as_posix(), target.stem, main.width, main.height, small.width, small.height))
        print(f"{rel.as_posix():55} {image.width}x{image.height} -> {main.width}x{main.height} q{quality}")
    return entries, written, total_in


def delivered_small(base_quality: int) -> int:
    """Variante piccola dei WebP consegnati senza originale (o in DELIVERED)
    quando manca alla larghezza del profilo: si ricava dal WebP grande
    consegnato (la riduzione nasconde gli artefatti). Non tocca le schede CMS."""
    written = 0
    skip = cms_fallbacks()
    for main_path in sorted(OUT.rglob("*.webp")):
        if re.search(r"-\d+$", main_path.stem):
            continue
        rel = main_path.relative_to(OUT).with_suffix("").as_posix()
        has_original = any((ORIGINALS / f"{rel}{ext}").exists() for ext in SOURCE_EXTS)
        if rel in skip or (has_original and rel not in DELIVERED) or existing_small(main_path, 0) is None:
            continue
        quality, small_width = profile(rel, base_quality)
        target = small_path(main_path, small_width)
        if target.exists():
            continue
        with Image.open(main_path) as opened:
            opened.load()
            icc = opened.info.get("icc_profile")
            image = opened.convert("RGBA") if has_transparency(opened) else opened.convert("RGB")
        save_webp(resized(image, small_width), target, quality, icc)
        written += 1
        print(f"{rel:55} variante {small_width} px dal WebP consegnato")
    return written


def delivered_pairs(entries: list[tuple[str, str, int, int, int, int]], base_quality: int) -> list[tuple[str, str, int, int, int, int]]:
    """Coppie <nome>.webp + <nome>-<w>.webp già pronte che lo script non
    riscrive (foto consegnate senza originale, es. i condimenti del Lotto 1,
    #165; schede CMS; DELIVERED): restano in tabella."""
    known = {rel for rel, *_ in entries}
    pairs = []
    for main_path in sorted(OUT.rglob("*.webp")):
        if re.search(r"-\d+$", main_path.stem):
            continue
        rel = main_path.relative_to(OUT).with_suffix("").as_posix()
        small = existing_small(main_path, profile(rel, base_quality)[1])
        if rel in known or small is None:
            continue
        with Image.open(main_path) as main_image, Image.open(small) as small_image:
            pairs.append((rel, small.stem, main_image.width, main_image.height, small_image.width, small_image.height))
    return pairs


def write_table(entries: list[tuple[str, str, int, int, int, int]]) -> None:
    import_base = Path("../../../assets")
    lines = [
        "/* File generato da scripts/build-responsive-images.py: non modificarlo a mano.",
        " * Per ogni immagine con due larghezze: [WebP fino a 1280 px, WebP piccolo",
        " * (640 px, 320 px per i condimenti), larghezza, altezza, larghezza e altezza",
        " * del piccolo]. Gli originali stanno in design-assets/originali/ (vedi il README lì). */",
    ]
    for rel, small_stem, *_ in entries:
        rel_path = Path(rel)
        width = small_stem.rsplit("-", 1)[1]
        lines.append(f'import {identifier(rel)} from "{(import_base / rel_path).as_posix()}.webp";')
        lines.append(
            f'import {identifier(rel, "_" + width)} from "{(import_base / rel_path.parent / small_stem).as_posix()}.webp";'
        )
    lines += [
        "",
        "export type ResponsiveImageEntry = readonly [string, string, number, number, number, number];",
        "",
        "export const RESPONSIVE_IMAGE_ENTRIES: readonly ResponsiveImageEntry[] = [",
    ]
    for rel, small_stem, w, h, sw, sh in entries:
        width = small_stem.rsplit("-", 1)[1]
        lines.append(f"  [{identifier(rel)}, {identifier(rel, '_' + width)}, {w}, {h}, {sw}, {sh}],")
    lines += ["];", ""]
    TABLE.write_text("\n".join(lines), encoding="utf-8")


def report_orphans(entries: list[tuple[str, str, int, int, int, int]]) -> None:
    expected = set()
    for source in ORIGINALS.rglob("*"):
        if source.suffix.lower() in SOURCE_EXTS:
            expected.add(OUT / source.relative_to(ORIGINALS).with_suffix(".webp"))
    for rel, small_stem, *_ in entries:
        expected.add(OUT / f"{rel}.webp")
        expected.add(OUT / Path(rel).parent / f"{small_stem}.webp")
    orphans = sorted(p for p in OUT.rglob("*.webp") if p not in expected)
    for orphan in orphans:
        print(f"ATTENZIONE: {orphan.relative_to(ROOT)} non ha un originale né è in tabella (non cancellato)")


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
    parser.add_argument("--quality", type=int, default=80, help="qualità WebP di base 0-100 (default 80; PROFILES la sostituisce per cartella)")
    parser.add_argument("--posters", action="store_true", help="rigenera anche i poster dei video")
    parser.add_argument("--table-only", action="store_true", help="rifà solo la tabella dai WebP esistenti, senza riconvertire")
    args = parser.parse_args()
    if not features.check("webp"):
        sys.exit("Pillow senza supporto WebP")
    if args.table_only:
        entries = sorted(delivered_pairs([], args.quality))
        write_table(entries)
        print(f"Tabella: {TABLE.relative_to(ROOT)} ({len(entries)} voci)")
        report_orphans(entries)
        return

    entries, written, total_in = convert_all(args.quality)
    written += delivered_small(args.quality)
    entries = sorted(entries + delivered_pairs(entries, args.quality))
    write_table(entries)
    total_out = sum(p.stat().st_size for p in OUT.rglob("*.webp"))
    print(
        f"\n{written} WebP scritti, {len(entries)} con variante piccola. "
        f"Originali {total_in / 1e6:.1f} MB -> WebP {total_out / 1e6:.1f} MB. "
        f"Tabella: {TABLE.relative_to(ROOT)}"
    )
    report_orphans(entries)
    if args.posters:
        build_posters(args.quality)


if __name__ == "__main__":
    main()
