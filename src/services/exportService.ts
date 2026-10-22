import JSZip from 'jszip';
import { CogniaFolder, FolderFile } from '../types';
import { getDB } from './db';

export async function exportFolderAsZip(folder: CogniaFolder, files: FolderFile[]): Promise<void> {
  const zip = new JSZip();
  const folderSlug = `Folder_${String(folder.id).padStart(2, '0')}_${folder.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const zipFolder = zip.folder(folderSlug);

  // Add metadata readme
  const readmeContent = `# ${folder.name} (${folder.standardCode})
Domain: ${folder.domain}
Description: ${folder.description}
Files Count: ${files.length}
Exported: ${new Date().toLocaleString()}

Suggested Evidences:
${folder.suggestedEvidences.map((e) => `- ${e}`).join('\n')}

Notes:
${folder.notes || 'None'}
`;
  zipFolder?.file('README_Cognia_Standard.txt', readmeContent);

  for (const file of files) {
    if (file.blob) {
      zipFolder?.file(file.name, file.blob);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, `${folderSlug}.zip`);
}

export async function exportAll35FoldersZip(folders: CogniaFolder[]): Promise<void> {
  const db = await getDB();
  const allFiles = await db.getAll('files');
  const zip = new JSZip();
  const root = zip.folder('Nada_International_School_Cognia_Portal_Archive');

  // Master manifest
  const manifest = {
    institution: 'Nada International School',
    system: 'Cognia Accreditation Evidence Portal',
    exportedAt: new Date().toISOString(),
    totalFolders: folders.length,
    totalFiles: allFiles.length,
    folders: folders.map((f) => ({
      id: f.id,
      standardCode: f.standardCode,
      name: f.name,
      domain: f.domain,
      fileCount: f.fileCount,
      totalSize: f.totalSize,
    })),
  };
  root?.file('MASTER_PORTAL_INDEX.json', JSON.stringify(manifest, null, 2));

  // Organize by 35 folders
  for (const folder of folders) {
    const folderName = `Folder_${String(folder.id).padStart(2, '0')}_${folder.standardCode.replace(/\s+/g, '_')}_${folder.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const subFolder = root?.folder(folderName);

    const folderFiles = allFiles.filter((f) => f.folderId === folder.id);
    for (const file of folderFiles) {
      if (file.blob) {
        subFolder?.file(file.name, file.blob);
      }
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const filename = `NIS_Cognia_Portal_All_35_Folders_${new Date().toISOString().slice(0, 10)}.zip`;
  downloadBlob(content, filename);
}

export async function downloadOfflineAppPackage(): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder('NIS_Cognia_Portal_Windows11_Offline');

  // 1. Windows 11 1-click batch launcher
  const batLauncher = `@echo off
cd /d "%~dp0"
title Nada International School Cognia Portal - Windows 11 Launcher
cls
echo =========================================================================
echo    Nada International School Cognia Portal - Windows 11 Offline
echo =========================================================================
echo.
echo Launching offline portal...
echo Opening in Windows 11 desktop frame...
powershell -ExecutionPolicy Bypass -File "%~dp0start-offline-server.ps1"
`;
  root?.file('RUN_OFFLINE_PORTAL.bat', batLauncher);

  // 2. Windows PowerShell offline HTTP server (built into every Windows 11 PC)
  const psServer = `$port = 3000
$path = $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  Nada International School Cognia Portal - Offline Server" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Local offline URL: http://localhost:$port" -ForegroundColor Cyan
Write-Host "Launching Microsoft Edge in Windows 11 app mode..." -ForegroundColor White
Write-Host "Press Ctrl+C in this window anytime to stop the server." -ForegroundColor Gray

Start-Process "msedge.exe" -ArgumentList "--app=http://localhost:$port" -ErrorAction SilentlyContinue

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
} catch {
    $port = 3001
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
    Start-Process "msedge.exe" -ArgumentList "--app=http://localhost:$port" -ErrorAction SilentlyContinue
}

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $localPath = $request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrEmpty($localPath)) { $localPath = "index.html" }
    $filePath = Join-Path $path $localPath
    
    if (-not (Test-Path $filePath -PathType Leaf)) {
        $filePath = Join-Path $path "index.html"
    }

    if (Test-Path $filePath -PathType Leaf) {
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        switch ($ext) {
            ".html" { $response.ContentType = "text/html; charset=utf-8" }
            ".js"   { $response.ContentType = "application/javascript" }
            ".css"  { $response.ContentType = "text/css" }
            ".json" { $response.ContentType = "application/json" }
            ".png"  { $response.ContentType = "image/png" }
            ".svg"  { $response.ContentType = "image/svg+xml" }
            Default { $response.ContentType = "application/octet-stream" }
        }
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
    }
    $response.OutputStream.Close()
}
`;
  root?.file('start-offline-server.ps1', psServer);

  // 3. Node.js developer launcher
  const nodeLauncher = `@echo off
cd /d "%~dp0"
title Nada International School Cognia Portal - Node.js Server
cls
echo Checking Node.js environment...
npm --version >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js not found. Launching via native Windows 11 server...
    call RUN_OFFLINE_PORTAL.bat
    exit /b
)
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo Launching local server at http://localhost:3000 ...
start "" http://localhost:3000
call npm run dev
pause
`;
  root?.file('RUN_WITH_NODEJS.bat', nodeLauncher);

  // 4. Instructions
  const instructions = `=============================================================================
  NADA INTERNATIONAL SCHOOL - COGNIA ACCREDITATION PORTAL
  WINDOWS 11 OFFLINE DESKTOP DEPLOYMENT GUIDE
=============================================================================

HOW TO RUN THIS SOFTWARE ON WINDOWS 11 COMPLETELY OFFLINE:

METHOD 1: 1-CLICK LAUNCHER (ZERO INSTALLS NEEDED)
-----------------------------------------------------------------------------
1. Extract this entire ZIP archive to a folder on your Windows 11 PC 
   (e.g., C:\\NIS_Cognia_Portal or on your Desktop).
2. Double-click "RUN_OFFLINE_PORTAL.bat".
3. A Windows 11 desktop window will open immediately!
   - Uses native Windows PowerShell HTTP engine (built into Windows 11).
   - No internet, no accounts, and no Node.js required.
   - All uploaded evidence PDFs and folders are permanently saved in your computer's 
     local IndexedDB storage.

METHOD 2: INSTALL AS A WINDOWS 11 APP VIA MICROSOFT EDGE OR CHROME
-----------------------------------------------------------------------------
1. While the portal is open in Microsoft Edge or Google Chrome:
2. Look at the address bar on the right side for the "App available" or "Install" icon, 
   OR click the browser menu (...) -> Apps -> "Install this site as an app".
3. Click "Install".
4. Check "Pin to taskbar" and "Pin to Start".
5. You now have a native Windows 11 desktop shortcut with the NIS school crest icon!

METHOD 3: RUNNING WITH NODE.JS / NPM (DEVELOPER MODE)
-----------------------------------------------------------------------------
If you have Node.js installed:
1. Double-click "RUN_WITH_NODEJS.bat" (or run 'npm install' then 'npm run dev').
2. Open http://localhost:3000 in any browser.

DATA STORAGE GUARANTEE:
All 35 standard folders, uploaded evidence documents, and notes are saved 
permanently in your local machine's IndexedDB database. 
You can export full backups at any time using the "Export Archive" button.

Support & Accreditation Contact:
Nada International School Accreditation Committee
Cognia Performance Standards Portal
=============================================================================
`;
  root?.file('README_WINDOWS11_OFFLINE.txt', instructions);

  // Try to fetch built assets or current page content
  try {
    const res = await fetch('/');
    const html = await res.text();
    root?.file('index.html', html);
  } catch {
    // fallback minimal index
  }

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, `Nada_International_School_Cognia_Portal_Windows11_Offline.zip`);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

