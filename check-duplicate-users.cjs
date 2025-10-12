const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { users } = require('./shared/schema');

const sqlite = new Database('./database.sqlite');
const db = drizzle(sqlite);

try {
  const allUsers = db.select().from(users).all();
  
  console.log('=== WSZYSCY UŻYTKOWNICY ===');
  allUsers.forEach(user => {
    const createdDate = new Date(user.createdAt).toLocaleString('pl-PL');
    console.log(`ID: ${user.id} | Email: ${user.email} | Created: ${createdDate} | Name: ${user.name || 'brak'}`);
  });

  console.log(`\nŁącznie: ${allUsers.length} użytkowników`);
  
  // Sprawdzenie duplikatów emaili
  const emailCounts = {};
  allUsers.forEach(user => {
    emailCounts[user.email] = (emailCounts[user.email] || 0) + 1;
  });
  
  console.log('\n=== DUPLIKATY EMAILI ===');
  Object.entries(emailCounts).forEach(([email, count]) => {
    if (count > 1) {
      console.log(`❌ ${email}: ${count} kont`);
      const duplicates = allUsers.filter(u => u.email === email);
      duplicates.forEach(dup => {
        console.log(`   → ID: ${dup.id}, Created: ${new Date(dup.createdAt).toLocaleString('pl-PL')}`);
      });
    }
  });

} catch (error) {
  console.error('Błąd:', error.message);
}

sqlite.close();