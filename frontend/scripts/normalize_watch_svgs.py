from pathlib import Path
import re
import shutil

SRC_DIR = Path(__file__).resolve().parents[1] / "public" / "images" / "relojes"
ORIG_DIR = SRC_DIR / "original"

FRAME_RE = re.compile(
    r'\s*<rect x="8" y="8" width="484" height="484" fill="none" stroke="#212328" stroke-width="1" />\s*',
    re.IGNORECASE,
)
CAPTION_RE = re.compile(
    r'\s*<text x="250" y="482"[^>]*>.*?</text>\s*',
    re.IGNORECASE | re.DOTALL,
)


def main() -> None:
    ORIG_DIR.mkdir(exist_ok=True)
    updated = 0
    for svg in sorted(SRC_DIR.glob("*.svg")):
        if svg.name == "placeholder-reloj.svg":
            continue
        dest = ORIG_DIR / svg.name
        if not dest.exists():
            shutil.copy2(svg, dest)
        text = svg.read_text(encoding="utf-8")
        new = FRAME_RE.sub("\n", text)
        new = CAPTION_RE.sub("\n", new)
        new = new.replace('stop-color="#1B1D22"', 'stop-color="#F7F5F0"')
        new = new.replace('stop-color="#111214"', 'stop-color="#FAF9F6"')
        if new != text:
            svg.write_text(new, encoding="utf-8")
            updated += 1
            print(f"updated {svg.name}")
        else:
            print(f"unchanged {svg.name}")
    print(f"total {updated}")


if __name__ == "__main__":
    main()
