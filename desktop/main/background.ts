import path from 'path';
import { app, ipcMain, dialog } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { spawn } from 'child_process';
import os from 'os';

const isProd = process.env.NODE_ENV === 'production';


// Define a cross-platform relative executable path
let exePath = path.join(__dirname, './main' + (os.platform() === 'win32' ? '.exe' : ''));


//during development, use this
// let exePath = path.join(__dirname, '../../backend/dist/main/main' + (os.platform() === 'win32' ? '.exe' : ''));
if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

let childProcess = null; // Store the child process reference

// Function to execute the process and store its reference
function executeCommand(command) {
  childProcess = spawn(command, { shell: true, stdio: 'inherit' });

  // ✅ Notify user when process starts
  // dialog.showMessageBox({
  //   type: 'info',
  //   title: 'Process Started',
  //   message: 'The backend service has started successfully!',
  // });

  childProcess.on('error', (error) => {
    console.error(`Error executing command: ${error.message}`);

    // ❌ Notify user on error
    // dialog.showMessageBox({
    //   type: 'error',
    //   title: 'Backend Error',
    //   message: `An error occurred while starting the backend: ${error.message}`,
    // });
  });

  childProcess.on('exit', (code, signal) => {
    console.log(`Child process exited with code ${code} and signal ${signal}`);
    childProcess = null; // Reset process reference

    // 🔴 Notify user when process exits
    // dialog.showMessageBox({
    //   type: 'warning',
    //   title: 'Backend Stopped',
    //   message: `The backend process has exited with code ${code}.`,
    // });
  });
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }

  // 🟢 Run the correct executable based on OS
  executeCommand(exePath);
})();

// Kill child process when the app quits
app.on('before-quit', () => {
  if (childProcess) {
    console.log('Killing subprocess...');
    childProcess.kill('SIGTERM'); // Send termination signal

    // 🔴 Notify user that backend is stopping
    dialog.showMessageBox({
      type: 'info',
      title: 'Shutting Down',
      message: 'The backend service is stopping...',
    });
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});

// IPC to run the command on request
ipcMain.on('run-command', (event, command) => {
  executeCommand(command);
});

// IPC to kill the process on request
ipcMain.on('kill-command', () => {
  if (childProcess) {
    console.log('Killing subprocess from IPC...');
    childProcess.kill('SIGTERM');
    childProcess = null;

    // 🔴 Notify user that backend was stopped manually
    dialog.showMessageBox({
      type: 'info',
      title: 'Backend Stopped',
      message: 'The backend process was manually stopped.',
    });
  }
});
