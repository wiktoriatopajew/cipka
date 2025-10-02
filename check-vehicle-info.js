import { db } from './server/db';
import { chatSessions } from './shared/schema';
import { eq } from 'drizzle-orm';

async function checkVehicleInfo() {
  try {
    // Pobierz najnowszą sesję
    const sessions = await db.select().from(chatSessions)
      .orderBy(chatSessions.createdAt)
      .limit(5);
      
    console.log('Last 5 chat sessions:');
    sessions.forEach(session => {
      console.log(`ID: ${session.id}`);
      console.log(`User ID: ${session.userId}`);
      console.log(`Vehicle Info: ${session.vehicleInfo}`);
      console.log(`Created: ${session.createdAt}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkVehicleInfo();
