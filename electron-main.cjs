// Electron Main Process for LightVideo Editor (Windows 10 64-bit Target)
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

// Crucial low-memory flags for 4GB RAM PCs
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=1536');
app.commandLine.appendSwitch('disable-gpu-memory-buffer-compositor-resources');
app.commandLine.appendSwitch('enable-low-end-device-mode');
app.commandLine.appendSwitch('renderer-process-limit', '1');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 768,
    minWidth: 960,
    minHeight: 580,
    title: 'LightVideo Editor',
    backgroundColor: '#0a0a0a',
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      backgroundThrottling: false,
    },
  });

  // Remove default menu to use in-app custom modern menu
  Menu.setApplicationMenu(null);

  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, 'dist', 'index.html')}`;
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
