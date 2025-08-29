import React, { useState } from 'react';
import { Device, Position } from '../types/gps';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { VideoPlayer } from './VideoPlayer';
import { traccarApi } from '../services/traccarApi';
import {
  MapPin,
  Clock,
  Navigation,
  Gauge,
  Fuel,
  Zap,
  Thermometer,
  Camera,
  Video,
  Eye,
  ExternalLink
} from 'lucide-react';

interface DevicePopupProps {
  device: Device;
  position: Position;
  status: 'online' | 'idle' | 'offline';
}

export function DevicePopup({ device, position, status }: DevicePopupProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: 'online' | 'idle' | 'offline') => {
    switch (status) {
      case 'online': return 'text-gps-online';
      case 'idle': return 'text-gps-idle';
      case 'offline': return 'text-gps-offline';
    }
  };

  const formatAttributes = traccarApi.formatAttributes(position.attributes);
  const mediaUrl = traccarApi.resolveMediaUrl(position.attributes, position.id);
  const hasVideo = position.attributes.video || position.attributes.stream;
  const hasImage = position.attributes.image || position.attributes.photo;

  const getFuelLevel = () => {
    return position.attributes.fuel || position.attributes.fuelLevel || null;
  };

  const renderFuelBar = () => {
    const fuelLevel = getFuelLevel();
    if (fuelLevel === null) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Fuel className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Fuel Level</span>
          </div>
          <span className="text-sm font-semibold">{fuelLevel}%</span>
        </div>
        <Progress 
          value={fuelLevel} 
          className="h-2"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4 p-2">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{device.name}</h3>
          <Badge variant={status === 'online' ? 'default' : status === 'idle' ? 'secondary' : 'destructive'}>
            {status.toUpperCase()}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">ID: {device.uniqueId}</p>
      </div>

      {/* Basic info grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last Update</span>
          </div>
          <p className="font-medium">{formatTime(position.serverTime)}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Gauge className="h-3 w-3" />
            <span>Speed</span>
          </div>
          <p className="font-medium">{traccarApi.formatSpeed(position.speed)}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Navigation className="h-3 w-3" />
            <span>Course</span>
          </div>
          <p className="font-medium">{position.course}°</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>Accuracy</span>
          </div>
          <p className="font-medium">{position.accuracy || 'N/A'}m</p>
        </div>
      </div>

      {/* Coordinates */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPin className="h-3 w-3" />
          <span>Coordinates</span>
        </div>
        <p className="font-mono text-xs bg-muted p-2 rounded">
          {traccarApi.formatCoordinates(position.latitude, position.longitude)}
        </p>
      </div>

      {/* Fuel level progress bar */}
      {getFuelLevel() !== null && (
        <>
          <Separator />
          {renderFuelBar()}
        </>
      )}

      {/* Status indicators */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {position.attributes.ignition !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Ignition</span>
            </div>
            <Badge 
              variant={position.attributes.ignition ? 'default' : 'secondary'}
              className="text-xs"
            >
              {position.attributes.ignition ? 'ON' : 'OFF'}
            </Badge>
          </div>
        )}

        {position.attributes.temperature !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              <span>Temperature</span>
            </div>
            <span className="font-medium">{position.attributes.temperature}°C</span>
          </div>
        )}
      </div>

      {/* Media section */}
      {(hasImage || hasVideo || mediaUrl) && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-1">
              <Camera className="h-4 w-4" />
              Media
            </h4>
            
            <div className="flex gap-2">
              {hasImage && mediaUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowImage(true)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View Photo
                </Button>
              )}
              
              {hasVideo && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowVideo(true)}
                  className="flex items-center gap-1"
                >
                  <Video className="h-3 w-3" />
                  Live Video
                </Button>
              )}

              {mediaUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(mediaUrl, '_blank')}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </Button>
              )}
            </div>

            {showImage && mediaUrl && (
              <div className="mt-2">
                <img 
                  src={mediaUrl} 
                  alt="Device photo"
                  className="w-full max-w-[300px] rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Detailed attributes */}
      {Object.keys(formatAttributes).length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Telemetry Data</h4>
            <Card className="p-3 bg-muted/30">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono overflow-x-auto">
                {JSON.stringify(formatAttributes, null, 2)}
              </pre>
            </Card>
          </div>
        </>
      )}

      {/* Video player modal */}
      {showVideo && hasVideo && (
        <VideoPlayer
          videoUrl={position.attributes.video || position.attributes.stream}
          deviceName={device.name}
          onClose={() => setShowVideo(false)}
        />
      )}
    </div>
  );
}