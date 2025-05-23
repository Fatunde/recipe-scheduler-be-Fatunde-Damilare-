import { v4 as uuidv4 } from 'uuid';
import { Device, RegisterDeviceRequest } from '../types';
import { DeviceModel } from '../database/models/Device';

export class DeviceService {
  async registerDevice(data: RegisterDeviceRequest): Promise<Device> {
    // Check if device already exists
    const existing = await DeviceModel.findByUserIdAndToken(data.userId, data.pushToken);
    
    if (existing) {
      return existing;
    }

    const device: Device = {
      id: uuidv4(),
      userId: data.userId,
      pushToken: data.pushToken,
      createdAt: new Date().toISOString(),
    };

    await DeviceModel.create(device);
    return device;
  }

  async getDevicesByUserId(userId: string): Promise<Device[]> {
    return DeviceModel.findByUserId(userId);
  }

  async getDeviceById(id: string): Promise<Device | undefined> {
    return DeviceModel.findById(id);
  }

  async updateDevice(id: string, updates: Partial<Device>): Promise<Device | null> {
    const success = await DeviceModel.update(id, updates);
    if (!success) return null;
    
    const device = await DeviceModel.findById(id);
    if(device) return device;
    return null;
  }

  async deleteDevice(id: string): Promise<boolean> {
    return DeviceModel.delete(id);
  }

  async deleteDevicesByUserId(userId: string): Promise<boolean> {
    return DeviceModel.deleteByUserId(userId);
  }

  async deleteDeviceByToken(pushToken: string): Promise<boolean> {
    return DeviceModel.deleteByPushToken(pushToken);
  }

  async getUserDeviceCount(userId: string): Promise<number> {
    return DeviceModel.countByUserId(userId);
  }

  async getAllDevices(): Promise<Device[]> {
    return DeviceModel.findAll();
  }

  async getTotalDeviceCount(): Promise<number> {
    return DeviceModel.count();
  }

  async getUniqueUserIds(): Promise<string[]> {
    return DeviceModel.getUniqueUserIds();
  }
}

export const deviceService = new DeviceService();