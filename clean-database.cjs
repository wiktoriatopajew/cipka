// Czyszczenie bazy - usunięcie duplikatowych adminów i testowych użytkowników
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  console.log('🧹 CZYSZCZENIE BAZY DANYCH');
  console.log('=========================');
  
  // 1. Sprawdzenie aktualnego stanu
  const allUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log(`📊 Aktualna liczba użytkowników: ${allUsers.count}`);
  
  const admins = db.prepare('SELECT id, username, email FROM users WHERE is_admin = 1').all();
  console.log(`👑 Aktualna liczba adminów: ${admins.length}`);
  
  admins.forEach(admin => {
    console.log(`   - ${admin.username} (${admin.email})`);
  });
  
  console.log('\n🎯 OPERACJE CZYSZCZENIA:');
  console.log('========================');
  
  // 2. Usunięcie duplikatowych adminów (zostawiamy tylko admin@wp.pl)
  console.log('1. Usuwanie duplikatowych adminów...');
  
  const duplicateAdmins = db.prepare(`
    DELETE FROM users 
    WHERE is_admin = 1 
    AND email != 'admin@wp.pl'
  `).run();
  
  console.log(`   ✅ Usunięto ${duplicateAdmins.changes} duplikatowych adminów`);
  
  // 3. Usunięcie wszystkich pozostałych użytkowników (nie-adminów)
  console.log('2. Usuwanie wszystkich testowych użytkowników...');
  
  const testUsers = db.prepare(`
    DELETE FROM users 
    WHERE is_admin = 0
  `).run();
  
  console.log(`   ✅ Usunięto ${testUsers.changes} testowych użytkowników`);
  
  // 4. Czyszczenie powiązanych tabel
  console.log('3. Czyszczenie powiązanych danych...');
  
  // Usunięcie sesji nieistniejących użytkowników
  const orphanedSessions = db.prepare(`
    DELETE FROM sessions 
    WHERE user_id NOT IN (SELECT id FROM users)
  `).run();
  
  console.log(`   ✅ Usunięto ${orphanedSessions.changes} osieroconych sesji`);
  
  // Usunięcie wiadomości nieistniejących użytkowników
  const orphanedMessages = db.prepare(`
    DELETE FROM messages 
    WHERE user_id NOT IN (SELECT id FROM users)
  `).run();
  
  console.log(`   ✅ Usunięto ${orphanedMessages.changes} osieroconych wiadomości`);
  
  // Usunięcie chat sessions nieistniejących użytkowników
  const orphanedChats = db.prepare(`
    DELETE FROM chat_sessions 
    WHERE user_id NOT IN (SELECT id FROM users)
  `).run();
  
  console.log(`   ✅ Usunięto ${orphanedChats.changes} osieroconych sesji czatu`);
  
  // 5. Sprawdzenie końcowego stanu
  console.log('\n📊 KOŃCOWY STAN BAZY:');
  console.log('====================');
  
  const finalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log(`👥 Pozostało użytkowników: ${finalUsers.count}`);
  
  const remainingAdmins = db.prepare('SELECT id, username, email FROM users WHERE is_admin = 1').all();
  console.log(`👑 Pozostało adminów: ${remainingAdmins.length}`);
  
  remainingAdmins.forEach(admin => {
    console.log(`   ✅ ${admin.username} (${admin.email})`);
  });
  
  const finalSessions = db.prepare('SELECT COUNT(*) as count FROM sessions').get();
  const finalMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get();
  const finalChats = db.prepare('SELECT COUNT(*) as count FROM chat_sessions').get();
  
  console.log(`💬 Pozostało sesji: ${finalSessions.count}`);
  console.log(`📝 Pozostało wiadomości: ${finalMessages.count}`);
  console.log(`💭 Pozostało sesji czatu: ${finalChats.count}`);
  
  console.log('\n✅ CZYSZCZENIE ZAKOŃCZONE POMYŚLNIE!');
  console.log('====================================');
  console.log('Baza danych jest teraz czysta i gotowa do produkcji.');
  console.log('Pozostało tylko główne konto admin (admin@wp.pl).');
  
  db.close();
  
} catch (error) {
  console.error('❌ Błąd podczas czyszczenia:', error.message);
  console.error(error.stack);
}