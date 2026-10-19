# water-reminder

Hourly desktop popup (macOS) reminding to drink water. Neo-from-Matrix comic panels, animated.

## Tech stack
- Python 3 (system `/usr/bin/python3`, 3.9) + Pillow (Tk-based GUI, no Node/web stack)
- tkinter for the popup window, launchd for scheduling (no cron/background daemon process)

## Dev commands
- Run popup once: `python3 reminder_popup.py`
- Install hourly schedule: `./install.sh`
- Remove hourly schedule: `./uninstall.sh`
- Force a test popup after installing: `launchctl start com.harsha.waterreminder`
- Logs: `/tmp/water-reminder.log`, `/tmp/water-reminder.err.log`

## Architecture
- `assets/water_break.gif` — 6-frame animated GIF extracted from the user's own comic strip (`assets/panel_1.png` … `panel_6.png`), cropped at the comic's own gutters.
- `reminder_popup.py` — single-file tkinter app: loads the GIF, shows an always-on-top centered window, auto-closes after 60s or on button/Escape.
- `com.harsha.waterreminder.plist` — launchd agent template (`StartInterval=3600`); `install.sh` substitutes the absolute script path and loads it into `~/Library/LaunchAgents`.

## Notes
- macOS only (launchd + tkinter window chrome). No external network calls, no secrets.
- Regenerating the GIF from the source comic: see `assets/panel_*.png` crop boundaries in git history / ask to re-run extraction if the source image changes.
