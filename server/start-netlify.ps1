# PowerShell script to start Netlify dev server
Write-Host "Starting Netlify dev server..." -ForegroundColor Green
cd $PSScriptRoot
npx netlify dev --port 8888
