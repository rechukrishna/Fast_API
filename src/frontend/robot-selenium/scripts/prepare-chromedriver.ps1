# Downloads Chrome-for-Testing chromedriver (win64) into robot-selenium\drivers\chromedriver.exe
# Requires: network access from the Jenkins agent. Install Google Chrome on the agent separately.

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$driversDir = Join-Path $root 'drivers'
New-Item -ItemType Directory -Force -Path $driversDir | Out-Null
$targetExe = Join-Path $driversDir 'chromedriver.exe'

$resp = Invoke-WebRequest -UseBasicParsing 'https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_STABLE'
$raw = $resp.Content
if ($raw -is [byte[]]) {
    $raw = [System.Text.Encoding]::UTF8.GetString($raw)
}
$version = ([string]$raw).Trim()
if (-not $version) {
    throw 'Could not read LATEST_RELEASE_STABLE'
}

$zipUrl = "https://storage.googleapis.com/chrome-for-testing-public/$version/win64/chromedriver-win64.zip"
$zipPath = Join-Path $env:TEMP "chromedriver-win64-$version.zip"
$extractRoot = Join-Path $env:TEMP "chromedriver-extract-$version"

Write-Host "Downloading chromedriver $version from $zipUrl"
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath

if (Test-Path $extractRoot) {
    Remove-Item -Recurse -Force $extractRoot
}
New-Item -ItemType Directory -Force -Path $extractRoot | Out-Null
Expand-Archive -Path $zipPath -DestinationPath $extractRoot -Force

$exe = Get-ChildItem -Path $extractRoot -Recurse -Filter 'chromedriver.exe' | Select-Object -First 1
if (-not $exe) {
    throw 'chromedriver.exe not found in archive'
}

Copy-Item -Path $exe.FullName -Destination $targetExe -Force
Write-Host "Installed chromedriver to $targetExe"
