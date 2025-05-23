export interface Event {
  id: string;
  userId: string;
  title: string;
  eventTime: string;
  createdAt: string;
}

export interface Device {
  id: string;
  userId: string;
  pushToken: string;
  createdAt: string;
}

export interface CreateEventRequest {
  userId: string;
  title: string;
  eventTime: string;
}

export interface UpdateEventRequest {
  title?: string;
  eventTime?: string;
}

export interface RegisterDeviceRequest {
  userId: string;
  pushToken: string;
}

export interface ReminderJob {
  eventId: string;
  userId: string;
  title: string;
  eventTime: string;
}