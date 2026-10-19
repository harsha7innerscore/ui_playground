# water-reminder

Hourly popup telling you to drink water, starring Neo.

## Setup

```bash
cd water-reminder
./install.sh
```

Runs every hour from then on, even across reboots (launchd). Test it immediately:

```bash
launchctl start com.harsha.waterreminder
```

## Uninstall

```bash
./uninstall.sh
```

## What it looks like

A small borderless toast in the bottom-left corner, cycling through 6 frames of the "drink some water" comic. Disappears on its own after 5 seconds (or click it to dismiss early).

## Requirement

Needs `brew install python-tk@3.12` once (system Python's Tk is too old to render images on modern macOS). `install.sh` sets up its own venv automatically.
