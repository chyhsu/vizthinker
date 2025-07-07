const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess;

function startBackend(onReady) {
  console.log('Attempting to start backend...');
  // Point directly to the virtual environment's Python executable for consistency.
  const pythonExec = path.join(__dirname, '.venv', 'bin', 'python');
  const args = ['-m', 'uvicorn', 'server.main:app', '--host', '127.0.0.1', '--port', '8000'];
  console.log(`Spawning command: ${pythonExec} ${args.join(' ')} in ${__dirname}`);

  backendProcess = spawn(pythonExec, args, {
    cwd: __dirname, // stdio is not inherited so we can read from it
  });

  // Track when backend is ready so we only create the window once.
  let backendReady = false;
  const markBackendReady = () => {
    if (!backendReady) {
      backendReady = true;
      console.log('Backend is ready. Creating window.');
      if (onReady) onReady();
    }
  };

  backendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[Backend]: ${output}`);
    if (output.includes('Uvicorn running on') || output.includes('Application startup complete')) {
      markBackendReady();
    }
    if (output.includes('Uvicorn running on')) {
      console.log('Backend is ready. Creating window.');
      if (onReady) onReady();
    }
  });

  backendProcess.stderr.on('data', (data) => {
    const errOutput = data.toString();
    console.error(`[Backend ERR]: ${errOutput}`);
    if (errOutput.includes('Uvicorn running on') || errOutput.includes('Application startup complete')) {
      markBackendReady();
    }
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend process:', err);
  });

  backendProcess.on('exit', (code) => {
    console.error(`Backend process exited with code: ${code}`);
    if (code !== 0) {
      console.log('Restarting backend in 3 seconds...');
      setTimeout(() => startBackend(onReady), 3000);
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
    // In development, load from the Vite dev server, not the backend URL.
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  if (app.isPackaged) {
    // In production, the Electron app is responsible for starting the backend.
    startBackend(createWindow);
  } else {
    // In development, we assume `make dev` is running the backend, so we just create the window.
    createWindow();
  }

  app.on('activate', () => {
    // This handles creating a new window if the app is active but all windows are closed (e.g., on macOS).
    if (BrowserWindow.getAllWindows().length === 0) {
      if (app.isPackaged) {
        startBackend(createWindow);
      } else {
        createWindow();
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('backend-status', () => {
  return backendProcess && !backendProcess.killed ? 'running' : 'stopped';
});
