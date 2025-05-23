import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { deviceService } from './deviceService';

export class PushService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN,
    });
  }

  async sendReminder(userId: string, title: string, eventTime: string): Promise<void> {
    const devices = await deviceService.getDevicesByUserId(userId);
    
    if (devices.length === 0) {
      console.log(`No devices found for user ${userId}`);
      return;
    }

    const messages: ExpoPushMessage[] = devices
      .filter(device => Expo.isExpoPushToken(device.pushToken))
      .map(device => ({
        to: device.pushToken,
        sound: 'default',
        title: 'Event Reminder',
        body: `${title} is starting soon!`,
        data: { 
          title, 
          eventTime,
          type: 'event_reminder'
        },
      }));

    if (messages.length === 0) {
      console.log(`No valid push tokens for user ${userId}`);
      return;
    }

    try {
      // If no access token, just log the payload
      if (!process.env.EXPO_ACCESS_TOKEN) {
        console.log('📱 Push notification (simulated):', {
          userId,
          title,
          eventTime,
          deviceCount: messages.length,
          messages
        });
        return;
      }

      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      console.log(`✅ Sent ${tickets.length} push notifications for user ${userId}`);
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
    }
  }
}

export const pushService = new PushService();