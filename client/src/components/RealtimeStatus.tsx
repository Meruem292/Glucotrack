import React, { useState, useEffect } from 'react';

interface HealthData {
  glucose: number | null;
  heartRate: number | null;
  spo2: number | null;
  timestamp: number | null;
}

interface RealtimeStatusProps {
  data: HealthData;
  isCalibrating?: boolean;
  isConnected: boolean;
}

export default function RealtimeStatus({ data, isCalibrating = false, isConnected }: RealtimeStatusProps) {
  const [statusMessage, setStatusMessage] = useState<string>('Connect your ESP32 device to start monitoring');

  useEffect(() => {
    if (isConnected) {
      if (isCalibrating) {
        setStatusMessage('Device is calibrating... Please wait');
      } else if (data.timestamp) {
        setStatusMessage('Data received successfully');
      } else {
        setStatusMessage('Device connected. Place your finger on the sensor to begin reading');
      }
    } else {
      setStatusMessage('Connect your ESP32 device to start monitoring');
    }
  }, [isConnected, isCalibrating, data.timestamp]);

  return (
    <div className="mb-4 space-y-4">
      <div className="flex items-center space-x-2">
        <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-destructive'}`}></div>
        <span className="text-sm text-muted-foreground">{statusMessage}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-muted p-4 text-center">
          <div className="mb-1 text-sm font-medium text-muted-foreground">Glucose</div>
          <div className="flex items-baseline justify-center">
            <div className="text-3xl font-semibold">
              {data.glucose !== null ? data.glucose : '0'}
            </div>
            <div className="ml-1 text-sm text-muted-foreground">mg/dL</div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-center">
          <div className="mb-1 text-sm font-medium text-muted-foreground">Heart Rate</div>
          <div className="flex items-baseline justify-center">
            <div className="text-3xl font-semibold">
              {data.heartRate !== null ? data.heartRate : '0'}
            </div>
            <div className="ml-1 text-sm text-muted-foreground">BPM</div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-center">
          <div className="mb-1 text-sm font-medium text-muted-foreground">SpO2</div>
          <div className="flex items-baseline justify-center">
            <div className="text-3xl font-semibold">
              {data.spo2 !== null ? data.spo2 : '0'}
            </div>
            <div className="ml-1 text-sm text-muted-foreground">%</div>
          </div>
        </div>
      </div>

      {data.timestamp && (
        <div className="text-center text-xs text-muted-foreground">
          Last updated: {new Date(data.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}