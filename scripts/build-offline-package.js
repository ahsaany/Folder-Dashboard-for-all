import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const publicDir = path.resolve(rootDir, 'public');

async function createOfflineZip() {
  console.log('Generating standalone Windows 11 offline package...');

  if (!fs.existsSync(distDir)) {
    console.error('dist directory not found. Please run npm run build first.');
    process.exit(1);
  }

  const zip = new JSZip();
  const folder = zip.folder('NIS_Cognia_Portal_Windows11_Offline');

  // 1. Add all files from dist/ (the compiled production bundle)
  function addDirectoryToZip(currentDir, currentZipFolder) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const subFolder = currentZipFolder.folder(item);
        addDirectoryToZip(fullPath, subFolder);
      } else {
        const content = fs.readFileSync(fullPath);
        currentZipFolder.file(item, content);
      }
    }
  }

  addDirectoryToZip(distDir, folder);

  // 2. Windows 11 1-Click Launcher (PowerShell Native HTTP Server - Zero Installs Needed)
  const batLauncher = `@echo off
cd /d "%~dp0"
title Nada International School Cognia Portal - Windows 11 Launcher
cls
echo =========================================================================
echo    Nada International School Cognia Portal - Windows 11 Offline Engine
echo =========================================================================
echo.
echo Starting local offline server on http://localhost:3000 ...
echo Opening in Microsoft Edge desktop app mode...
echo.
echo (Keep this command window open while using the application)
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
pause
`;
  folder.file('RUN_OFFLINE_PORTAL.bat', batLauncher);

  // 3. PowerShell server script with robust MIME types, auto-port retry, and auto-browser opening
  const psServer = `$port = 3000
$path = $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  Nada International School Cognia Portal - Windows 11" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Local offline server running at: http://localhost:$port" -ForegroundColor Cyan
Write-Host "Launching Microsoft Edge / Chrome in Desktop App Mode..." -ForegroundColor White
Write-Host "Keep this window open while using the portal." -ForegroundColor Gray
Write-Host "To stop the server, press Ctrl+C or close this window." -ForegroundColor Gray
Write-Host ""

# Launch Edge or Chrome in app window
Start-Process "msedge.exe" -ArgumentList "--app=http://localhost:$port" -ErrorAction SilentlyContinue

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
} catch {
    $port = 3001
    Write-Host "Port 3000 in use, switching to http://localhost:$port" -ForegroundColor Yellow
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
    Start-Process "msedge.exe" -ArgumentList "--app=http://localhost:$port" -ErrorAction SilentlyContinue
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $rawPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($rawPath)) { $rawPath = "index.html" }
        $filePath = Join-Path $path $rawPath
        
        if (-not (Test-Path $filePath -PathType Leaf)) {
            $filePath = Join-Path $path "index.html"
        }

        if (Test-Path $filePath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                ".mjs"  { $response.ContentType = "application/javascript; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                ".ico"  { $response.ContentType = "image/x-icon" }
                ".pdf"  { $response.ContentType = "application/pdf" }
                Default { $response.ContentType = "application/octet-stream" }
            }
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.OutputStream.Close()
    } catch {
        # continue loop on client abort
    }
}
`;
  folder.file('start-server.ps1', psServer);

  // 4. Python launcher (optional alternative)
  const pyLauncher = `@echo off
cd /d "%~dp0"
title Nada International School Cognia Portal - Python Server
cls
echo Starting local offline server with Python on http://localhost:3000 ...
start "" http://localhost:3000
python -m http.server 3000 || py -m http.server 3000
pause
`;
  folder.file('RUN_WITH_PYTHON.bat', pyLauncher);

  // 5. Node.js launcher with full source code
  const nodeLauncher = `@echo off
cd /d "%~dp0source"
title Nada International School Cognia Portal - Node.js Server
cls
echo Checking Node.js environment...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [NOTE] Node.js is not found.
    echo Launching via native Windows 11 launcher instead...
    cd /d "%~dp0"
    call RUN_OFFLINE_PORTAL.bat
    exit /b
)

if not exist node_modules (
    echo Installing dependencies (first run only)...
    call npm install
)

echo Starting development server on http://localhost:3000 ...
start "" http://localhost:3000
call npm run dev
pause
`;
  folder.file('RUN_WITH_NODEJS.bat', nodeLauncher);

  // 6. Detailed README instructions in English & Urdu
  const readme = `=============================================================================
  NADA INTERNATIONAL SCHOOL - COGNIA ACCREDITATION PORTAL
  WINDOWS 11 OFFLINE DESKTOP DEPLOYMENT GUIDE
=============================================================================

[URDU GUIDE / اردو ہدایات]:
Yeh software mukammal taur par OFFLINE chalanay ke liye tayyar hai.
Isay chalanay ke liye internet ki bilkul zaroorat nahi hai.

STEP 1: Is ZIP file ko kisi bhi folder mein EXTRACT karein 
        (e.g., C:\\NIS_Cognia_Portal ya Desktop par).
STEP 2: Folder ke andar "RUN_OFFLINE_PORTAL.bat" par DOUBLE CLICK karein.
STEP 3: Ek black command window open hogi aur Microsoft Edge khud ba khud 
        http://localhost:3000 par Desktop App mode mein open ho jayega!
STEP 4: Black window ko minimize kar lein, band mat karein jab tak app use karni ho.

Tamam 35 folders, evidence documents, PDFs, aur 5 Stars ratings aapke computer 
ki local IndexedDB storage mein permanently save rahenge!

-----------------------------------------------------------------------------
[ENGLISH GUIDE]:
HOW TO RUN THIS SOFTWARE ON WINDOWS 11 WITHOUT INTERNET:

METHOD 1: 1-CLICK LAUNCHER (ZERO INSTALLATION NEEDED)
1. Extract this entire ZIP archive to a folder on your Windows 11 PC 
   (e.g., C:\\NIS_Cognia_Portal or your Desktop).
2. Double-click "RUN_OFFLINE_PORTAL.bat".
3. A Windows 11 desktop window will open immediately on http://localhost:3000.
   - Powered by the built-in Windows PowerShell HTTP engine.
   - Zero internet or Node.js installation required.
   - All uploaded evidence PDFs and folders are permanently saved in your computer's 
     local IndexedDB storage.

METHOD 2: INSTALL AS A WINDOWS 11 APP VIA MICROSOFT EDGE OR CHROME
1. While the portal is open in Microsoft Edge or Google Chrome:
2. Look at the address bar on the right side for the "App available" or "Install" icon, 
   OR click the browser menu (...) -> Apps -> "Install this site as an app".
3. Click "Install".
4. Check "Pin to taskbar" and "Pin to Start".
5. You now have a native Windows 11 desktop shortcut with the NIS school crest icon!

METHOD 3: RUNNING WITH NODE.JS / NPM (DEVELOPER MODE)
If you have Node.js installed:
1. Double-click "RUN_WITH_NODEJS.bat".
2. It automatically installs dependencies in the 'source' directory and starts the Vite server.

Support & Accreditation Contact:
Nada International School Accreditation Committee
Cognia Performance Standards Portal
=============================================================================
`;
  folder.file('README_WINDOWS11_OFFLINE.txt', readme);

  // 7. Add full raw source code into source/ folder for developers
  const sourceFolder = folder.folder('source');
  const sourceFiles = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'index.html',
    'metadata.json',
  ];

  for (const f of sourceFiles) {
    const p = path.join(rootDir, f);
    if (fs.existsSync(p)) {
      sourceFolder.file(f, fs.readFileSync(p));
    }
  }

  // Add src/ into source/src/
  const srcDir = path.join(rootDir, 'src');
  if (fs.existsSync(srcDir)) {
    addDirectoryToZip(srcDir, sourceFolder.folder('src'));
  }

  // Generate ZIP and save into public/NIS_Cognia_Portal_Windows11_Offline.zip
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const outPath = path.join(publicDir, 'Nada_International_School_Cognia_Portal_Windows11_Offline.zip');
  fs.writeFileSync(outPath, zipBuffer);
  console.log(`Success! Offline package created at: ${outPath} (${(zipBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);
}

createOfflineZip().catch(console.error);
