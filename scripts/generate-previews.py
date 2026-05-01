from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SYSTEMS_JSON = ROOT / "src" / "data" / "systems.json"

SOURCE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}

PRIMARY_SIZES: dict[str, tuple[int, int]] = {
    "motif": (640, 640),
    "board": (1280, 720),
    "hero": (960, 540),
    "texture": (512, 512),
    "example": (960, 540),
}

# Width-only secondary tier; height scales by aspect via Image.thumbnail.
SMALL_WIDTHS: dict[str, int] = {
    "motif": 360,
    "board": 720,
}

FORMATS: tuple[str, ...] = ("webp", "avif")

WEBP_OPTIONS = {"quality": 72, "method": 6}
AVIF_OPTIONS = {"quality": 55, "speed": 4}

PIL_FORMAT_NAMES = {"webp": "WEBP", "avif": "AVIF"}


@dataclass(frozen=True)
class PreviewJob:
    source: Path
    target: Path
    size: tuple[int, int]
    format: str  # "webp" | "avif"


def normalize_kind(asset_path: str, asset_kind: str) -> str:
    name = Path(asset_path).name
    if asset_kind == "motif" or name in {"motif.png", "animal.png"}:
        return "motif"
    if asset_kind in {"board", "darkBoard"} or "design-system" in name:
        return "board"
    if asset_kind == "texture":
        return "texture"
    if asset_kind == "hero":
        return "hero"
    return "example"


def small_size_for(kind: str, primary: tuple[int, int]) -> tuple[int, int] | None:
    width = SMALL_WIDTHS.get(kind)
    if width is None or width >= primary[0]:
        return None
    height = max(1, round(primary[1] * width / primary[0]))
    return (width, height)


def jobs_for(asset_path: str, asset_kind: str) -> list[PreviewJob]:
    if not asset_path.startswith("/systems/"):
        return []
    source = PUBLIC / asset_path.lstrip("/")
    if (
        not source.exists()
        or source.parent.name == "previews"
        or source.suffix.lower() not in SOURCE_SUFFIXES
    ):
        return []

    kind = normalize_kind(asset_path, asset_kind)
    primary = PRIMARY_SIZES[kind]
    small = small_size_for(kind, primary)
    previews_dir = source.parent / "previews"
    stem = source.stem

    jobs: list[PreviewJob] = []
    for fmt in FORMATS:
        jobs.append(
            PreviewJob(
                source=source,
                target=previews_dir / f"{stem}.{fmt}",
                size=primary,
                format=fmt,
            )
        )
        if small is not None:
            jobs.append(
                PreviewJob(
                    source=source,
                    target=previews_dir / f"{stem}-{small[0]}.{fmt}",
                    size=small,
                    format=fmt,
                )
            )
    return jobs


def preview_is_current(job: PreviewJob) -> bool:
    if not job.target.exists():
        return False

    source_stat = job.source.stat()
    target_stat = job.target.stat()
    if target_stat.st_size == 0 or target_stat.st_mtime < source_stat.st_mtime:
        return False

    expected_format = PIL_FORMAT_NAMES[job.format]
    try:
        with Image.open(job.target) as image:
            image.load()
            width, height = image.size
            image_format = image.format
    except OSError:
        return False

    return (
        image_format == expected_format
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
        if job.format == "webp":
            image.save(job.target, "WEBP", **WEBP_OPTIONS)
        elif job.format == "avif":
            # libavif requires RGB/RGBA; alpha is preserved when present.
            image.save(job.target, "AVIF", **AVIF_OPTIONS)
        else:
            raise ValueError(f"Unsupported format: {job.format}")
    return "generated"


def iter_preview_jobs() -> list[PreviewJob]:
    systems = json.loads(SYSTEMS_JSON.read_text())
    jobs: list[PreviewJob] = []
    for system in systems:
        assets = system.get("assets", {})
        for key in ("motif", "board", "darkBoard", "hero", "texture"):
            asset_path = assets.get(key)
            if asset_path:
                jobs.extend(jobs_for(asset_path, key))
        for example in assets.get("examples", []):
            asset_path = example.get("image")
            if asset_path:
                jobs.extend(jobs_for(asset_path, "example"))
    return jobs


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate webp + avif previews for system assets.")
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
