import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { ReminderJob } from '../types';
import { pushService } from '../services/pushService';

const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const reminderQueue = new Queue<ReminderJob>('reminder', {
  connection: redis,
});

export async function scheduleReminder(job: ReminderJob): Promise<void> {
  const eventTime = new Date(job.eventTime);
  const leadMinutes = parseInt(process.env.REMINDER_LEAD_MINUTES || '15');
  const reminderTime = new Date(eventTime.getTime() - (leadMinutes * 60 * 1000));
  
  const delay = reminderTime.getTime() - Date.now();
  
  if (delay <= 0) {
    console.log(`Event ${job.eventId} is too soon for reminder`);
    return;
  }

  await reminderQueue.add(
    'send-reminder',
    job,
    {
      delay,
      jobId: job.eventId, // Use eventId as jobId for easy cancellation
      removeOnComplete: 10,
      removeOnFail: 5,
    }
  );

  console.log(`⏰ Reminder scheduled for ${job.title} at ${reminderTime.toISOString()}`);
}

export async function cancelReminder(eventId: string): Promise<void> {
  try {
    const job = await reminderQueue.getJob(eventId);
    if (job) {
      await job.remove();
      console.log(`🗑️ Cancelled reminder for event ${eventId}`);
    }
  } catch (error) {
    console.error('Error cancelling reminder:', error);
  }
}

// Worker will be started in separate process
export function createReminderWorker(): Worker<ReminderJob> {
  return new Worker<ReminderJob>(
    'reminder',
    async (job: Job<ReminderJob>) => {
      console.log(`🔔 Processing reminder for: ${job.data.title}`);
      
      await pushService.sendReminder(
        job.data.userId,
        job.data.title,
        job.data.eventTime
      );
      
      console.log(`✅ Reminder sent for event: ${job.data.eventId}`);
    },
    {
      connection: redis,
    }
  );
}