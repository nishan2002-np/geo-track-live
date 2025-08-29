import React, { useState, useEffect } from 'react';
import { useTraccarData } from '../hooks/useTraccarData';
import { DarkMap } from '../components/DarkMap';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Satellite, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Navigation2,
  MapPin,
  Activity,
  Map as MapIcon
} from 'lucide-react';

const Index = () => {
  const {
    devices,
    positions,
    loading,
    error,
    selectedDevice,
    refreshData,
    getDeviceStatus,
    selectDevice,
  } = useTraccarData();

  const [showMap, setShowMap] = useState(true);
  const onlineDevices = devices.filter(device => getDeviceStatus(device) === 'online').length;

  if (loading && devices.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <Navigation2 className="h-8 w-8 mx-auto text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">GeoTrack Live</h1>
          <p className="text-muted-foreground">Connecting to Traccar server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-6 text-center max-w-md">
          <WifiOff className="h-8 w-8 mx-auto mb-3 text-destructive" />
          <h2 className="text-lg font-semibold mb-2">Connection Error</h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-surface border-b border-border/50 shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Satellite className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">GeoTrack Live</h1>
                <p className="text-xs text-muted-foreground">Real-time GPS Tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-gps-online">
                <Wifi className="h-4 w-4" />
                <span className="text-sm hidden sm:inline">Connected</span>
              </div>
              
              <Badge variant="outline" className="bg-gps-online/10 text-gps-online border-gps-online/20">
                {onlineDevices} Online
              </Badge>
              
              <Badge variant="outline">
                {devices.length} Total
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-1"
              >
                <MapIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{showMap ? 'Hide' : 'Show'} Map</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {showMap && positions.length > 0 && (
          <div className="mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <MapIcon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Live Tracking Map</h2>
                <Badge variant="secondary" className="ml-auto">
                  {positions.length} Active
                </Badge>
              </div>
              <div className="h-96 w-full">
                <DarkMap
                  devices={devices}
                  positions={positions}
                  selectedDevice={selectedDevice}
                  onDeviceSelect={selectDevice}
                  getDeviceStatus={getDeviceStatus}
                />
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Device List */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Navigation2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Device Fleet</h2>
              </div>
              
              <div className="space-y-3">
                {devices.map((device) => {
                  const position = positions.find(p => p.deviceId === device.id);
                  const status = getDeviceStatus(device);
                  const isSelected = selectedDevice?.id === device.id;
                  
                  return (
                    <Card 
                      key={device.id} 
                      className={`p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => selectDevice(device)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status === 'online' ? 'bg-gps-online' :
                            status === 'idle' ? 'bg-gps-idle' : 'bg-gps-offline'
                          } pulse-glow`} />
                          
                          <div>
                            <h3 className="font-medium">{device.name}</h3>
                            <p className="text-xs text-muted-foreground">{device.uniqueId}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant={
                            status === 'online' ? 'default' :
                            status === 'idle' ? 'secondary' : 'destructive'
                          } className="mb-1">
                            {status.toUpperCase()}
                          </Badge>
                          
                          {position && (
                            <div className="text-xs text-muted-foreground">
                              {Math.round(position.speed * 1.852)} km/h
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {position && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              <span>{new Date(position.serverTime).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          
                          {position.attributes.ignition !== undefined && (
                            <div className="mt-1 text-xs">
                              <span className={position.attributes.ignition ? 'text-gps-online' : 'text-muted-foreground'}>
                                Ignition: {position.attributes.ignition ? 'ON' : 'OFF'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
                
                {devices.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Navigation2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No devices found</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Statistics Panel */}
          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Fleet Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Devices</span>
                  <span className="font-semibold">{devices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Online</span>
                  <span className="font-semibold text-gps-online">{onlineDevices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Offline</span>
                  <span className="font-semibold text-gps-offline">{devices.length - onlineDevices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Positions</span>
                  <span className="font-semibold">{positions.length}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gps-online"></div>
                  <span className="text-sm">Traccar Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gps-online"></div>
                  <span className="text-sm">Auto-refresh: 5s</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm">Last update: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
