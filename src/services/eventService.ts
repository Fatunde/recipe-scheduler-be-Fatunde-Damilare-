import { v4 as uuidv4 } from 'uuid';
import { Event, CreateEventRequest, UpdateEventRequest } from '../types';
import { EventModel } from '../database/models/Event';
import { scheduleReminder, cancelReminder } from '../queue/reminder';

export class EventService {
  async createEvent(data: CreateEventRequest): Promise<Event> {
    const event: Event = {
      id: uuidv4(),
      userId: data.userId,
      title: data.title,
      eventTime: data.eventTime,
      createdAt: new Date().toISOString(),
    };

    await EventModel.create(event);

    // Schedule reminder
    await scheduleReminder({
      eventId: event.id,
      userId: event.userId,
      title: event.title,
      eventTime: event.eventTime,
    });

    return event;
  }

  async getUpcomingEvents(userId: string): Promise<Event[]> {
    return EventModel.findUpcomingByUserId(userId);
  }

  async getAllEvents(userId: string): Promise<Event[]> {
    return EventModel.findByUserId(userId);
  }

  async getEventById(id: string): Promise<Event | undefined> {
    return EventModel.findById(id);
  }

  async updateEvent(id: string, data: UpdateEventRequest): Promise<Event | null> {
    const event = await EventModel.findById(id);
    if (!event) return null;

    const success = await EventModel.update(id, data);
    if (!success) return null;

    const updatedEvent = await EventModel.findById(id);
    if (updatedEvent && data.eventTime) {
      // Reschedule reminder if time changed
      await cancelReminder(id);
      await scheduleReminder({
        eventId: updatedEvent.id,
        userId: updatedEvent.userId,
        title: updatedEvent.title,
        eventTime: updatedEvent.eventTime,
      });
    }

    return updatedEvent || null;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const event = await EventModel.findById(id);
    if (!event) return false;

    await EventModel.delete(id);
    await cancelReminder(id);
    return true;
  }

  async getUserEventCount(userId: string): Promise<number> {
    return EventModel.countByUserId(userId);
  }

  async cleanupExpiredEvents(beforeDate?: string): Promise<number> {
    const cutoffDate = beforeDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
    const expiredEvents = await EventModel.findExpiredEvents(cutoffDate);
    
    for (const event of expiredEvents) {
      await this.deleteEvent(event.id);
    }
    
    return expiredEvents.length;
  }
}

export const eventService = new EventService();