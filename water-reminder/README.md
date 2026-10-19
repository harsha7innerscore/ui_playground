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

An always-on-top window centered on screen, cycling through 6 frames of the "drink some water" comic, with a "Got it, drinking now" button. Closes itself after 60s if ignored.
