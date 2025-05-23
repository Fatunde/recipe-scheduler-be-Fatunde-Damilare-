import { db } from '../connection';
import { Device } from '../../types';

export class DeviceModel {
  static async create(device: Device): Promise<Device> {
    await db.run(
      'INSERT INTO devices (id, userId, pushToken, createdAt) VALUES (?, ?, ?, ?)',
      [device.id, device.userId, device.pushToken, device.createdAt]
    );
    return device;
  }

  static async findById(id: string): Promise<Device | undefined> {
    return db.get<Device>('SELECT * FROM devices WHERE id = ?', [id]);
  }

  static async findByUserId(userId: string): Promise<Device[]> {
    return db.all<Device>(
      'SELECT * FROM devices WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
  }

  static async findByUserIdAndToken(userId: string, pushToken: string): Promise<Device | undefined> {
    return db.get<Device>(
      'SELECT * FROM devices WHERE userId = ? AND pushToken = ?',
      [userId, pushToken]
    );
  }

  static async findByPushToken(pushToken: string): Promise<Device | undefined> {
    return db.get<Device>('SELECT * FROM devices WHERE pushToken = ?', [pushToken]);
  }

  static async update(id: string, updates: Partial<Device>): Promise<boolean> {
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
      `UPDATE devices SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  }

  static async delete(id: string): Promise<boolean> {
    await db.run('DELETE FROM devices WHERE id = ?', [id]);
    return true;
  }

  static async deleteByUserId(userId: string): Promise<boolean> {
    await db.run('DELETE FROM devices WHERE userId = ?', [userId]);
    return true;
  }

  static async deleteByPushToken(pushToken: string): Promise<boolean> {
    await db.run('DELETE FROM devices WHERE pushToken = ?', [pushToken]);
    return true;
  }

  static async findAll(): Promise<Device[]> {
    return db.all<Device>('SELECT * FROM devices ORDER BY createdAt DESC');
  }

  static async count(): Promise<number> {
    const result = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM devices');
    return result?.count || 0;
  }

  static async countByUserId(userId: string): Promise<number> {
    const result = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM devices WHERE userId = ?',
      [userId]
    );
    return result?.count || 0;
  }

  static async getUniqueUserIds(): Promise<string[]> {
    const result = await db.all<{ userId: string }>('SELECT DISTINCT userId FROM devices');
    return result.map(row => row.userId);
  }
}