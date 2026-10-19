# water-reminder

Neo, from the Matrix, lives in your menu bar and walks in from the bottom-left corner to remind you to drink water. Modeled on [hydrate-buddy](https://github.com/sharada-dev/hydrate-buddy).

## Setup

```bash
nvm use
npm install
npm start
```

First launch opens a small "Welcome. I am Neo." window — set your name (optional), how often you want reminders, your active hours, and snooze length. After that he lives quietly in the menu bar (droplet icon).

## Using it

- Right-click the droplet in the menu bar: **Drink now**, **Reminder interval** (quick 15/30/45/60/90 or Custom via Settings), **Settings…**, **Pause reminders**, **Quit**.
- When he walks in: **YES, I DRANK** swaps his pose, shows a cheer line, confetti, then he walks off (and the next reminder is scheduled `interval` minutes out). **SNOOZE** walks him off immediately and brings him back in `snooze` minutes.
- Reminders only fire during your configured active hours.

## Run all the time, automatically (macOS)

```bash
./install-login-item.sh
```

Installs a LaunchAgent that starts the app immediately and again every time you log in — no need to run `npm start` yourself again. It runs the compiled Electron binary directly (not through `npm`/`nvm`), so it works the same whether a terminal is open or not.

Quit it anytime from its tray menu; it won't restart until your next login. To stop it from auto-starting at login entirely:

```bash
./uninstall-login-item.sh
```

Logs: `/tmp/water-reminder.log`, `/tmp/water-reminder.err.log`.

## Assets

`assets/idle.png` / `assets/drinking.png` are Neo sprites with transparent backgrounds, cut from the user's own comic panels (`assets/source/`) by `scripts/make_sprite.py`. Re-run it if you swap in new source art:

```bash
python3 scripts/make_sprite.py <source.png> <output.png> [pixels-to-crop-off-bottom]
```
