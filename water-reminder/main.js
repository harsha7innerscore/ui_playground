const { app, BrowserWindow, Tray, Menu, screen, ipcMain, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");

const CONFIG_PATH = path.join(app.getPath("userData"), "config.json");
const INTERVAL_OPTIONS = [15, 30, 45, 60, 90];
const DEFAULT_CONFIG = {
  name: "",
  intervalMin: 60,
  activeStartHour: 8,
  activeEndHour: 22,
  snoozeMin: 10,
  paused: false,
  onboarded: false,
};

const GREETING = (name) => `The Matrix wants you${name ? ", " + name : ""} to drink water.`;

const CHEERS = [
  "Whoa. Hydration achieved.",
  "I know kung fu. And proper hydration.",
  "There is no spoon. There is only water, and you just drank it.",
  "Neo approves.",
  "Free your mind. Refill your bottle.",
];

function loadConfig() {
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig() {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

let config = loadConfig();
let reminderWin = null;
let settingsWin = null;
let scheduleTimer = null;
let tray = null;

function isActiveNow(date = new Date()) {
  const h = date.getHours();
  return h >= config.activeStartHour && h < config.activeEndHour;
}

function msUntilActiveStart(from = new Date()) {
  const next = new Date(from);
  next.setHours(config.activeStartHour, 0, 0, 0);
  if (next <= from) next.setDate(next.getDate() + 1);
  return next.getTime() - from.getTime();
}

function scheduleNext(delayMs) {
  clearTimeout(scheduleTimer);
  if (config.paused) return;
  scheduleTimer = setTimeout(fireCheck, delayMs);
}

function fireCheck() {
  if (config.paused) return;
  if (!isActiveNow()) {
    scheduleTimer = setTimeout(fireCheck, msUntilActiveStart());
    return;
  }
  showReminder();
}

function createReminderWindow() {
  reminderWin = new BrowserWindow({
    width: 230,
    height: 420,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "renderer", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  reminderWin.loadFile(path.join(__dirname, "renderer", "index.html"));
  reminderWin.on("closed", () => {
    reminderWin = null;
  });
}

function positionReminderWindow() {
  const { workArea } = screen.getPrimaryDisplay();
  const [w, h] = reminderWin.getSize();
  reminderWin.setPosition(workArea.x + 20, workArea.y + workArea.height - h - 20);
}

function showReminder() {
  if (!reminderWin) createReminderWindow();
  if (reminderWin.isVisible()) return;
  positionReminderWindow();
  const send = () =>
    reminderWin.webContents.send("reminder", {
      greeting: GREETING(config.name),
      snoozeMin: config.snoozeMin,
    });
  if (reminderWin.webContents.isLoading()) {
    reminderWin.webContents.once("did-finish-load", send);
  } else {
    send();
  }
  reminderWin.show();
}

function buildTrayMenu() {
  const template = [
    { label: "Drink now", click: () => showReminder() },
    { type: "separator" },
    {
      label: "Reminder interval",
      submenu: [
        ...INTERVAL_OPTIONS.map((min) => ({
          label: `${min} min`,
          type: "radio",
          checked: config.intervalMin === min,
          click: () => {
            config.intervalMin = min;
            saveConfig();
            scheduleNext(config.intervalMin * 60000);
            buildTrayMenu();
          },
        })),
        {
          label: "Custom…",
          type: "radio",
          checked: !INTERVAL_OPTIONS.includes(config.intervalMin),
          click: () => openSettingsWindow(),
        },
      ],
    },
    { label: "Settings…", click: () => openSettingsWindow() },
    { type: "separator" },
    {
      label: "Pause reminders",
      type: "checkbox",
      checked: config.paused,
      click: (item) => {
        config.paused = item.checked;
        saveConfig();
        if (config.paused) {
          clearTimeout(scheduleTimer);
        } else {
          scheduleNext(config.intervalMin * 60000);
        }
      },
    },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ];
  tray.setContextMenu(Menu.buildFromTemplate(template));
}

function openSettingsWindow(onboarding = false) {
  if (settingsWin) {
    settingsWin.focus();
    return;
  }
  settingsWin = new BrowserWindow({
    width: 380,
    height: 460,
    resizable: false,
    show: false,
    title: onboarding ? "Welcome" : "Water Reminder Settings",
    webPreferences: {
      preload: path.join(__dirname, "renderer", "settings-preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  settingsWin.setMenuBarVisibility(false);
  settingsWin.loadFile(path.join(__dirname, "renderer", "settings.html"), {
    query: { onboarding: onboarding ? "1" : "0" },
  });
  settingsWin.once("ready-to-show", () => {
    app.focus({ steal: true });
    settingsWin.show();
    settingsWin.moveTop();
    settingsWin.focus();
  });
  settingsWin.on("closed", () => {
    settingsWin = null;
  });
}

ipcMain.handle("settings:get", () => config);

ipcMain.on("settings:save", (_e, data) => {
  const firstRun = !config.onboarded;
  config = {
    ...config,
    name: String(data.name || "").trim().slice(0, 40),
    intervalMin: Math.min(720, Math.max(1, parseInt(data.intervalMin, 10) || config.intervalMin)),
    activeStartHour: Math.min(23, Math.max(0, parseInt(data.activeStartHour, 10) || 0)),
    activeEndHour: Math.min(24, Math.max(1, parseInt(data.activeEndHour, 10) || 24)),
    snoozeMin: Math.min(120, Math.max(1, parseInt(data.snoozeMin, 10) || config.snoozeMin)),
    onboarded: true,
  };
  saveConfig();
  buildTrayMenu();
  scheduleNext(firstRun ? 5000 : config.intervalMin * 60000);
  if (settingsWin) settingsWin.close();
});

ipcMain.on("drank", () => scheduleNext(config.intervalMin * 60000));
ipcMain.on("snoozed", () => scheduleNext(config.snoozeMin * 60000));
ipcMain.on("dismissed", () => scheduleNext(config.intervalMin * 60000));
ipcMain.on("hide-reminder", () => {
  if (reminderWin) reminderWin.hide();
});
ipcMain.handle("get-cheer", () => pick(CHEERS));

app.on("window-all-closed", (e) => {
  e.preventDefault();
});

app.whenReady().then(() => {
  if (process.platform === "darwin" && app.dock) app.dock.hide();

  const trayIcon = nativeImage.createFromPath(path.join(__dirname, "assets", "tray-icon.png")).resize({ width: 18, height: 18 });
  trayIcon.setTemplateImage(true);
  tray = new Tray(trayIcon);
  tray.setToolTip("Water Reminder");
  buildTrayMenu();

  if (!config.onboarded) {
    openSettingsWindow(true);
  } else {
    scheduleNext(5000);
  }
});

app.on("before-quit", () => {
  clearTimeout(scheduleTimer);
});
