import React, { useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, Video, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  deviceName: string;
  onClose: () => void;
}

export function VideoPlayer({ videoUrl, deviceName, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const isRTSP = videoUrl.startsWith('rtsp://');
  const isHLS = videoUrl.includes('.m3u8');
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-4xl bg-card shadow-floating border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Live Video - {deviceName}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Video content */}
        <div className="p-4">
          <div className="relative bg-background rounded-lg overflow-hidden">
            {isRTSP ? (
              // RTSP streams need special handling
              <div className="aspect-video flex items-center justify-center bg-muted/30 border-2 border-dashed border-border">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    RTSP stream detected. Direct browser playback not supported.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    URL: {videoUrl}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(videoUrl)}
                  >
                    Copy Stream URL
                  </Button>
                </div>
              </div>
            ) : (
              // HTTP/HLS streams
              <video
                ref={videoRef}
                className="w-full aspect-video bg-black"
                controls
                autoPlay
                muted
                playsInline
                onError={(e) => {
                  console.error('Video playback error:', e);
                }}
              >
                <source src={videoUrl} type={isHLS ? 'application/x-mpegURL' : 'video/mp4'} />
                <p className="p-4 text-center text-muted-foreground">
                  Your browser does not support video playback.
                </p>
              </video>
            )}
          </div>

          {/* Stream info */}
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stream URL:</span>
                <span className="font-mono break-all">{videoUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protocol:</span>
                <span>{isRTSP ? 'RTSP' : isHLS ? 'HLS' : 'HTTP'}</span>
              </div>
            </div>
          </div>

          {/* Instructions for RTSP */}
          {isRTSP && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-medium text-sm mb-2 text-destructive">RTSP Stream Instructions</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Use VLC Media Player or similar software to view RTSP streams</p>
                <p>• Copy the stream URL and open it in your preferred media player</p>
                <p>• For web viewing, the stream needs to be converted to HLS or WebRTC</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}