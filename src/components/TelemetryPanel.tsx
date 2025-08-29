import React from 'react';
import { Device, Position } from '../types/gps';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Gauge, 
  Navigation, 
  Fuel, 
  Zap, 
  Thermometer, 
  MapPin,
  Clock,
  Activity,
  Battery,
  Signal
} from 'lucide-react';
import { traccarApi } from '../services/traccarApi';

interface TelemetryPanelProps {
  selectedDevice: Device | null;
  position: Position | null;
  status: 'online' | 'idle' | 'offline' | null;
}

export function TelemetryPanel({ selectedDevice, position, status }: TelemetryPanelProps) {
  if (!selectedDevice || !position) {
    return (
      <Card className="bg-gradient-surface shadow-card border-border/50 p-6">
        <div className="text-center text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select a device to view telemetry</p>
        </div>
      </Card>
    );
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status: 'online' | 'idle' | 'offline') => {
    switch (status) {
      case 'online': return 'text-gps-online';
      case 'idle': return 'text-gps-idle';
      case 'offline': return 'text-gps-offline';
    }
  };

  const speed = Math.round(position.speed * 1.852); // Convert knots to km/h
  const fuelLevel = position.attributes.fuel || position.attributes.fuelLevel;
  const batteryLevel = position.attributes.batteryLevel;
  const temperature = position.attributes.temperature;
  const ignition = position.attributes.ignition;

  return (
    <Card className="bg-gradient-surface shadow-card border-border/50">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{selectedDevice.name}</h3>
          <Badge variant={status === 'online' ? 'default' : status === 'idle' ? 'secondary' : 'destructive'}>
            {status?.toUpperCase()}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">Real-time telemetry data</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Speed gauge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Speed</span>
            </div>
            <span className="text-lg font-bold">{speed} km/h</span>
          </div>
          <Progress value={Math.min(speed, 120)} max={120} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>120 km/h</span>
          </div>
        </div>

        <Separator />

        {/* Primary metrics grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Navigation className="h-3 w-3" />
              <span>Course</span>
            </div>
            <p className="text-lg font-semibold">{position.course}°</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="h-3 w-3" />
              <span>Altitude</span>
            </div>
            <p className="text-lg font-semibold">{Math.round(position.altitude)}m</p>
          </div>
        </div>

        {/* Fuel level */}
        {fuelLevel !== undefined && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Fuel Level</span>
                </div>
                <span className="text-lg font-bold">{fuelLevel}%</span>
              </div>
              <Progress value={fuelLevel} className="h-2" />
            </div>
          </>
        )}

        {/* Battery level */}
        {batteryLevel !== undefined && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Battery</span>
                </div>
                <span className="text-lg font-bold">{batteryLevel}%</span>
              </div>
              <Progress value={batteryLevel} className="h-2" />
            </div>
          </>
        )}

        <Separator />

        {/* Status indicators */}
        <div className="space-y-3">
          {ignition !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Ignition</span>
              </div>
              <Badge variant={ignition ? 'default' : 'secondary'}>
                {ignition ? 'ON' : 'OFF'}
              </Badge>
            </div>
          )}

          {temperature !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                <span className="text-sm">Temperature</span>
              </div>
              <span className="font-medium">{temperature}°C</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Signal className="h-4 w-4" />
              <span className="text-sm">Accuracy</span>
            </div>
            <span className="font-medium">{position.accuracy || 'N/A'}m</span>
          </div>
        </div>

        <Separator />

        {/* Timestamps */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last Update</span>
            </div>
            <span className="font-mono">{formatTime(position.serverTime)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Device Time</span>
            <span className="font-mono">{formatTime(position.deviceTime)}</span>
          </div>
        </div>

        {/* Coordinates */}
        <div className="p-3 bg-muted/30 rounded border">
          <div className="text-xs text-muted-foreground mb-1">Coordinates</div>
          <div className="font-mono text-xs">
            {traccarApi.formatCoordinates(position.latitude, position.longitude)}
          </div>
        </div>
      </div>
    </Card>
  );
}