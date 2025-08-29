import axios, { AxiosInstance } from 'axios';
import { Device, Position, TraccarCredentials } from '../types/gps';

export class TraccarApi {
  private api: AxiosInstance;
  private credentials: TraccarCredentials;

  constructor(credentials: TraccarCredentials) {
    this.credentials = credentials;
    this.api = axios.create({
      baseURL: credentials.baseUrl,
      auth: {
        username: credentials.username,
        password: credentials.password,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getDevices(): Promise<Device[]> {
    try {
      const response = await this.api.get('/devices');
      return response.data;
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
  }

  async getPositions(): Promise<Position[]> {
    try {
      const response = await this.api.get('/positions');
      return response.data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  }

  async getDevicePositions(deviceId: number): Promise<Position[]> {
    try {
      const response = await this.api.get(`/positions?deviceId=${deviceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching device positions:', error);
      throw error;
    }
  }

  resolveMediaUrl(attributes: Record<string, any>, positionId?: number): string | null {
    // Handle different media URL formats
    if (attributes.image) {
      return this.resolveUrl(attributes.image, positionId);
    }
    if (attributes.photo) {
      return this.resolveUrl(attributes.photo, positionId);
    }
    if (attributes.video) {
      return this.resolveUrl(attributes.video, positionId);
    }
    if (attributes.media) {
      return this.resolveUrl(attributes.media, positionId);
    }
    return null;
  }

  private resolveUrl(url: string | number, positionId?: number): string {
    if (typeof url === 'number') {
      return `${this.credentials.baseUrl}/media/${url}`;
    }
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    if (url.startsWith('/api/media/')) {
      return `${this.credentials.baseUrl}${url}`;
    }
    
    if (positionId && url.includes('positions')) {
      return `${this.credentials.baseUrl}/api/media/positions/${positionId}`;
    }
    
    return `${this.credentials.baseUrl}/api/media/${url}`;
  }

  getDeviceStatus(device: Device, position?: Position): 'online' | 'idle' | 'offline' {
    if (!position || device.status === 'offline') return 'offline';
    
    const lastUpdate = new Date(position.serverTime);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    if (diffMinutes > 30) return 'offline';
    if (position.attributes.ignition === false && position.speed < 5) return 'idle';
    return 'online';
  }

  formatCoordinates(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  formatSpeed(speed: number): string {
    // Convert from knots to km/h
    const kmh = speed * 1.852;
    return `${kmh.toFixed(1)} km/h`;
  }

  formatAttributes(attributes: Record<string, any>): Record<string, any> {
    const formatted: Record<string, any> = {};
    
    Object.entries(attributes).forEach(([key, value]) => {
      switch (key) {
        case 'fuel':
        case 'fuelLevel':
          formatted['Fuel Level'] = `${value}%`;
          break;
        case 'batteryLevel':
          formatted['Battery'] = `${value}%`;
          break;
        case 'temperature':
          formatted['Temperature'] = `${value}°C`;
          break;
        case 'ignition':
          formatted['Ignition'] = value ? 'ON' : 'OFF';
          break;
        case 'motion':
          formatted['Motion'] = value ? 'Moving' : 'Stopped';
          break;
        case 'blocked':
          formatted['Status'] = value ? 'Blocked' : 'Active';
          break;
        default:
          formatted[key] = value;
      }
    });
    
    return formatted;
  }
}

// Default instance with provided credentials
export const traccarApi = new TraccarApi({
  username: 'nishan@geotrack.com.np',
  password: '12345',
  baseUrl: 'https://system.geotrack.com.np/api',
});