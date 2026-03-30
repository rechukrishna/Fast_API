# Downloads Chrome-for-Testing chromedriver (win64) into robot-selenium\drivers\chromedriver.exe
# Matches the *installed* Chrome major version when possible (avoids Chrome 146 + driver 147 mismatch).
# Requires: network access. Install Google Chrome on the agent separately.

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$driversDir = Join-Path $root 'drivers'
New-Item -ItemType Directory -Force -Path $driversDir | Out-Null
$targetExe = Join-Path $driversDir 'chromedriver.exe'

function Get-InstalledChromeVersion {
    foreach ($p in @('HKLM:\SOFTWARE\Google\Chrome\BLBeacon', 'HKLM:\SOFTWARE\WOW6432Node\Google\Chrome\BLBeacon')) {
        if (Test-Path $p) {
            $v = (Get-ItemProperty $p -ErrorAction SilentlyContinue).version
            if ($v) { return [string]$v }
        }
    }
    $chromeExe = Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'
    if (-not (Test-Path $chromeExe)) {
        $pf86 = ${env:ProgramFiles(x86)}
        if ($pf86) {
            $chromeExe = Join-Path $pf86 'Google\Chrome\Application\chrome.exe'
        }
    }
    if (Test-Path $chromeExe) {
        try {
            $fv = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($chromeExe).FileVersion
            if ($fv -match '^(\d+\.\d+\.\d+\.\d+)') { return $Matches[1] }
        } catch { }
        $out = & $chromeExe --version 2>&1 | Out-String
        if ($out -match '(\d+\.\d+\.\d+\.\d+)') { return $Matches[1] }
    }
    return $null
}

function Get-StableChromedriverWin64Url {
    $lck = Invoke-RestMethod -Uri 'https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json' -UseBasicParsing
    $entry = $lck.channels.Stable.downloads.chromedriver | Where-Object { $_.platform -eq 'win64' } | Select-Object -First 1
    if (-not $entry.url) { throw 'Could not resolve Stable chromedriver win64 URL' }
    return @{ Url = $entry.url; Label = 'Stable channel (Chrome not detected)' }
}

function Get-ChromedriverWin64UrlForMilestone {
    param([string]$ChromeVersion)
    $milestone = ($ChromeVersion -split '\.')[0]
    if (-not $milestone) { throw "Invalid Chrome version: $ChromeVersion" }

    $json = Invoke-RestMethod -Uri 'https://googlechromelabs.github.io/chrome-for-testing/latest-versions-per-milestone-with-downloads.json' -UseBasicParsing
    $m = $json.milestones."$milestone"
    if (-not $m) {
        throw "No Chrome-for-Testing entry for milestone $milestone (installed: $ChromeVersion). Update Chrome on the agent or install a matching chromedriver manually."
    }
    $entry = $m.downloads.chromedriver | Where-Object { $_.platform -eq 'win64' } | Select-Object -First 1
    if (-not $entry.url) {
        throw "No win64 chromedriver in milestone $milestone"
    }
    Write-Host "Installed Chrome $ChromeVersion -> milestone $milestone, CfT chromedriver $($m.version)"
    return @{ Url = $entry.url; Label = $m.version }
}

$chromeVersion = Get-InstalledChromeVersion
if ($chromeVersion) {
    $resolved = Get-ChromedriverWin64UrlForMilestone -ChromeVersion $chromeVersion
} else {
    Write-Warning 'Could not read installed Chrome version from registry or chrome.exe; using Stable CfT chromedriver.'
    $resolved = Get-StableChromedriverWin64Url
}

$zipUrl = $resolved.Url
$label = $resolved.Label -replace '[^\w\.\-]', '_'
$zipPath = Join-Path $env:TEMP "chromedriver-win64-$label.zip"
$extractRoot = Join-Path $env:TEMP "chromedriver-extract-$label"

Write-Host "Downloading chromedriver from $zipUrl"
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
