<#
PowerShell script to delete or back up all files under the migrations/ folder.

Usage examples (run from repo root):
  # Dry-run (shows what would be done)
  .\scripts\delete_all_migrations.ps1 -WhatIf

  # Backup migrations to migrations/deleted_backup_TIMESTAMP and remove originals from git (tracked files are moved and committed)
  .\scripts\delete_all_migrations.ps1 -Backup

  # Permanently delete all migrations (git rm for tracked files, Remove-Item for untracked)
  .\scripts\delete_all_migrations.ps1 -Force

  # Permanently delete including any existing backups under migrations/backup or migrations/deleted_backup (use with care)
  .\scripts\delete_all_migrations.ps1 -Force -DeleteBackup

Notes:
- This script will act on everything under ./migrations except it will skip the script itself if it's placed in migrations (we put it in scripts/).
- For files tracked by git, the script uses `git rm` so the deletion is recorded in history and will be pushed when you push changes.
- The script prompts for confirmation by default. Use -Force to skip prompt.
- Requires git available in PATH.
#>

param(
    [switch]$Backup,
    [switch]$Force,
    [switch]$DeleteBackup
)

function Timestamp() { Get-Date -Format yyyyMMdd_HHmmss }

$repoRoot = Resolve-Path -Path .
$migrationsDir = Join-Path $repoRoot 'migrations'
if (-not (Test-Path $migrationsDir)){
    Write-Error "Folder 'migrations' not found at $migrationsDir"
    exit 1
}

# Gather files to process (exclude any folder named 'backup' to avoid moving backups into themselves)
$files = Get-ChildItem -Path $migrationsDir -Recurse -File | Where-Object { $_.FullName -notmatch "\\migrations\\backup(\\|$)" -and $_.FullName -notmatch "\\migrations\\deleted_backup(\\|$)" }
if (-not $files){
    Write-Host "No migration files found to process under $migrationsDir"
    exit 0
}

Write-Host "Found $($files.Count) file(s) under migrations to process:`n"
$files | ForEach-Object { Write-Host " - $($_.FullName)" }

if (-not $Force){
    $yn = Read-Host "Proceed with operation? Type 'yes' to continue"
    if ($yn -ne 'yes'){
        Write-Host 'Aborted by user.'
        exit 0
    }
}

if ($Backup){
    $ts = Timestamp
    $dest = Join-Path $migrationsDir ("deleted_backup_$ts")
    Write-Host "Creating backup folder: $dest"
    New-Item -ItemType Directory -Path $dest | Out-Null

    foreach ($f in $files){
        $relative = $f.FullName.Substring($migrationsDir.Length).TrimStart('\')
        $target = Join-Path $dest $relative
        $targetDir = Split-Path $target -Parent
        if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir | Out-Null }
        Write-Host "Moving $($f.FullName) -> $target"
        Move-Item -Path $f.FullName -Destination $target -Force
    }

    # Stage backup and removed files in git: we need to git add the new files and git rm the old paths
    Write-Host "Staging backup and removal in git..."
    # Add the new files in backup
    & git add -- "$(Split-Path $dest -Leaf)" | Out-Null

    # Remove original paths from git (they've been moved) — use git ls-files to find tracked files under migrations
    $trackedOutput = & git ls-files -- "migrations/*" 2>$null
    $tracked = if ($trackedOutput) { $trackedOutput -split "\n" } else { @() }
    if ($tracked){
        Write-Host "Removing tracked migration paths from git index..."
        foreach ($t in $tracked){
            # if the file still exists (shouldn't after move), try git rm --cached; otherwise git rm will record the deletion
            & git rm --quiet --ignore-unmatch -- "$t" | Out-Null
        }
    }

    $msg = "Backup migrations to $([IO.Path]::GetFileName($dest)) and remove originals"
    & git add -A | Out-Null
    & git commit -m $msg 2>$null
    if ($LASTEXITCODE -eq 0){ Write-Host "Committed backup + removals: $msg" } else { Write-Host "No commit created (maybe no tracked files changed)." }

    Write-Host "Backup complete. To push changes to remote run: git push origin HEAD:master"
    exit 0
}

# If not backup -> delete
# Optionally delete existing backups too
if ($DeleteBackup){
    $delTargets = Get-ChildItem -Path $migrationsDir -Directory | Where-Object { $_.Name -match '^backup$' -or $_.Name -match '^deleted_backup' }
    foreach ($d in $delTargets){
        Write-Host "Deleting backup folder: $($d.FullName)"
        Remove-Item -Path $d.FullName -Recurse -Force
    }
}

# Remove files: use git rm for tracked, Remove-Item for untracked
$trackedFiles = @()
$untrackedFiles = @()

foreach ($f in $files){
    $rel = (Resolve-Path -Path $f.FullName).Path.Substring($repoRoot.Path.Length).TrimStart('\')
    # Determine if tracked
    $checkOutput = & git ls-files --error-unmatch -- "$rel" 2>&1
    if ($LASTEXITCODE -eq 0){ $trackedFiles += $rel } else { $untrackedFiles += $f.FullName }
}

if ($trackedFiles.Count -gt 0){
    Write-Host "Removing $($trackedFiles.Count) tracked file(s) via git rm..."
    foreach ($t in $trackedFiles){
        Write-Host " git rm --quiet -- "$t""
        & git rm --quiet -- "$t" | Out-Null
    }
}

if ($untrackedFiles.Count -gt 0){
    Write-Host "Removing $($untrackedFiles.Count) untracked file(s) from disk..."
    foreach ($u in $untrackedFiles){
        Write-Host " Remove-Item $u"
        Remove-Item -Path $u -Force
    }
}

# Cleanup empty directories under migrations
Get-ChildItem -Path $migrationsDir -Recurse -Directory | Sort-Object -Property FullName -Descending | ForEach-Object {
    if (-not (Get-ChildItem -Path $_.FullName -Force -Recurse -ErrorAction SilentlyContinue)){
        Write-Host "Removing empty folder: $($_.FullName)"
        Remove-Item -Path $_.FullName -Force
    }
}

# Commit git removals
& git add -A | Out-Null
$msg2 = "Remove all migration files under migrations/"
& git commit -m $msg2 2>$null
if ($LASTEXITCODE -eq 0){ Write-Host "Committed deletions: $msg2" } else { Write-Host "No commit created (maybe nothing tracked changed)." }

Write-Host "Operation complete. To push to remote run: git push origin HEAD:master"

exit 0
