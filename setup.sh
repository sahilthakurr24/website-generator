#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd -- "$(dirname -- "$0")" && pwd)"
root_env="$repo_root/.env"

if [ ! -f "$root_env" ]; then
  if [ -f "$repo_root/.env.example" ]; then
    cp "$repo_root/.env.example" "$root_env"
    echo "Created root .env from .env.example."
  else
    echo "Missing root .env and .env.example; cannot create workspace links." >&2
    exit 1
  fi
fi

for dir in "$repo_root"/apps/* "$repo_root"/packages/*; do
  [ -d "$dir" ] || continue

  target="$dir/.env"
  if [ -L "$target" ]; then
    rm "$target"
  elif [ -e "$target" ]; then
    echo "Skipping $target: it is not a symbolic link." >&2
    continue
  fi

  ln -s "$root_env" "$target"
  echo "Linked $target -> $root_env"
done
