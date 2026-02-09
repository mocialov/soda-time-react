const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const TorrentService = require('./torrent-service.cjs');

let mainWindow;
let torrentService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 520,
    frame: false,
    backgroundColor: '#1f1f1f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, 'icon.png')
  });

  // Initialize torrent service
  torrentService = new TorrentService();

  // In development, load from Vite dev server
  // In production, load from built files
  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  mainWindow.on('closed', () => {
    if (torrentService) {
      torrentService.cleanup();
    }
    mainWindow = null;
  });
}

// IPC handlers for torrent service
ipcMain.handle('torrent:start', async (event, { magnetUrl, title }) => {
  try {
    console.log('[IPC] Starting torrent:', title);
    const result = await torrentService.startTorrent(magnetUrl, title);
    return { success: true, data: result };
  } catch (error) {
    console.error('[IPC] Error starting torrent:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('torrent:stop', async () => {
  try {
    torrentService.stopTorrent();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('torrent:getInfo', async () => {
  try {
    const info = torrentService.getStreamInfo();
    return { success: true, data: info };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Window control handlers
ipcMain.on('window:minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window:close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (torrentService) {
    torrentService.cleanup();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
