from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SYSTEMS_JSON = ROOT / "src" / "data" / "systems.json"

BOARD_SIZE = (1280, 720)
MOTIF_SIZE = (640, 640)
HERO_SIZE = (960, 540)
TEXTURE_SIZE = (512, 512)
EXAMPLE_SIZE = (960, 540)


def output_path_for(asset_path: str) -> Path | None:
    if not asset_path.startswith("/systems/"):
        return None
    source = PUBLIC / asset_path.lstrip("/")
    if not source.exists() or source.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
        return None
    return source.parent / "previews" / f"{source.stem}.webp"


def preview_size(asset_path: str, asset_kind: str) -> tuple[int, int]:
    name = Path(asset_path).name
    if asset_kind == "motif" or name in {"motif.png", "animal.png"}:
        return MOTIF_SIZE
    if asset_kind in {"board", "darkBoard"} or "design-system" in name:
        return BOARD_SIZE
    if asset_kind == "texture":
        return TEXTURE_SIZE
    if asset_kind == "hero":
        return HERO_SIZE
    return EXAMPLE_SIZE


def save_preview(asset_path: str, asset_kind: str) -> bool:
    target = output_path_for(asset_path)
    if target is None:
        return False

    source = PUBLIC / asset_path.lstrip("/")
    target.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        image.thumbnail(preview_size(asset_path, asset_kind), Image.Resampling.LANCZOS)
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        image.save(target, "WEBP", quality=72, method=6)
    return True


def main() -> None:
    systems = json.loads(SYSTEMS_JSON.read_text())
    written = 0
    for system in systems:
        assets = system.get("assets", {})
        for key in ("motif", "board", "darkBoard", "hero", "texture"):
            asset_path = assets.get(key)
            if asset_path and save_preview(asset_path, key):
                written += 1
        for example in assets.get("examples", []):
            asset_path = example.get("image")
            if asset_path and save_preview(asset_path, "example"):
                written += 1
    print(f"Generated {written} preview images.")


if __name__ == "__main__":
    main()
