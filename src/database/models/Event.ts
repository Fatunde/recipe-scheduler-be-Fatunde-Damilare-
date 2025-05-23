import { db } from '../connection';
import { Event } from '../../types';

export class EventModel {
  static async create(event: Event): Promise<Event> {
    await db.run(
      'INSERT INTO events (id, userId, title, eventTime, createdAt) VALUES (?, ?, ?, ?, ?)',
      [event.id, event.userId, event.title, event.eventTime, event.createdAt]
    );
    return event;
  }

  static async findById(id: string): Promise<Event | undefined> {
    return db.get<Event>('SELECT * FROM events WHERE id = ?', [id]);
  }

  static async findByUserId(userId: string): Promise<Event[]> {
    return db.all<Event>(
      'SELECT * FROM events WHERE userId = ? ORDER BY eventTime ASC',
      [userId]
    );
  }

  static async findUpcomingByUserId(userId: string): Promise<Event[]> {
    const now = new Date().toISOString();
    return db.all<Event>(
      'SELECT * FROM events WHERE userId = ? AND eventTime > ? ORDER BY eventTime ASC',
      [userId, now]
    );
  }

  static async update(id: string, updates: Partial<Event>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    await db.run(
      `UPDATE events SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  }

  static async delete(id: string): Promise<boolean> {
    await db.run('DELETE FROM events WHERE id = ?', [id]);
    return true;
  }

  static async deleteByUserId(userId: string): Promise<boolean> {
    await db.run('DELETE FROM events WHERE userId = ?', [userId]);
    return true;
  }

  static async findExpiredEvents(beforeDate: string): Promise<Event[]> {
    return db.all<Event>(
      'SELECT * FROM events WHERE eventTime < ?',
      [beforeDate]
    );
  }

  static async count(): Promise<number> {
    const result = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM events');
    return result?.count || 0;
  }

  static async countByUserId(userId: string): Promise<number> {
    const result = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM events WHERE userId = ?',
      [userId]
    );
    return result?.count || 0;
  }
}