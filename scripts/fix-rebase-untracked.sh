#!/usr/bin/env bash
set -euo pipefail

# Helper script to abort an in-progress rebase, move a blocking untracked file to a backup folder,
# and then run git pull origin main --rebase.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

FILE="${1:-imagens/aparador_jatobá.png}"
BACKUP_DIR="${HOME}/biome_backup"

echo "Repo root: $REPO_ROOT"
echo "Target file: $FILE"
echo "Backup dir: $BACKUP_DIR"

# Verify we're in a git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: not a git repository. Run this script from inside the repo or place it under the repo/scripts folder."
  exit 1
fi

GIT_DIR="$(git rev-parse --git-dir)"

# If a rebase is in progress, abort it
if [ -d "$GIT_DIR/rebase-apply" ] || [ -d "$GIT_DIR/rebase-merge" ]; then
  echo "Rebase in progress — aborting rebase..."
  git rebase --abort || true
fi

# Backup the blocking file if it exists
if [ -e "$FILE" ]; then
  mkdir -p "$BACKUP_DIR"
  echo "Moving '$FILE' to '$BACKUP_DIR'"
  mv -v "$FILE" "$BACKUP_DIR/" || { echo "Failed to move $FILE"; exit 1; }
else
  echo "File '$FILE' not found — nothing to move."
fi

# Perform pull --rebase
echo "Running: git pull origin main --rebase"
if git pull origin main --rebase; then
  echo "Pull succeeded."
  echo "If you need to restore the backed-up file, check: $BACKUP_DIR"
else
  echo "git pull failed. Inspect output above and run 'git status'/'git rebase --continue' as needed."
  exit 1
fi