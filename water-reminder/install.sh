#!/usr/bin/env bash
# Installs the water-reminder launchd agent (runs the popup every hour).
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_PATH="$DIR/reminder_popup.py"
PLIST_SRC="$DIR/com.harsha.waterreminder.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.harsha.waterreminder.plist"

if [ ! -x "$DIR/.venv/bin/python3" ]; then
    echo "Setting up virtualenv (system Tk is too old to render images on this macOS)..."
    /opt/homebrew/bin/python3.12 -m venv "$DIR/.venv"
    "$DIR/.venv/bin/pip" install --quiet --upgrade pip Pillow
fi
PYTHON_PATH="$DIR/.venv/bin/python3"

mkdir -p "$HOME/Library/LaunchAgents"
sed -e "s#__SCRIPT_PATH__#$SCRIPT_PATH#" -e "s#__PYTHON_PATH__#$PYTHON_PATH#" "$PLIST_SRC" > "$PLIST_DEST"

launchctl unload "$PLIST_DEST" 2>/dev/null || true
launchctl load "$PLIST_DEST"

echo "Installed. Water break popup will show every hour."
echo "To test immediately: launchctl start com.harsha.waterreminder"
echo "To uninstall: ./uninstall.sh"
