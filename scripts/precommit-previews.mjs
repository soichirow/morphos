import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const SYSTEMS_DIR = path.join(ROOT, "public", "systems");
const dryRun = process.argv.includes("--dry-run");

function toRepoPath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function snapshotPreviews(dir = SYSTEMS_DIR, snapshot = new Map()) {
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") {
      return snapshot;
    }
    throw error;
  }

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      snapshotPreviews(entryPath, snapshot);
      continue;
    }

    if (
      entry.isFile() &&
      entryPath.endsWith(".webp") &&
      entryPath.includes(`${path.sep}previews${path.sep}`)
    ) {
      const stats = statSync(entryPath, { bigint: true });
      snapshot.set(toRepoPath(entryPath), `${stats.size}:${stats.mtimeNs}`);
    }
  }

  return snapshot;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: options.stdio ?? "pipe",
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

function changedPaths(before, after) {
  return [...after]
    .filter(([repoPath, signature]) => before.get(repoPath) !== signature)
    .map(([repoPath]) => repoPath);
}

function unstagedPaths(paths) {
  if (paths.length === 0) {
    return [];
  }

  const result = run("git", ["status", "--porcelain=v1", "--", ...paths]);
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  return result.stdout
    .split("\n")
    .filter(Boolean)
    .filter((line) => line.startsWith("??") || line[1] !== " ")
    .map((line) => line.slice(3));
}

const before = dryRun ? new Map() : snapshotPreviews();
const previewArgs = dryRun
  ? ["run", "generate:previews", "--", "--dry-run"]
  : ["run", "generate:previews"];
const previews = run("bun", previewArgs, { stdio: "inherit" });
if (previews.status !== 0) {
  process.exit(previews.status ?? 1);
}

if (dryRun) {
  process.exit(0);
}

const after = snapshotPreviews();
const generatedPaths = changedPaths(before, after);
const unstagedGeneratedPaths = unstagedPaths(generatedPaths);

if (unstagedGeneratedPaths.length > 0) {
  const shownPaths = unstagedGeneratedPaths.slice(0, 20);
  process.stderr.write(
    [
      "",
      "Preview generation updated files that are not staged.",
      "Stage these generated previews and retry the commit:",
      ...shownPaths.map((repoPath) => `  ${repoPath}`),
      unstagedGeneratedPaths.length > shownPaths.length
        ? `  ...and ${unstagedGeneratedPaths.length - shownPaths.length} more`
        : "",
      "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  process.stderr.write("\n");
  process.exit(1);
}
