#!/usr/bin/env bash
# Start Next automatically on each Codespace start, without creating duplicates.

set -uo pipefail

pid_file="/tmp/ai-coding-workshop-next.pid"
log_file="/tmp/ai-coding-workshop-next.log"

if [ -s "${pid_file}" ]; then
  existing_pid="$(cat "${pid_file}")"
  if kill -0 "${existing_pid}" 2>/dev/null; then
    exit 0
  fi
fi

nohup npm run dev -- --hostname 0.0.0.0 > "${log_file}" 2>&1 &
printf '%s\n' "$!" > "${pid_file}"

echo "Workshop app is starting (log: ${log_file})"
