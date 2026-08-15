// Pink Whale 🐳 — preload: expose window controls & DSH check to the renderer
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('whaleWindow', {
  minimize: () => ipcRenderer.send('win:minimize'),
  maximize: () => ipcRenderer.send('win:maximize'),
  close: () => ipcRenderer.send('win:close'),
  onMaximized: (cb) => ipcRenderer.on('win:maximized', (_e, v) => cb(v)),
  checkDsh: () => ipcRenderer.invoke('dsh:check'),
  runDiag: () => ipcRenderer.send('diag:run')
});
