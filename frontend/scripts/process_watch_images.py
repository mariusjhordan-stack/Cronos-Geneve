#!/usr/bin/env python3
"""
Pipeline de imágenes de producto de Cronos Genève.

Fuente de verdad : frontend/scripts/watch_images_manifest.json   (qué imagen va a qué reloj, de dónde sale y con qué licencia)
Originales       : frontend/image-originals/<slug>/<archivo>     (NO se versionan; se bajan con --descargar)
Salida           : frontend/public/images/relojes/<slug>/...     (sí se versiona; es lo que sirve React)
                   frontend/public/images/relojes/manifest.json  (lo lee `manage.py sincronizar_imagenes`)
                   docs/IMAGE-SOURCES.md                         (tabla de procedencia, generada del manifiesto)

Estándar visual
  * Lienzo 1200x1500 (4:5), fondo #FAF8F4, WebP.
  * Producto ("modo": "producto"): fondo retirado con rembg, centrado, ~75 % del alto, sombra de contacto sutil.
  * Ambiente/detalle ("modo": "ambiente"): sin retirar fondo. Se recorta como máximo un 25 % del lado largo;
    si hiciera falta más, se rellena el lienzo con el color del borde de la foto (nunca se deforma el reloj).
  * Ilustraciones SVG propias ("modo": "svg"): se reubican en el mismo lienzo 4:5 (sin rasterizar).

Uso (desde frontend/):
  pip install pillow "rembg[cpu]"
  python scripts/process_watch_images.py --descargar     # baja originales con licencia verificada (curl)
  python scripts/process_watch_images.py                  # procesa todo
  python scripts/process_watch_images.py --solo rolex-gmt-master-pepsi
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]            # frontend/
REPO = ROOT.parent
MANIFEST = ROOT / "scripts" / "watch_images_manifest.json"
ORIGINALS = ROOT / "image-originals"
OUT = ROOT / "public" / "images" / "relojes"
DOCS = REPO / "docs" / "IMAGE-SOURCES.md"
PUBLIC_PREFIX = "/images/relojes"

CANVAS_W, CANVAS_H = 1200, 1500
CARD_W, CARD_H = 600, 750
BG = (250, 248, 244)  # #FAF8F4
PRODUCT_HEIGHT_RATIO = 0.75
PRODUCT_WIDTH_MAX_RATIO = 0.80
MAX_CROP = 0.25


# ----------------------------------------------------------------------------- utilidades
def curl_download(url: str, dest: Path) -> None:
    """curl y no urllib: respeta el almacén de certificados del sistema y el User-Agent exigido por Wikimedia."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["curl", "-sS", "-L", "--fail", "--retry", "5", "--retry-delay", "8", "-A",
         "CronosGeneveAcademic/1.0 (proyecto universitario)", "-o", str(dest), url],
        check=True,
    )


def save_webp(img: Image.Image, dest: Path, quality: int = 88) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(dest, "WEBP", quality=quality, method=6)


def save_card(canvas: Image.Image, dest: Path) -> None:
    save_webp(canvas.resize((CARD_W, CARD_H), Image.LANCZOS), dest, quality=84)


def edge_color(img: Image.Image, top: bool) -> tuple[int, int, int]:
    strip = img.convert("RGB").crop((0, 0, img.width, 6) if top else (0, img.height - 6, img.width, img.height))
    return strip.resize((1, 1), Image.BOX).getpixel((0, 0))


# ----------------------------------------------------------------------------- modos
def remove_background(img: Image.Image) -> Image.Image:
    from rembg import remove  # import perezoso: solo hace falta en modo "producto"
    return remove(img.convert("RGB"), alpha_matting=False)


