// Sprawdzenie struktury bazy danych przed czyszczeniem
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  console.log('🔍 ANALIZA STRUKTURY BAZY DANYCH');
  console.log('================================');
  
  // Sprawdzenie wszystkich tabel
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();
  
  console.log(`📊 Znalezione tabele: ${tables.length}`);
  tables.forEach((table, index) => {
    console.log(`${index + 1}. ${table.name}`);
  });
  
  console.log('\n🔗 SPRAWDZENIE POWIĄZAŃ:');
  console.log('=======================');
  
  // Dla każdej tabeli sprawdź czy ma kolumny user_id
  tables.forEach(table => {
    try {
      const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
      const userIdColumn = columns.find(col => col.name === 'user_id');
      
      if (userIdColumn) {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
        console.log(`📋 ${table.name}: ${count.count} rekordów (ma kolumnę user_id)`);
      }
    } catch (e) {
      console.log(`⚠️ ${table.name}: błąd sprawdzenia`);
    }
  });
  
  // Sprawdzenie użytkowników
  console.log('\n👥 UŻYTKOWNICY:');
  console.log('===============');
  
  const users = db.prepare('SELECT id, username, email, is_admin FROM users ORDER BY is_admin DESC').all();
  console.log(`Łącznie: ${users.length} użytkowników`);
  
  const mainAdmin = users.find(u => u.email === 'admin@wp.pl' && u.is_admin);
  if (mainAdmin) {
    console.log(`✅ Główny admin znaleziony: ${mainAdmin.username} (${mainAdmin.id})`);
  } else {
    console.log('❌ Nie znaleziono głównego admina admin@wp.pl');
  }
  
  // Pozostali adminowie
  const otherAdmins = users.filter(u => u.is_admin && u.email !== 'admin@wp.pl');
  console.log(`🔄 Duplikatowych adminów do usunięcia: ${otherAdmins.length}`);
  otherAdmins.forEach(admin => {
    console.log(`   - ${admin.username} (${admin.email})`);
  });
  
  // Zwykli użytkownicy
  const regularUsers = users.filter(u => !u.is_admin);
  console.log(`👤 Zwykłych użytkowników do usunięcia: ${regularUsers.length}`);
  
  db.close();
  
} catch (error) {
  console.error('❌ Błąd:', error.message);
}