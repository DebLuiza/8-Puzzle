// electron/main.js
import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isDev = !app.isPackaged;

// Como estamos em ES modules, não existe __dirname nativo:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      // Para começar é mais simples assim.
      // Depois podemos deixar mais seguro usando preload + contextIsolation.
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    // Em modo dev: aponta pro servidor do Vite
    win.loadURL('http://localhost:5173/');
    win.webContents.openDevTools();
  } else {
    // Em produção: abre o index gerado pelo Vite
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
