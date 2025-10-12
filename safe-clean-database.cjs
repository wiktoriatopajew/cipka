// Bezpieczne czyszczenie bazy - najpierw powiązania, potem użytkownicy
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  console.log('🧹 BEZPIECZNE CZYSZCZENIE BAZY DANYCH');
  console.log('====================================');
  
  // 1. Sprawdzenie aktualnego stanu
  const allUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log(`📊 Aktualna liczba użytkowników: ${allUsers.count}`);
  
  const admins = db.prepare('SELECT id, username, email FROM users WHERE is_admin = 1').all();
  console.log(`👑 Aktualna liczba adminów: ${admins.length}`);
  
  admins.forEach(admin => {
    console.log(`   - ${admin.username} (${admin.email}) - ID: ${admin.id}`);
  });
  
  // Znajdź ID głównego admina (admin@wp.pl)
  const mainAdmin = db.prepare('SELECT id FROM users WHERE email = ? AND is_admin = 1').get('admin@wp.pl');
  if (!mainAdmin) {
    throw new Error('Nie znaleziono głównego konta admin@wp.pl');
  }
  
  console.log(`\n🎯 Główny admin ID: ${mainAdmin.id} (admin@wp.pl)`);
  
  // Znajdź ID użytkowników do usunięcia (wszyscy oprócz głównego admina)
  const usersToDelete = db.prepare('SELECT id FROM users WHERE id != ?').all(mainAdmin.id);
  const userIdsToDelete = usersToDelete.map(u => u.id);
  
  console.log(`\n🗑️ Do usunięcia: ${userIdsToDelete.length} użytkowników`);
  console.log('IDs:', userIdsToDelete.join(', '));
  
  console.log('\n🧹 KROK PO KROKU:');
  console.log('=================');
  
  // 2. Usunięcie sesji
  console.log('1. Usuwanie sesji...');
  if (userIdsToDelete.length > 0) {
    const placeholders = userIdsToDelete.map(() => '?').join(',');
    const deletedSessions = db.prepare(`DELETE FROM sessions WHERE user_id IN (${placeholders})`).run(...userIdsToDelete);
    console.log(`   ✅ Usunięto ${deletedSessions.changes} sesji`);
  }
  
  // 3. Usunięcie wiadomości
  console.log('2. Usuwanie wiadomości...');
  if (userIdsToDelete.length > 0) {
    const placeholders = userIdsToDelete.map(() => '?').join(',');
    const deletedMessages = db.prepare(`DELETE FROM messages WHERE user_id IN (${placeholders})`).run(...userIdsToDelete);
    console.log(`   ✅ Usunięto ${deletedMessages.changes} wiadomości`);
  }
  
  // 4. Usunięcie chat sessions
  console.log('3. Usuwanie sesji czatu...');
  if (userIdsToDelete.length > 0) {
    const placeholders = userIdsToDelete.map(() => '?').join(',');
    const deletedChats = db.prepare(`DELETE FROM chat_sessions WHERE user_id IN (${placeholders})`).run(...userIdsToDelete);
    console.log(`   ✅ Usunięto ${deletedChats.changes} sesji czatu`);
  }
  
  // 5. Usunięcie user_subscriptions (jeśli istnieje)
  console.log('4. Usuwanie subskrypcji...');
  try {
    if (userIdsToDelete.length > 0) {
      const placeholders = userIdsToDelete.map(() => '?').join(',');
      const deletedSubs = db.prepare(`DELETE FROM user_subscriptions WHERE user_id IN (${placeholders})`).run(...userIdsToDelete);
      console.log(`   ✅ Usunięto ${deletedSubs.changes} subskrypcji`);
    }
  } catch (e) {
    console.log('   ⚠️ Tabela user_subscriptions nie istnieje lub jest pusta');
  }
  
  // 6. Teraz bezpiecznie usuń użytkowników
  console.log('5. Usuwanie użytkowników...');
  if (userIdsToDelete.length > 0) {
    const placeholders = userIdsToDelete.map(() => '?').join(',');
    const deletedUsers = db.prepare(`DELETE FROM users WHERE id IN (${placeholders})`).run(...userIdsToDelete);
    console.log(`   ✅ Usunięto ${deletedUsers.changes} użytkowników`);
  }
  
  // 7. Sprawdzenie końcowego stanu
  console.log('\n📊 KOŃCOWY STAN BAZY:');
  console.log('====================');
  
  const finalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log(`👥 Pozostało użytkowników: ${finalUsers.count}`);
  
  const remainingUsers = db.prepare('SELECT id, username, email, is_admin FROM users').all();
  remainingUsers.forEach(user => {
    const role = user.is_admin ? '👑 ADMIN' : '👤 USER';
    console.log(`   ${role} ${user.username} (${user.email}) - ID: ${user.id}`);
  });
  
  const finalSessions = db.prepare('SELECT COUNT(*) as count FROM sessions').get();
  const finalMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get();
  const finalChats = db.prepare('SELECT COUNT(*) as count FROM chat_sessions').get();
  
  console.log(`💬 Pozostało sesji: ${finalSessions.count}`);
  console.log(`📝 Pozostało wiadomości: ${finalMessages.count}`);
  console.log(`💭 Pozostało sesji czatu: ${finalChats.count}`);
  
  console.log('\n✅ CZYSZCZENIE ZAKOŃCZONE POMYŚLNIE!');
  console.log('====================================');
  console.log('🎯 Baza danych jest teraz czysta!');
  console.log('🔑 Pozostało tylko główne konto: admin@wp.pl');
  console.log('🚀 System gotowy do przyjmowania prawdziwych użytkowników!');
  
  db.close();
  
} catch (error) {
  console.error('❌ Błąd podczas czyszczenia:', error.message);
  console.error(error.stack);
}