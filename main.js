// DEV

// import { app, BrowserWindow } from 'electron';
// import { exec } from 'child_process';
// import { fileURLToPath } from 'url';
// import path, { dirname, join } from 'path';
// import fs from 'fs';
// import { spawn } from 'child_process';
// import { PythonShell } from 'python-shell';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// let pythonProcess = null;

// function createWindow () {
//   console.log("Opening window")
//   const win = new BrowserWindow({
//     width: 1600,
//     height: 1000,
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//     }
//   });
//   // DEBUG: win.webContents.openDevTools();
//   win.webContents.openDevTools();

//   win.loadFile(path.join(__dirname, 'dist', 'index.html'));
// }

// function extractPythonScript() {
//   const asarFilePath = path.join(__dirname, 'app.asar');
//   const pythonScriptPathInAsar = 'backend/app.py';

//   const tempPythonScriptPath = path.join(__dirname, 'temp', 'app.py');

//   if (!fs.existsSync(path.join(__dirname, 'temp'))) {
//     fs.mkdirSync(path.join(__dirname, 'temp'));
//   }

//   asar.extractFile(asarFilePath, pythonScriptPathInAsar, tempPythonScriptPath, (err) => {
//     if (err) {
//       console.error('Error extracting Python script from ASAR:', err);
//       return;
//     }
//     console.log('Python script extracted to:', tempPythonScriptPath);
//     startPythonServer(tempPythonScriptPath);
//   });
// }

// function startPythonServer() {
//   console.log("PYTHON SCRIPT");
//   console.log(path.join(__dirname, 'backend', 'app.py'));

//   const script = path.join(__dirname, 'backend', 'app.py');

//   pythonProcess = spawn('python', [script]);

//   console.log("PROCESS: ", pythonProcess);
  
//   pythonProcess.stdout.on('data', data => console.log('data : ', data.toString()))

//   pythonProcess.stderr.on('data', (data) => {
//     console.error(`Python stderr: ${data}`);
//   });

//   pythonProcess.on('close', (code) => {
//     console.log(code);
//   });
// }

// app.whenReady().then(() => {
//   console.log("BOOTING UP");
//   createWindow();
//   startPythonServer();
//   console.log("PYTHON STARTED");

//   app.on('activate', () => {
//     console.log("APP ON");
//     if (BrowserWindow.getAllWindows().length === 0) createWindow();
//   });
// });

// app.on('window-all-closed', () => {
//   if (pythonProcess) {
//     pythonProcess.kill();
//     console.log("Killed python");
//   }
//   app.quit();
// });








// PROD

import { app, BrowserWindow } from 'electron';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path, { dirname, join } from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { PythonShell } from 'python-shell';
import asar from 'asar';

const __filename = fileURLToPath(import.meta.url) + "/../../";
const __dirname = dirname(__filename);

let pythonProcess = null;

function createWindow () {
  console.log("Opening window")
  const win = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  // DEBUG: win.webContents.openDevTools();

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

function extractPythonScript() {
  const asarFilePath = path.join(__dirname, 'app.asar');
  console.log("ASAR", asarFilePath)
  const pythonScriptPathInAsar = 'backend/app.py';

  const tempPythonScriptPath = path.join(__dirname, 'backend', 'app.py');

  console.log("MDR", tempPythonScriptPath);
  startPythonServer(tempPythonScriptPath);

  // if (!fs.existsSync(path.join(__dirname, 'temp'))) {
  //   fs.mkdirSync(path.join(__dirname, 'temp'));
  // }

  // asar.extractFile(asarFilePath, pythonScriptPathInAsar, tempPythonScriptPath, (err) => {
  //   if (err) {
  //     console.error('Error extracting Python script from ASAR:', err);
  //     return;
  //   }
  //   console.log('Python script extracted to:', tempPythonScriptPath);
  //   startPythonServer(tempPythonScriptPath);
  // });
}

function startPythonServer(pythonScriptPath) {
  console.log('Starting Python script:', pythonScriptPath);

  pythonProcess = spawn('python', [pythonScriptPath]);

  console.log('Process:', pythonProcess);

  pythonProcess.stdout.on('data', (data) => console.log('data : ', data.toString()));

  pythonProcess.stderr.on('data', (data) => {
    console.error('Python stderr: ', data.toString());
  });

  pythonProcess.on('close', (code) => {
    console.log('Python process exited with code', code);
  });
}

app.whenReady().then(() => {
  console.log("BOOTING UP");
  createWindow();
  extractPythonScript();
  console.log("PYTHON STARTED");

  app.on('activate', () => {
    console.log("APP ON");
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (pythonProcess) {
    pythonProcess.kill();
    console.log("Killed python");
  }
  app.quit();
});