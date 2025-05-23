import dotenv from 'dotenv';
import { createReminderWorker } from './queue/reminder';
import { initializeDatabase } from './database/connection';

dotenv.config();

async function startWorker() {
  console.log('🔧 Initializing worker...');
  
  await initializeDatabase();
  
  const worker = createReminderWorker();
  
  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });
  
  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });
  
  console.log('Worker started - listening for reminder jobs...');
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down worker...');
    await worker.close();
    process.exit(0);
  });
}

startWorker().catch(console.error);