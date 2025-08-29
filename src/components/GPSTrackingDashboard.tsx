import React, { useState } from 'react';
import { useTraccarData } from '../hooks/useTraccarData';
import { MapView } from './MapView';
import { DeviceList } from './DeviceList';
import { TelemetryPanel } from './TelemetryPanel';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Satellite, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Menu,
  X,
  Navigation2,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

export function GPSTrackingDashboard() {
  const {
    devices,
    positions,
    loading,
    error,
    selectedDevice,
    refreshData,
    getDevicePosition,
    getDeviceStatus,
    selectDevice,
  } = useTraccarData();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [telemetryOpen, setTelemetryOpen] = useState(true);

  const selectedPosition = selectedDevice ? getDevicePosition(selectedDevice.id) : null;
  const selectedStatus = selectedDevice ? getDeviceStatus(selectedDevice) : null;

  const onlineDevices = devices.filter(device => getDeviceStatus(device) === 'online').length;
  const totalDevices = devices.length;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-surface border-b border-border/50 shadow-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Satellite className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">GeoTrack Live</h1>
                <p className="text-xs text-muted-foreground">Real-time GPS Tracking</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className="hidden sm:flex items-center gap-2">
              {error ? (
                <div className="flex items-center gap-1 text-destructive">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm">Disconnected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gps-online">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">Connected</span>
                </div>
              )}
            </div>

            {/* Device stats */}
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="bg-gps-online/10 text-gps-online border-gps-online/20">
                {onlineDevices} Online
              </Badge>
              <Badge variant="outline">
                {totalDevices} Total
              </Badge>
            </div>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "transition-all duration-300 border-r border-border/50",
          sidebarOpen ? "w-80" : "w-0",
          "lg:w-80 lg:block",
          !sidebarOpen && "lg:w-0"
        )}>
          <div className={cn(
            "h-full overflow-hidden",
            !sidebarOpen && "lg:hidden"
          )}>
            <DeviceList
              devices={devices}
              positions={positions}
              selectedDevice={selectedDevice}
              onDeviceSelect={selectDevice}
              getDeviceStatus={getDeviceStatus}
              getDevicePosition={getDevicePosition}
            />
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 relative">
          {loading && !positions.length ? (
            <div className="h-full flex items-center justify-center bg-muted/30">
              <div className="text-center space-y-4">
                <div className="animate-spin">
                  <Navigation2 className="h-8 w-8 mx-auto text-primary" />
                </div>
                <div>
                  <p className="font-medium">Connecting to GeoTrack...</p>
                  <p className="text-sm text-muted-foreground">Loading device positions</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center bg-destructive/5">
              <Card className="p-6 text-center border-destructive/20">
                <WifiOff className="h-8 w-8 mx-auto mb-3 text-destructive" />
                <h3 className="font-semibold mb-2 text-destructive">Connection Error</h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={refreshData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </Button>
              </Card>
            </div>
          ) : (
            <MapView
              devices={devices}
              positions={positions}
              selectedDevice={selectedDevice}
              onDeviceSelect={selectDevice}
              getDeviceStatus={getDeviceStatus}
            />
          )}
        </div>

        {/* Telemetry panel */}
        <div className={cn(
          "transition-all duration-300 border-l border-border/50",
          telemetryOpen ? "w-80" : "w-0",
          "hidden lg:block"
        )}>
          <div className={cn(
            "h-full overflow-hidden",
            !telemetryOpen && "hidden"
          )}>
            <TelemetryPanel
              selectedDevice={selectedDevice}
              position={selectedPosition}
              status={selectedStatus}
            />
          </div>
        </div>
      </div>

      {/* Mobile telemetry toggle */}
      <div className="lg:hidden">
        {selectedDevice && (
          <div className="border-t border-border/50 bg-gradient-surface">
            <Button
              variant="ghost"
              onClick={() => setTelemetryOpen(!telemetryOpen)}
              className="w-full py-3 rounded-none"
            >
              <Activity className="h-4 w-4 mr-2" />
              {selectedDevice.name} Telemetry
              {telemetryOpen ? <X className="h-4 w-4 ml-2" /> : <Menu className="h-4 w-4 ml-2" />}
            </Button>
            
            {telemetryOpen && (
              <div className="max-h-80 overflow-y-auto">
                <TelemetryPanel
                  selectedDevice={selectedDevice}
                  position={selectedPosition}
                  status={selectedStatus}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      <footer className="bg-gradient-surface border-t border-border/50 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Last update: {new Date().toLocaleTimeString()}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Auto-refresh: 5s</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gps-online"></div>
              <span>{onlineDevices} online</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gps-offline"></div>
              <span>{totalDevices - onlineDevices} offline</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}