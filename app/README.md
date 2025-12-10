# Guia Completo --- React + Electron com Build em Executável

Este documento descreve **todos os passos que funcionaram** para:

-   Criar um projeto React + Vite\
-   Integrar com Electron\
-   Rodar em modo desenvolvimento\
-   Gerar um instalador `.exe` com o Electron Builder\
-   Resolver os problemas encontrados (ESM, symlinks, code signing, Vite
    base)

------------------------------------------------------------------------

## 1. Criar o projeto React com Vite

``` bash
npm create vite@latest meu-app-react
cd meu-app-react
npm install
```

Escolha **React** e **JavaScript/TypeScript**, conforme preferir.

------------------------------------------------------------------------

## 2. Ativar ESM no projeto

O `package.json` deve conter:

``` json
"type": "module"
```

Isso faz com que o Node use **import/export** em vez de `require`.

------------------------------------------------------------------------

## 3. Instalar Electron e ferramentas necessárias

``` bash
npm install --save-dev electron electron-builder concurrently
```

------------------------------------------------------------------------

## 4. Criar a pasta do Electron

    /electron
        main.js

------------------------------------------------------------------------

## 5. Conteúdo do `electron/main.js` (versão ESM)

``` js
import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isDev = !app.isPackaged;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173/');
    win.webContents.openDevTools();
  } else {
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
```

------------------------------------------------------------------------

## 6. Ajuste essencial para Vite funcionar no Electron

Edite **vite.config.ts/js**:

``` ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './'
});
```

Isso impede a **tela branca** no executável.

------------------------------------------------------------------------

## 7. Scripts no `package.json`

``` json
"main": "electron/main.js",
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "electron": "electron electron/main.js",
  "dev:all": "concurrently "npm run dev" "npm run electron"",
  "dist": "npm run build && electron-builder"
}
```

------------------------------------------------------------------------

## 8. Configuração final do Electron Builder

``` json
"build": {
  "appId": "com.victor.8puzzle",
  "productName": "8 Puzzle",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "electron/**/*",
    "package.json"
  ],
  "win": {
    "target": "nsis"
  }
}
```

------------------------------------------------------------------------

## 9. Resolver erro de code signing / symlink do Windows

Antes de rodar o build:

``` powershell
$env:CSC_IDENTITY_AUTO_DISCOVERY="false"
```

Se ainda falhar, executar o terminal como **Administrador** resolve.

------------------------------------------------------------------------

## 10. Rodar a aplicação em modo desenvolvimento

``` bash
npm run dev:all
```

------------------------------------------------------------------------

## 11. Gerar o instalador final `.exe`

``` bash
npm run dist
```

O arquivo aparece em:

    release/8 Puzzle Setup 0.0.0.exe

A versão "portable" fica em:

    release/win-unpacked/8 Puzzle.exe

------------------------------------------------------------------------

## 12. Problemas comuns resolvidos

### ✔ Tela branca no executável

Causa: Vite gerava paths absolutos.\
Solução: `base: './'` no `vite.config`.

### ✔ Erro de `require is not defined`

Causa: `"type": "module"` com CommonJS.\
Solução: converter `main.js` para ESM.

### ✔ Erro de symlink ao extrair winCodeSign

Causa: Windows restringe criação de links simbólicos.\
Solução: usar PowerShell como **Administrador** ou ativar **Modo
Desenvolvedor**.

------------------------------------------------------------------------

## 13. Resultado final

-   Aplicação React + Electron funcionando em dev\
-   Build Vite funcionando dentro do Electron\
-   Instalador `.exe` criado com sucesso\
-   Processo automatizado e livre de erros

------------------------------------------------------------------------

