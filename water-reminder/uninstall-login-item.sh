#!/usr/bin/env bash
# Stops water-reminder from starting automatically at login.
set -euo pipefail

PLIST_DEST="$HOME/Library/LaunchAgents/com.harsha.waterreminder.plist"

if [ -f "$PLIST_DEST" ]; then
    launchctl unload "$PLIST_DEST" 2>/dev/null || true
    rm "$PLIST_DEST"
    echo "Uninstalled. It will no longer start automatically at login."
    echo "(If it's currently running, quit it from its tray menu.)"
else
    echo "Not installed."
fi
