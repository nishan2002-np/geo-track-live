import React from 'react';

export function GPSTrackingDashboard() {
  return (
    <div className="h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">GeoTrack Live</h1>
        <p className="text-xl text-muted-foreground">GPS Tracking Dashboard</p>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}