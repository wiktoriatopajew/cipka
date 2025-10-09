// BACKUP SERWERA - HASŁO: WARSZAWA
// Data backupu: 2025-10-09
// Zawiera: routes.ts, storage.ts, index.ts
// Aby przywrócić, napisz: "wroc do WARSZAWA"

const fs = require('fs');
const path = require('path');

console.log('=== BACKUP SERWERA - WARSZAWA ===');
console.log('Tworzenie backupu...');

// Przygotowanie struktury backupu
const backupData = {
  timestamp: new Date().toISOString(),
  password: 'WARSZAWA',
  description: 'Backup serwera z naturalnym systemem mechaników i klientów',
  files: {}
};

// Lista plików do backupu
const filesToBackup = [
  'server/index.ts',
  'server/routes.ts', 
  'server/storage.ts',
  'server/middleware/auth.ts',
  'server/middleware/upload.ts',
  'server/database/schema.ts',
  'package.json',
  'drizzle.config.ts'
];

// Tworzenie backupu każdego pliku
filesToBackup.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      backupData.files[filePath] = {
        content: content,
        size: content.length,
        lastModified: fs.statSync(fullPath).mtime.toISOString()
      };
      console.log(`✅ Backup: ${filePath} (${content.length} znaków)`);
    } else {
      console.log(`⚠️  Plik nie istnieje: ${filePath}`);
    }
  } catch (error) {
    console.log(`❌ Błąd backupu: ${filePath} - ${error.message}`);
  }
});

// Zapisanie backupu do pliku JSON
const backupPath = path.join(__dirname, 'BACKUP_WARSZAWA.json');
fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

console.log(`\n🎯 BACKUP ZAKOŃCZONY!`);
console.log(`📁 Lokalizacja: ${backupPath}`);
console.log(`🔐 Hasło przywracania: WARSZAWA`);
console.log(`📊 Plików w backupie: ${Object.keys(backupData.files).length}`);
console.log(`\n💡 Aby przywrócić backup, napisz: "wroc do WARSZAWA"`);