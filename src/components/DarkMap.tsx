import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Device, Position } from '../types/gps';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different status
const createCustomIcon = (status: 'online' | 'idle' | 'offline') => {
  const colors = {
    online: '#22c55e',
    idle: '#eab308', 
    offline: '#ef4444'
  };

  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="10" fill="${colors[status]}" stroke="white" stroke-width="3"/>
        <circle cx="14" cy="14" r="5" fill="white"/>
        <circle cx="14" cy="14" r="2" fill="${colors[status]}"/>
      </svg>
    `)}`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Component to fit map to markers
function MapController({ 
  positions, 
  selectedDevice 
}: { 
  positions: Position[];
  selectedDevice: Device | null;
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
      const bounds = new L.LatLngBounds([]);
      positions.forEach(pos => {
        bounds.extend([pos.latitude, pos.longitude]);
      });
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { 
          padding: [20, 20],
          maxZoom: 15 
        });
      }
    }
  }, [map, positions, selectedDevice]);

  return null;
}

interface DarkMapProps {
  devices: Device[];
  positions: Position[];
  selectedDevice: Device | null;
  onDeviceSelect: (device: Device) => void;
  getDeviceStatus: (device: Device) => 'online' | 'idle' | 'offline';
}

export function DarkMap({
  devices,
  positions,
  selectedDevice,
  onDeviceSelect,
  getDeviceStatus,
}: DarkMapProps) {
  const mapRef = useRef<any>(null);

  // Default center (Kathmandu, Nepal)
  const center: [number, number] = positions.length > 0 
    ? [positions[0].latitude, positions[0].longitude]
    : [27.7172, 85.3240];

  return (
    <div className="h-full w-full relative rounded-lg overflow-hidden border border-border/50">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={13}
        className="h-full w-full"
        style={{ background: 'hsl(var(--background))' }}
        zoomControl={false}
      >
        {/* Dark theme OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          className="map-tiles"
        />

        <MapController 
          positions={positions} 
          selectedDevice={selectedDevice}
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
                className="dark-popup"
                minWidth={280}
                maxWidth={350}
                closeButton={true}
              >
                <div className="p-2 text-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-base">{device.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'online' ? 'bg-green-100 text-green-800' :
                      status === 'idle' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">Speed:</span>
                        <p className="font-semibold">{Math.round(position.speed * 1.852)} km/h</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Course:</span>
                        <p className="font-semibold">{position.course}°</p>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <span className="text-gray-600">Coordinates:</span>
                      <p className="font-mono text-xs bg-gray-100 p-1 rounded mt-1">
                        {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
                      </p>
                    </div>
                    
                    <div className="text-xs">
                      <span className="text-gray-600">Last Update:</span>
                      <p className="font-medium">{new Date(position.serverTime).toLocaleString()}</p>
                    </div>
                    
                    {position.attributes.ignition !== undefined && (
                      <div className="text-xs">
                        <span className="text-gray-600">Ignition:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          position.attributes.ignition ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {position.attributes.ignition ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    )}
                    
                    {(position.attributes.fuel || position.attributes.fuelLevel) && (
                      <div className="text-xs">
                        <span className="text-gray-600">Fuel:</span>
                        <span className="ml-2 font-semibold">{position.attributes.fuel || position.attributes.fuelLevel}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Custom zoom controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1">
        <button
          onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() + 1)}
          className="w-8 h-8 bg-card/90 backdrop-blur-sm border border-border/50 rounded flex items-center justify-center hover:bg-muted transition-colors"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() - 1)}
          className="w-8 h-8 bg-card/90 backdrop-blur-sm border border-border/50 rounded flex items-center justify-center hover:bg-muted transition-colors"
        >
          −
        </button>
      </div>

      {/* Map legend */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border/50">
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