import React from 'react';
import { Device, Position } from '../types/gps';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Navigation, 
  Circle, 
  Clock, 
  Fuel, 
  Zap,
  ChevronRight,
  MapPin,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

interface DeviceListProps {
  devices: Device[];
  positions: Position[];
  selectedDevice: Device | null;
  onDeviceSelect: (device: Device) => void;
  getDeviceStatus: (device: Device) => 'online' | 'idle' | 'offline';
  getDevicePosition: (deviceId: number) => Position | undefined;
}

export function DeviceList({
  devices,
  positions,
  selectedDevice,
  onDeviceSelect,
  getDeviceStatus,
  getDevicePosition,
}: DeviceListProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: 'online' | 'idle' | 'offline') => {
    switch (status) {
      case 'online': return 'bg-gps-online';
      case 'idle': return 'bg-gps-idle';
      case 'offline': return 'bg-gps-offline';
    }
  };

  const getStatusBadgeVariant = (status: 'online' | 'idle' | 'offline') => {
    switch (status) {
      case 'online': return 'default';
      case 'idle': return 'secondary';
      case 'offline': return 'destructive';
    }
  };

  return (
    <Card className="h-full bg-gradient-surface shadow-card border-border/50">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <Navigation className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Device Fleet</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {devices.length} devices • {positions.length} positions
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {devices.map((device) => {
            const position = getDevicePosition(device.id);
            const status = getDeviceStatus(device);
            const isSelected = selectedDevice?.id === device.id;

            return (
              <Button
                key={device.id}
                variant="ghost"
                className={cn(
                  "w-full p-0 h-auto justify-start transition-smooth",
                  isSelected && "bg-primary/10 border border-primary/20"
                )}
                onClick={() => onDeviceSelect(device)}
              >
                <Card className={cn(
                  "w-full p-3 shadow-none border-transparent bg-transparent hover:bg-muted/50 transition-smooth",
                  isSelected && "bg-primary/5"
                )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full flex-shrink-0 pulse-glow",
                          getStatusColor(status)
                        )} />
                        <h3 className="font-medium text-sm truncate">
                          {device.name}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(status)} className="text-xs px-2 py-0">
                          {status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {device.uniqueId}
                          </span>
                        </div>

                        {position && (
                          <>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(position.serverTime)}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                <span>{Math.round(position.speed * 1.852)} km/h</span>
                              </div>

                              {position.attributes.ignition !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Zap className={cn(
                                    "h-3 w-3",
                                    position.attributes.ignition ? "text-gps-online" : "text-muted-foreground"
                                  )} />
                                  <span className={position.attributes.ignition ? "text-gps-online" : ""}>
                                    {position.attributes.ignition ? "ON" : "OFF"}
                                  </span>
                                </div>
                              )}

                              {(position.attributes.fuel || position.attributes.fuelLevel) && (
                                <div className="flex items-center gap-1">
                                  <Fuel className="h-3 w-3" />
                                  <span>{position.attributes.fuel || position.attributes.fuelLevel}%</span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <ChevronRight className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isSelected && "rotate-90 text-primary"
                    )} />
                  </div>
                </Card>
              </Button>
            );
          })}

          {devices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Navigation className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No devices found</p>
              <p className="text-xs">Check your connection</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}