const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  onReminder: (cb) => ipcRenderer.on("reminder", (_e, data) => cb(data)),
  drank: () => ipcRenderer.send("drank"),
  snooze: () => ipcRenderer.send("snoozed"),
  dismiss: () => ipcRenderer.send("dismissed"),
  hide: () => ipcRenderer.send("hide-reminder"),
  getCheer: () => ipcRenderer.invoke("get-cheer"),
});
