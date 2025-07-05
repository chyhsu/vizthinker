const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess;

function startBackend() {
  const pythonExec = process.env.PYTHON_EXEC || 'python';
  backendProcess = spawn(pythonExec, [path.join(__dirname, 'server', 'main.py')], {
    stdio: 'inherit',
  });
  backendProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Backend exited with code ${code}, restarting...`);
      startBackend();
    }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('backend-status', () => {
  return backendProcess && !backendProcess.killed ? 'running' : 'stopped';
});
