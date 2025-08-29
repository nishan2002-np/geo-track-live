import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Device, Position } from '../types/gps';
import { DevicePopup } from './DevicePopup';
import { Icon, LatLngBounds, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icons
const createCustomIcon = (status: 'online' | 'idle' | 'offline') => {
  const colors = {
    online: '#22c55e',
    idle: '#eab308', 
    offline: '#ef4444'
  };

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="${colors[status]}" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
      </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Component to fit map to markers
function MapController({ 
  positions, 
  selectedDevice,
  devices 
}: { 
  positions: Position[];
  selectedDevice: Device | null;
  devices: Device[];
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedDevice) {
      const position = positions.find(p => p.deviceId === selectedDevice.id);
      if (position) {
        map.setView([position.latitude, position.longitude], 16, {
          animate: true,
          duration: 1
        });
      }
    } else if (positions.length > 0) {
      const bounds = new LatLngBounds([]);
      positions.forEach(pos => {
        bounds.extend([pos.latitude, pos.longitude]);
      });
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { 
          padding: [20, 20],
          maxZoom: 16 
        });
      }
    }
  }, [map, positions, selectedDevice]);

  return null;
}

interface MapViewProps {
  devices: Device[];
  positions: Position[];
  selectedDevice: Device | null;
  onDeviceSelect: (device: Device) => void;
  getDeviceStatus: (device: Device) => 'online' | 'idle' | 'offline';
}

export function MapView({
  devices,
  positions,
  selectedDevice,
  onDeviceSelect,
  getDeviceStatus,
}: MapViewProps) {
  const mapRef = useRef<any>(null);
  const [deviceRoutes, setDeviceRoutes] = useState<Record<number, LatLngTuple[]>>({});

  // Get route history for selected device (simplified - last 20 positions)
  useEffect(() => {
    if (selectedDevice) {
      // In a real app, you'd fetch historical positions from the API
      // For now, we'll just show the current position
      const position = positions.find(p => p.deviceId === selectedDevice.id);
      if (position) {
        setDeviceRoutes(prev => ({
          ...prev,
          [selectedDevice.id]: [[position.latitude, position.longitude]]
        }));
      }
    }
  }, [selectedDevice, positions]);

  const center: LatLngTuple = positions.length > 0 
    ? [positions[0].latitude, positions[0].longitude]
    : [27.7172, 85.3240]; // Kathmandu default

  return (
    <div className="h-full w-full relative">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={13}
        className="h-full w-full rounded-lg"
        style={{ background: 'hsl(var(--background))' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController 
          positions={positions} 
          selectedDevice={selectedDevice}
          devices={devices}
        />

        {/* Device markers */}
        {positions.map((position) => {
          const device = devices.find(d => d.id === position.deviceId);
          if (!device) return null;

          const status = getDeviceStatus(device);

          return (
            <Marker
              key={`${device.id}-${position.id}`}
              position={[position.latitude, position.longitude]}
              icon={createCustomIcon(status)}
              eventHandlers={{
                click: () => onDeviceSelect(device),
              }}
            >
              <Popup 
                className="custom-popup"
                minWidth={300}
                maxWidth={400}
                closeButton={true}
              >
                <DevicePopup 
                  device={device}
                  position={position}
                  status={status}
                />
              </Popup>
            </Marker>
          );
        })}

        {/* Route polyline for selected device */}
        {selectedDevice && 
         deviceRoutes[selectedDevice.id] && 
         deviceRoutes[selectedDevice.id].length > 1 && (
          <Polyline
            positions={deviceRoutes[selectedDevice.id]}
            pathOptions={{
              color: '#0ea5e9',
              weight: 3,
              opacity: 0.8,
            }}
          />
        )}
      </MapContainer>

      {/* Map overlay info */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-floating border border-border/50">
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gps-online"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gps-idle"></div>
              <span>Idle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gps-offline"></div>
              <span>Offline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}