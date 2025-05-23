import { z } from 'zod';

export const createEventSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  eventTime: z.string().datetime('Invalid ISO datetime'),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  eventTime: z.string().datetime().optional(),
}).refine(data => data.title || data.eventTime, {
  message: 'At least one field (title or eventTime) must be provided',
});

export const registerDeviceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  pushToken: z.string().min(1, 'Push token is required'),
});

export const getUserEventsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});