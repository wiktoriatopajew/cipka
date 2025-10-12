// Sprawdzenie aktywnych sesji i duplikatów adminów
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  console.log('🔍 ANALIZA PROBLEMOWYCH KONT ADMIN');
  console.log('===================================');
  
  // Sprawdzenie wszystkich adminów
  const admins = db.prepare(`
    SELECT id, username, email, created_at, is_online, last_active
    FROM users 
    WHERE is_admin = 1
    ORDER BY created_at ASC
  `).all();
  
  console.log(`\n👑 Znalezione konta ADMIN: ${admins.length}`);
  admins.forEach((admin, index) => {
    const date = new Date(admin.created_at).toLocaleString('pl-PL');
    const lastActive = admin.last_active ? new Date(admin.last_active).toLocaleString('pl-PL') : 'Nigdy';
    console.log(`${index + 1}. ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Created: ${date}`);
    console.log(`   Last Active: ${lastActive}`);
    console.log(`   Online: ${admin.is_online ? '🟢 TAK' : '🔴 NIE'}`);
    console.log('');
  });
  
  // Sprawdzenie aktywnych sesji
  console.log('🔐 AKTYWNE SESJE ADMIN:');
  console.log('======================');
  
  const activeSessions = db.prepare(`
    SELECT s.*, u.username, u.email
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE u.is_admin = 1
    ORDER BY s.expires_at DESC
  `).all();
  
  if (activeSessions.length > 0) {
    activeSessions.forEach((session, index) => {
      const expires = new Date(session.expires_at).toLocaleString('pl-PL');
      const isActive = new Date(session.expires_at) > new Date();
      console.log(`${index + 1}. User: ${session.username} (${session.email})`);
      console.log(`   Session ID: ${session.session_id}`);
      console.log(`   Expires: ${expires}`);
      console.log(`   Status: ${isActive ? '✅ AKTYWNA' : '❌ WYGASŁA'}`);
      console.log('');
    });
  } else {
    console.log('Brak aktywnych sesji admin');
  }
  
  // Sprawdzenie duplikatów emaili
  console.log('📧 DUPLIKATY EMAILI:');
  console.log('===================');
  
  const emailDuplicates = db.prepare(`
    SELECT email, COUNT(*) as count
    FROM users
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  `).all();
  
  if (emailDuplicates.length > 0) {
    emailDuplicates.forEach(dup => {
      console.log(`❌ ${dup.email}: ${dup.count} kont`);
      
      const users = db.prepare(`
        SELECT id, username, created_at, is_admin
        FROM users
        WHERE email = ?
      `).all(dup.email);
      
      users.forEach(user => {
        const date = new Date(user.created_at).toLocaleString('pl-PL');
        const status = user.is_admin ? '👑 ADMIN' : '👤 USER';
        console.log(`   → ${user.username} (ID: ${user.id}) - ${date} - ${status}`);
      });
      console.log('');
    });
  } else {
    console.log('✅ Brak duplikatów emaili');
  }
  
  db.close();
  
} catch (error) {
  console.error('❌ Błąd:', error.message);
}