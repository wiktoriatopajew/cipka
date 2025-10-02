import Database from 'better-sqlite3';

try {
  const db = new Database('./database.sqlite');
  
  console.log('=== TABELE W BAZIE DANYCH ===');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  tables.forEach(table => console.log('- ' + table.name));
  
  console.log('\n=== LICZBA REKORDÓW W KAŻDEJ TABELI ===');
  
  // Sprawdź liczbę użytkowników
  try {
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
    console.log(`Użytkownicy (users): ${userCount.count}`);
  } catch (e) {
    console.log('Brak tabeli users lub błąd:', e.message);
  }
  
  // Sprawdź liczbę wiadomości
  try {
    const messageCount = db.prepare("SELECT COUNT(*) as count FROM messages").get();
    console.log(`Wiadomości (messages): ${messageCount.count}`);
  } catch (e) {
    console.log('Brak tabeli messages lub błąd:', e.message);
  }
  
  // Sprawdź liczbę sesji czatu
  try {
    const sessionCount = db.prepare("SELECT COUNT(*) as count FROM chat_sessions").get();
    console.log(`Sesje czatu (chat_sessions): ${sessionCount.count}`);
  } catch (e) {
    console.log('Brak tabeli chat_sessions lub błąd:', e.message);
  }
  
  // Sprawdź liczbę subskrypcji
  try {
    const subCount = db.prepare("SELECT COUNT(*) as count FROM subscriptions").get();
    console.log(`Subskrypcje (subscriptions): ${subCount.count}`);
  } catch (e) {
    console.log('Braz tabeli subscriptions lub błąd:', e.message);
  }
  
  // Sprawdź liczbę załączników
  try {
    const attachmentCount = db.prepare("SELECT COUNT(*) as count FROM attachments").get();
    console.log(`Załączniki (attachments): ${attachmentCount.count}`);
  } catch (e) {
    console.log('Brak tabeli attachments lub błąd:', e.message);
  }
  
  console.log('\n=== PRZYKŁADOWE WIADOMOŚCI (ostatnie 5) ===');
  try {
    const messages = db.prepare(`
      SELECT m.id, m.content, m.sender_type, m.created_at, u.username
      FROM messages m 
      LEFT JOIN users u ON m.sender_id = u.id 
      ORDER BY m.created_at DESC 
      LIMIT 5
    `).all();
    
    messages.forEach(msg => {
      console.log(`[${msg.created_at}] ${msg.username || 'Unknown'} (${msg.sender_type}): ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
    });
  } catch (e) {
    console.log('Błąd przy pobieraniu wiadomości:', e.message);
  }
  
  db.close();
} catch (error) {
  console.error('Błąd połączenia z bazą danych:', error.message);
}