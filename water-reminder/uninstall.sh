#!/usr/bin/env bash
# Removes the water-reminder launchd agent.
set -euo pipefail

PLIST_DEST="$HOME/Library/LaunchAgents/com.harsha.waterreminder.plist"

if [ -f "$PLIST_DEST" ]; then
    launchctl unload "$PLIST_DEST" 2>/dev/null || true
    rm "$PLIST_DEST"
    echo "Uninstalled."
else
    echo "Not installed."
fi
