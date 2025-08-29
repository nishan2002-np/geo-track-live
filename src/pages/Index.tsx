import React from 'react';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">GeoTrack Live</h1>
        <p className="text-xl text-muted-foreground">Real-time GPS Tracking Dashboard</p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
          <p className="text-sm text-muted-foreground">System Ready</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
