export interface Device {
  id: number;
  name: string;
  uniqueId: string;
  status: 'online' | 'offline' | 'unknown';
  lastUpdate: string;
  positionId: number;
  groupId: number;
  phone?: string;
  model?: string;
  category?: string;
  disabled: boolean;
}

export interface Position {
  id: number;
  deviceId: number;
  deviceTime: string;
  serverTime: string;
  valid: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  course: number;
  address?: string;
  accuracy?: number;
  network?: any;
  attributes: Record<string, any>;
}

export interface DeviceStatus {
  id: number;
  status: 'online' | 'idle' | 'offline';
  lastUpdate: Date;
  ignition: boolean;
  motion: boolean;
}

export interface TraccarCredentials {
  username: string;
  password: string;
  baseUrl: string;
}