def build_product(src: Path) -> Image.Image:
    cut = remove_background(Image.open(src))
    bbox = cut.getchannel("A").point(lambda a: 255 if a > 16 else 0).getbbox()
    if not bbox:
        raise RuntimeError(f"rembg no detectó sujeto en {src.name}")
    cut = cut.crop(bbox)
    scale = min(CANVAS_H * PRODUCT_HEIGHT_RATIO / cut.height, CANVAS_W * PRODUCT_WIDTH_MAX_RATIO / cut.width)
    cut = cut.resize((round(cut.width * scale), round(cut.height * scale)), Image.LANCZOS)

    canvas = Image.new("RGB", (CANVAS_W, CANVAS_H), BG)
    x = (CANVAS_W - cut.width) // 2
    y = (CANVAS_H - cut.height) // 2

    # Sombra de contacto: elipse suave bajo la base del reloj (opacidad baja, desenfoque amplio).
    shadow = Image.new("L", (CANVAS_W, CANVAS_H), 0)
    sw, sh = int(cut.width * 0.62), 26
    cx, cy = CANVAS_W // 2, y + cut.height + 6
    ImageDraw.Draw(shadow).ellipse((cx - sw // 2, cy - sh // 2, cx + sw // 2, cy + sh // 2), fill=70)
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    canvas.paste(Image.new("RGB", canvas.size, (60, 52, 44)), (0, 0), shadow)
    canvas.paste(cut, (x, y), cut)
    return canvas


def build_ambient(src: Path) -> Image.Image:
    img = Image.open(src).convert("RGB")
    target = CANVAS_W / CANVAS_H
    ratio = img.width / img.height
    if ratio >= target:                       # más ancha que 4:5 -> recorte lateral
        crop = 1 - target / ratio
        if crop <= MAX_CROP:
            new_w = round(img.height * target)
            left = (img.width - new_w) // 2
            return img.crop((left, 0, left + new_w, img.height)).resize((CANVAS_W, CANVAS_H), Image.LANCZOS)
        scaled = img.resize((CANVAS_W, round(img.height * CANVAS_W / img.width)), Image.LANCZOS)
        canvas = Image.new("RGB", (CANVAS_W, CANVAS_H), edge_color(scaled, True))
        top_c, bot_c = edge_color(scaled, True), edge_color(scaled, False)
        y0 = (CANVAS_H - scaled.height) // 2
        canvas.paste(Image.new("RGB", (CANVAS_W, CANVAS_H // 2), top_c), (0, 0))
        canvas.paste(Image.new("RGB", (CANVAS_W, CANVAS_H - CANVAS_H // 2), bot_c), (0, CANVAS_H // 2))
        canvas.paste(scaled, (0, y0))
        return canvas
    crop = 1 - ratio / target                 # más alta que 4:5 -> recorte vertical
    if crop <= MAX_CROP:
        new_h = round(img.width / target)
        top = round((img.height - new_h) * 0.45)
        return img.crop((0, top, img.width, top + new_h)).resize((CANVAS_W, CANVAS_H), Image.LANCZOS)
    scaled = img.resize((round(img.width * CANVAS_H / img.height), CANVAS_H), Image.LANCZOS)
    canvas = Image.new("RGB", (CANVAS_W, CANVAS_H), edge_color(scaled.transpose(Image.ROTATE_90), True))
    canvas.paste(scaled, ((CANVAS_W - scaled.width) // 2, 0))
    return canvas


SVG_BG_RE = re.compile(r'\s*<rect width="500" height="500" fill="url\(#bgLight\)"\s*/>', re.I)


def build_svg(src: Path, dest: Path) -> None:
    """Reubica la ilustración 500x500 en un lienzo 4:5 con el fondo y la sombra del estándar (SVG -> SVG)."""
    text = src.read_text(encoding="utf-8")
    inner = re.search(r"<svg[^>]*>(.*)</svg>", text, re.S).group(1)
    inner = SVG_BG_RE.sub("", inner)
    inner = "\n".join(line.rstrip() for line in inner.splitlines() if line.strip())
    size = CANVAS_W                          # la ilustración ocupa ~72 % del alto del lienzo
    x, y = (CANVAS_W - size) // 2, (CANVAS_H - size) // 2 - 10
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS_W} {CANVAS_H}" width="{CANVAS_W}" height="{CANVAS_H}" role="img">
  <defs><filter id="contact" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="16" /></filter></defs>
  <rect width="{CANVAS_W}" height="{CANVAS_H}" fill="#FAF8F4" />
  <ellipse cx="{CANVAS_W // 2}" cy="{y + size - 24}" rx="{round(size * 0.27)}" ry="13" fill="#3C342C" opacity="0.18" filter="url(#contact)" />
  <svg x="{x}" y="{y}" width="{size}" height="{size}" viewBox="0 0 500 500">{inner}</svg>
</svg>
"""
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(svg, encoding="utf-8")


# ----------------------------------------------------------------------------- pipeline
def process(entry: dict, only: str | None, download: bool) -> list[dict]:
    slug = entry["slug"]
    if only and only != slug:
        return []
    out_images = []
    for img in entry["imagenes"]:
        name = img["archivo"]                     # p. ej. "principal"
        modo = img["modo"]
        if modo == "svg":
            src = ROOT / img["origen_local"]
            build_svg(src, OUT / slug / f"{name}.svg")
            url, card = f"{PUBLIC_PREFIX}/{slug}/{name}.svg", ""
        else:
            src = ORIGINALS / slug / img["original"]
            if download and not src.exists():
                curl_download(img["url_descarga"], src)
            if not src.exists():
                print(f"  ! falta el original {src} (usa --descargar)", file=sys.stderr)
                continue
            canvas = build_product(src) if modo == "producto" else build_ambient(src)
            save_webp(canvas, OUT / slug / f"{name}.webp")
            save_card(canvas, OUT / slug / f"{name}-card.webp")
            url, card = f"{PUBLIC_PREFIX}/{slug}/{name}.webp", f"{PUBLIC_PREFIX}/{slug}/{name}-card.webp"
        print(f"  ok {slug}/{name} ({modo})")
        out_images.append({
            "orden": img["orden"], "es_principal": img.get("es_principal", False), "tipo": img["tipo"],
            "url": url, "url_card": card, "alt_text": img["alt_text"],
        })
    return out_images


def write_sources_doc(entries: list[dict]) -> None:
    rows = ["| Asset | Producto / sección | Fuente | URL original | Licencia / estado |", "|---|---|---|---|---|"]
    for e in entries:
        for img in e["imagenes"]:
            ruta = f"`images/relojes/{e['slug']}/{img['archivo']}.{'svg' if img['modo'] == 'svg' else 'webp'}`"
            rows.append(f"| {ruta} | {e['reloj']} — {img['tipo'].lower()} | {img['fuente']} | {img['url_original']} | {img['licencia']} |")
    header = (
        "# Procedencia de las imágenes\n\n"
        "> Generado por `frontend/scripts/process_watch_images.py` a partir de `frontend/scripts/watch_images_manifest.json`. "
        "No editar a mano: cambia el manifiesto y vuelve a ejecutar el script.\n\n"
    )
    pending = ENTRIES_PENDING_NOTE
    DOCS.parent.mkdir(parents=True, exist_ok=True)
    DOCS.write_text(header + "\n".join(rows) + "\n\n" + pending, encoding="utf-8")


ENTRIES_PENDING_NOTE = (
    "## Estado\n\n"
    "* Las filas con licencia *Original del proyecto* son **ilustraciones vectoriales provisionales**, no fotografías del producto. "
    "Se muestran con la etiqueta «Ilustración» y deben sustituirse por fotografía con licencia verificada.\n"
    "* Ninguna imagen proviene de buscadores, tiendas de reventa ni miniaturas de Google (las 48 URLs externas anteriores se retiraron: "
    "no tenían licencia verificable y eran de 225–554 px). Ver `docs/IMAGE-AUDIT.md`.\n"
)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--descargar", action="store_true", help="descarga los originales (Wikimedia Commons) que falten")
    ap.add_argument("--solo", help="procesa un único slug")
    args = ap.parse_args()

    entries = json.loads(MANIFEST.read_text(encoding="utf-8"))
    result = {}
    for e in entries:
        print(e["slug"])
        images = process(e, args.solo, args.descargar)
        if images:
            result[e["slug"]] = {"reloj": e["reloj"], "marca": e["marca"], "imagenes": images}
    if not args.solo:
        (OUT / "manifest.json").write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
        write_sources_doc(entries)
        print(f"\nmanifest.json y docs/IMAGE-SOURCES.md actualizados ({len(result)} relojes)")


if __name__ == "__main__":
    main()
