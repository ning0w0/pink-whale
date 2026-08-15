@echo off
rem ============================================================
rem  Pink Whale - create desktop shortcut
rem  Run this script once (double-click) to create
rem  "pink_whale.lnk" on your desktop with the pink whale icon.
rem ============================================================

set "APP_DIR=%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$desktop = [Environment]::GetFolderPath('Desktop');" ^
  "$lnk = $ws.CreateShortcut((Join-Path $desktop 'pink_whale.lnk'));" ^
  "$lnk.TargetPath = Join-Path $env:APP_DIR 'node_modules\electron\dist\electron.exe';" ^
  "$lnk.Arguments = '\"' + $env:APP_DIR.TrimEnd('\') + '\"';" ^
  "$lnk.WorkingDirectory = $env:APP_DIR;" ^
  "$lnk.IconLocation = Join-Path $env:APP_DIR 'pink_whale.ico';" ^
  "$lnk.Description = 'Pink Whale - DeepSeek Harness Shell';" ^
  "$lnk.Save();" ^
  "if (Test-Path (Join-Path $desktop 'pink_whale.lnk')) { Write-Host 'OK: pink_whale.lnk created on desktop' } else { Write-Host 'FAILED' }"

echo.
pause
