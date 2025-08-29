import { useState, useEffect, useCallback } from 'react';
import { Device, Position } from '../types/gps';
import { traccarApi } from '../services/traccarApi';
import { useToast } from './use-toast';

export function useTraccarData() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const { toast } = useToast();

  const fetchDevices = useCallback(async () => {
    try {
      const devicesData = await traccarApi.getDevices();
      setDevices(devicesData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch devices';
      setError(errorMessage);
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchPositions = useCallback(async () => {
    try {
      const positionsData = await traccarApi.getPositions();
      setPositions(positionsData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch positions';
      setError(errorMessage);
      console.error('Position fetch error:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchDevices(), fetchPositions()]);
  }, [fetchDevices, fetchPositions]);

  const getDevicePosition = useCallback((deviceId: number): Position | undefined => {
    return positions.find(pos => pos.deviceId === deviceId);
  }, [positions]);

  const getDeviceStatus = useCallback((device: Device): 'online' | 'idle' | 'offline' => {
    const position = getDevicePosition(device.id);
    return traccarApi.getDeviceStatus(device, position);
  }, [getDevicePosition]);

  const selectDevice = useCallback((device: Device | null) => {
    setSelectedDevice(device);
  }, []);

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };

    initializeData();
  }, [refreshData]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchPositions(); // Only refresh positions for better performance
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [loading, fetchPositions]);

  return {
    devices,
    positions,
    loading,
    error,
    selectedDevice,
    refreshData,
    getDevicePosition,
    getDeviceStatus,
    selectDevice,
  };
}