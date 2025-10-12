// Czyszczenie bazy danych na RENDER (PostgreSQL)
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { users, sessions, messages, chatSessions, userSubscriptions } = require('./shared/schema');
const { eq, ne, and } = require('drizzle-orm');

async function cleanRenderDatabase() {
  console.log('🧹 CZYSZCZENIE BAZY DANYCH NA RENDER');
  console.log('===================================');
  
  // Połączenie z PostgreSQL na Render
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('❌ Brak DATABASE_URL - uruchom na Render!');
  }
  
  console.log('🔗 Łączenie z PostgreSQL na Render...');
  const sql = postgres(connectionString);
  const db = drizzle(sql);
  
  try {
    // 1. Sprawdzenie aktualnego stanu
    console.log('\n📊 AKTUALNY STAN BAZY:');
    console.log('=====================');
    
    const allUsers = await db.select().from(users);
    console.log(`👥 Łączna liczba użytkowników: ${allUsers.length}`);
    
    const adminUsers = allUsers.filter(u => u.isAdmin);
    console.log(`👑 Liczba adminów: ${adminUsers.length}`);
    
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.username} (${admin.email}) - ID: ${admin.id}`);
    });
    
    // 2. Znajdź głównego admina
    const mainAdmin = allUsers.find(u => u.email === 'admin@wp.pl' && u.isAdmin);
    if (!mainAdmin) {
      throw new Error('❌ Nie znaleziono głównego konta admin@wp.pl');
    }
    
    console.log(`\n🎯 Główny admin: ${mainAdmin.username} (ID: ${mainAdmin.id})`);
    
    // 3. Użytkownicy do usunięcia (wszyscy oprócz głównego admina)
    const usersToDelete = allUsers.filter(u => u.id !== mainAdmin.id);
    console.log(`🗑️ Do usunięcia: ${usersToDelete.length} użytkowników`);
    
    console.log('\n🧹 ROZPOCZĘCIE CZYSZCZENIA:');
    console.log('===========================');
    
    // 4. Usunięcie powiązanych danych (w kolejności aby uniknąć FK errors)
    
    // a) Sesje
    console.log('1. Usuwanie sesji...');
    try {
      const deletedSessions = await db.delete(sessions)
        .where(ne(sessions.userId, mainAdmin.id));
      console.log(`   ✅ Usunięto sesje`);
    } catch (e) {
      console.log(`   ⚠️ Błąd sesji: ${e.message}`);
    }
    
    // b) Wiadomości
    console.log('2. Usuwanie wiadomości...');
    try {
      const deletedMessages = await db.delete(messages)
        .where(ne(messages.userId, mainAdmin.id));
      console.log(`   ✅ Usunięto wiadomości`);
    } catch (e) {
      console.log(`   ⚠️ Błąd wiadomości: ${e.message}`);
    }
    
    // c) Sesje czatu
    console.log('3. Usuwanie sesji czatu...');
    try {
      const deletedChats = await db.delete(chatSessions)
        .where(ne(chatSessions.userId, mainAdmin.id));
      console.log(`   ✅ Usunięto sesje czatu`);
    } catch (e) {
      console.log(`   ⚠️ Błąd sesji czatu: ${e.message}`);
    }
    
    // d) Subskrypcje
    console.log('4. Usuwanie subskrypcji...');
    try {
      const deletedSubs = await db.delete(userSubscriptions)
        .where(ne(userSubscriptions.userId, mainAdmin.id));
      console.log(`   ✅ Usunięto subskrypcje`);
    } catch (e) {
      console.log(`   ⚠️ Błąd subskrypcji: ${e.message}`);
    }
    
    // 5. Usunięcie użytkowników
    console.log('5. Usuwanie użytkowników...');
    const deletedUsers = await db.delete(users)
      .where(ne(users.id, mainAdmin.id));
    console.log(`   ✅ Usunięto użytkowników`);
    
    // 6. Sprawdzenie końcowego stanu
    console.log('\n📊 KOŃCOWY STAN BAZY:');
    console.log('====================');
    
    const finalUsers = await db.select().from(users);
    console.log(`👥 Pozostało użytkowników: ${finalUsers.length}`);
    
    finalUsers.forEach(user => {
      const role = user.isAdmin ? '👑 ADMIN' : '👤 USER';
      console.log(`   ${role} ${user.username} (${user.email})`);
    });
    
    console.log('\n✅ CZYSZCZENIE RENDER ZAKOŃCZONE!');
    console.log('=================================');
    console.log('🎯 Baza PostgreSQL na Render jest czysta!');
    console.log('🔑 Pozostało tylko: admin@wp.pl');
    console.log('🚀 Gotowe do przyjmowania prawdziwych użytkowników!');
    
  } catch (error) {
    console.error('❌ Błąd podczas czyszczenia Render:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

// Uruchomienie tylko jeśli to jest główny plik
if (require.main === module) {
  cleanRenderDatabase().catch(console.error);
}

module.exports = { cleanRenderDatabase };