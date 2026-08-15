// Pink Whale 🐳 — Electron main process (frameless window + DSH loader)
const { app, BrowserWindow, ipcMain } = require('electron');
const net = require('net');
const path = require('path');
const fs = require('fs');

const DSH_URL = 'http://127.0.0.1:3080';
const DSH_PORT = 3080;

// Pink Whale 主题（注入到 DSH 页面）
const THEME_CSS = fs.readFileSync(path.join(__dirname, 'theme.css'), 'utf8');

// ---- 端口检测 ----
function checkDshPort() {
  return new Promise((resolve) => {
    const sock = net.connect({ host: '127.0.0.1', port: DSH_PORT, timeout: 1500 });
    sock.once('connect', () => { sock.destroy(); resolve(true); });
    sock.once('error', () => resolve(false));
    sock.once('timeout', () => { sock.destroy(); resolve(false); });
  });
}

// ---- 主题注入：把 theme.css 注入到 DSH 的 iframe frame ----
const DIAG_JS = fs.readFileSync(path.join(__dirname, 'diag.js'), 'utf8');

async function injectTheme(contents) {
  try {
    const main = contents.mainFrame;
    if (!main) return;
    const frames = [main, ...main.frames];
    for (const f of frames) {
      if (f.url.startsWith(DSH_URL)) {
        // 注入主题
        await f.executeJavaScript(`(() => {
          let s = document.getElementById('__whale_theme__');
          if (!s) {
            s = document.createElement('style');
            s.id = '__whale_theme__';
            document.head.appendChild(s);
          }
          s.textContent = ${JSON.stringify(THEME_CSS)};
        })()`);
      }
    }
  } catch (e) {
    console.error('theme inject failed:', e);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 780,
    minWidth: 800,
    minHeight: 560,
    title: '🎀',
    frame: false,                     // 无边框：标题栏由页面自绘
    backgroundColor: '#FFD9E5',       // 粉色底；外层圆角交给 Windows 系统圆角
    icon: path.join(__dirname, 'pink_whale.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // 最大化时通知页面收起圆角
  win.on('maximize', () => win.webContents.send('win:maximized', true));
  win.on('unmaximize', () => win.webContents.send('win:maximized', false));

  // DSH iframe 每次加载完成都注入主题
  win.webContents.on('did-frame-finish-load', () => injectTheme(win.webContents));

  win.loadFile('index.html');
}

// ---- IPC ----
function winOf(event) {
  return BrowserWindow.fromWebContents(event.sender);
}

ipcMain.handle('dsh:check', () => checkDshPort());
ipcMain.on('win:minimize', (e) => winOf(e)?.minimize());
ipcMain.on('win:maximize', (e) => {
  const w = winOf(e);
  if (!w) return;
  w.isMaximized() ? w.unmaximize() : w.maximize();
});
ipcMain.on('win:close', (e) => winOf(e)?.close());

// 手动触发诊断（抓取 DSH 当前 DOM 结构）
ipcMain.on('diag:run', async (e) => {
  const w = winOf(e);
  if (!w) return;
  try {
    const main = w.webContents.mainFrame;
    if (!main) return;
    for (const f of [main, ...main.frames]) {
      if (f.url.startsWith(DSH_URL)) {
        const info = await f.executeJavaScript(DIAG_JS);
        console.log('[whale-diag]', info);
      }
    }
  } catch (err) {
    console.error('[whale-diag] failed:', String(err));
  }
});

// ---- 单实例：重复启动时关掉旧实例，聚焦已有窗口 ----
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const w = BrowserWindow.getAllWindows()[0];
    if (w) {
      if (w.isMinimized()) w.restore();
      w.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
