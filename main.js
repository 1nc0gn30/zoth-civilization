const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const { startServer } = require('./server');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('enable-transparent-visuals');

let mainWindow = null;

async function createWindow() {
  await startServer();

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1500, Math.floor(width * 0.95)),
    height: Math.min(960, Math.floor(height * 0.92)),
    backgroundColor: '#08090C',
    title: 'ZOTH CIVILIZATION — 21-Agent Sovereign Ecosystem & Adytum Path',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[WebConsole:${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.loadURL('http://localhost:9393');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('render-process-gone', (event, detailed) => {
    console.log('[Electron] render-process-gone:', JSON.stringify(detailed));
  });

  mainWindow.webContents.on('unresponsive', () => {
    console.log('[Electron] webContents unresponsive');
  });

  mainWindow.on('close', () => {
    console.log('[Electron] mainWindow close event received.');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
