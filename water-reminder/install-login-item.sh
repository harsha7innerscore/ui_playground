#!/usr/bin/env bash
# Installs water-reminder as a macOS LaunchAgent so it starts automatically at
# login and keeps running in the menu bar, with no manual `npm start` needed.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ELECTRON_BIN="$DIR/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron"
PLIST_SRC="$DIR/com.harsha.waterreminder.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.harsha.waterreminder.plist"

if [ ! -x "$ELECTRON_BIN" ]; then
    echo "Electron isn't installed yet. Run this first:"
    echo "  nvm use 18.20.4 && npm install"
    exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents"
sed -e "s#__ELECTRON_BIN__#$ELECTRON_BIN#" -e "s#__APP_DIR__#$DIR#" "$PLIST_SRC" > "$PLIST_DEST"

launchctl unload "$PLIST_DEST" 2>/dev/null || true
launchctl load "$PLIST_DEST"

echo "Installed. water-reminder will now start automatically at login and is starting now."
echo "Look for the droplet icon in your menu bar."
echo "To stop it running at login: ./uninstall-login-item.sh"
