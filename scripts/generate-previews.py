from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
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
SOURCE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}


@dataclass(frozen=True)
class PreviewJob:
    source: Path
    target: Path
    size: tuple[int, int]


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


def preview_job_for(asset_path: str, asset_kind: str) -> PreviewJob | None:
    if not asset_path.startswith("/systems/"):
        return None
    source = PUBLIC / asset_path.lstrip("/")
    if (
        not source.exists()
        or source.parent.name == "previews"
        or source.suffix.lower() not in SOURCE_SUFFIXES
    ):
        return None
    target = source.parent / "previews" / f"{source.stem}.webp"
    return PreviewJob(source=source, target=target, size=preview_size(asset_path, asset_kind))


def preview_is_current(job: PreviewJob) -> bool:
    if not job.target.exists():
        return False

    source_stat = job.source.stat()
    target_stat = job.target.stat()
    if target_stat.st_size == 0 or target_stat.st_mtime < source_stat.st_mtime:
        return False

    try:
        with Image.open(job.target) as image:
            image.load()
            width, height = image.size
            image_format = image.format
    except OSError:
        return False

    return (
        image_format == "WEBP"
        and 0 < width <= job.size[0]
        and 0 < height <= job.size[1]
    )


def save_preview(job: PreviewJob, *, dry_run: bool, force: bool) -> str:
    if not force and preview_is_current(job):
        return "skipped"

    if dry_run:
        return "would_generate"

    job.target.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(job.source) as image:
        image = ImageOps.exif_transpose(image)
        image.thumbnail(job.size, Image.Resampling.LANCZOS)
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        image.save(job.target, "WEBP", quality=72, method=6)
    return "generated"


def iter_preview_jobs() -> list[PreviewJob]:
    systems = json.loads(SYSTEMS_JSON.read_text())
    jobs: list[PreviewJob] = []
    for system in systems:
        assets = system.get("assets", {})
        for key in ("motif", "board", "darkBoard", "hero", "texture"):
            asset_path = assets.get(key)
            if asset_path:
                job = preview_job_for(asset_path, key)
                if job is not None:
                    jobs.append(job)
        for example in assets.get("examples", []):
            asset_path = example.get("image")
            if asset_path:
                job = preview_job_for(asset_path, "example")
                if job is not None:
                    jobs.append(job)
    return jobs


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate webp previews for system assets.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report how many previews would be generated without writing files.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate previews even when existing previews are current.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    counts = {"generated": 0, "skipped": 0, "would_generate": 0}
    seen_targets: set[Path] = set()
    duplicates = 0

    for job in iter_preview_jobs():
        if job.target in seen_targets:
            duplicates += 1
            continue
        seen_targets.add(job.target)
        counts[save_preview(job, dry_run=args.dry_run, force=args.force)] += 1

    if args.dry_run:
        message = (
            f"Would generate {counts['would_generate']} preview images; "
            f"skipped {counts['skipped']} current previews"
        )
    else:
        message = (
            f"Generated {counts['generated']} preview images; "
            f"skipped {counts['skipped']} current previews"
        )
    if duplicates:
        message += f"; deduplicated {duplicates} repeated asset references"
    print(f"{message}.")


if __name__ == "__main__":
    main()
