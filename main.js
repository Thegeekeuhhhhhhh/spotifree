import { app, BrowserWindow } from 'electron';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path, { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true, // This enables access to `process`, `require`, etc.
      webSecurity: false // <-- Disable CORS restrictions for local files
    }
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(() => {
  // Start the Python backend
  const backend = exec('backend/app.exe'); // <-- This will be your compiled Python backend

  createWindow();

  app.on('window-all-closed', () => {
    backend.kill(); // Stop backend when window closes
    if (process.platform !== 'darwin') app.quit();
  });
});