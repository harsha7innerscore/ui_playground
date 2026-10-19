# water-reminder

Hourly desktop toast (macOS) reminding to drink water. Neo-from-Matrix comic panels, animated, bottom-left corner, auto-vanishes after 5s.

## Tech stack
- Python 3 + Pillow + tkinter, run from a project-local venv at `.venv` (gitignored)
- **Must use `/opt/homebrew/bin/python3.12` (or any Python built against Tk 8.6+) to create the venv.** The system `/usr/bin/python3` is tied to Tcl/Tk 8.5, which renders images as solid black on current macOS — this was a real bug hit during development, not a hypothetical. `brew install python-tk@3.12` provides modern Tk (9.1 at time of writing).
- launchd for scheduling (no cron/background daemon process)

## Dev commands
- Run toast once: `./.venv/bin/python3 reminder_popup.py`
- Install hourly schedule (creates `.venv` if missing): `./install.sh`
- Remove hourly schedule: `./uninstall.sh`
- Force a test popup after installing: `launchctl start com.harsha.waterreminder`
- Logs: `/tmp/water-reminder.log`, `/tmp/water-reminder.err.log`

## Architecture
- `assets/panel_1.png` … `panel_6.png` — the 6 panels extracted from the user's own comic strip, cropped at the comic's own gutters. (`assets/water_break.gif` also kept for reference/sharing, but the app does NOT decode it — see Notes.)
- `reminder_popup.py` — single-file tkinter app: borderless (`overrideredirect`) always-on-top window, bottom-left corner, cycles the 6 panel images, self-destroys after 5s or on click.
- `com.harsha.waterreminder.plist` — launchd agent template (`StartInterval=3600`, placeholders `__PYTHON_PATH__`/`__SCRIPT_PATH__`); `install.sh` substitutes both (pointing at `.venv/bin/python3`) and loads it into `~/Library/LaunchAgents`.

## Notes
- macOS only (launchd + tkinter window chrome). No external network calls, no secrets.
- Do not switch the app back to decoding `assets/water_break.gif` at runtime: it was saved with Pillow's `optimize=True`, which frame-diffs GIF frames: naive `Image.seek()`/`convert("RGBA")` decoding (no disposal-method compositing) renders most frames as garbage/black. Loading the PNG panels directly (current approach) sidesteps this entirely.
- Regenerating assets from the source comic: see `assets/panel_*.png` crop boundaries in git history / ask to re-run extraction if the source image changes.
