#!/usr/bin/env bash
# Installs the water-reminder launchd agent (runs the popup every hour).
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_PATH="$DIR/reminder_popup.py"
PLIST_SRC="$DIR/com.harsha.waterreminder.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.harsha.waterreminder.plist"

mkdir -p "$HOME/Library/LaunchAgents"
sed "s#__SCRIPT_PATH__#$SCRIPT_PATH#" "$PLIST_SRC" > "$PLIST_DEST"

launchctl unload "$PLIST_DEST" 2>/dev/null || true
launchctl load "$PLIST_DEST"

echo "Installed. Water break popup will show every hour."
echo "To test immediately: launchctl start com.harsha.waterreminder"
echo "To uninstall: ./uninstall.sh"
