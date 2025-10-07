Instrukcja: skrypt `delete_all_migrations.ps1`

Cel:
- Bezpiecznie usunąć lub wykonać backup wszystkich plików w katalogu `migrations/` w repozytorium.

Główne opcje:
- -Backup: przenosi wszystkie pliki pod `migrations/deleted_backup_<timestamp>` i commituje ruch w git (git add + git rm)
- -Force: nie pyta o potwierdzenie
- -DeleteBackup: usuwa istniejące foldery backup (np. `migrations/backup`, `migrations/deleted_backup_*`) przed działaniem
- -WhatIf: standardowy PowerShellowy test (możesz użyć `-WhatIf` do symulacji)

Przykłady:
  # Symulacja (dry-run):
  .\scripts\delete_all_migrations.ps1 -WhatIf

  # Backup i usunięcie oryginałów (interaktywne potwierdzenie):
  .\scripts\delete_all_migrations.ps1 -Backup

  # Usunięcie na stałe (bez potwierdzenia):
  .\scripts\delete_all_migrations.ps1 -Force

Bezpieczeństwo:
- Skrypt używa `git rm` dla śledzonych plików, więc usunięcia będą widoczne w historii i będą wymagały `git push` aby być propagowane.
- Nie usuwa niczego bez potwierdzenia, chyba że użyjesz `-Force`.

Jeżeli chcesz, mogę uruchomić ten skrypt za Ciebie (wykonać backup i commit) — potwierdź, czy chcesz backup czy trwałe usunięcie.
