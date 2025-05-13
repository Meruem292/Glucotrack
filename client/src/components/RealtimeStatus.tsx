import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

interface Reading {
  glucose: number;
  heartRate: number;
  spo2: number;
  timestamp: number | string;
}

interface RealtimeStatusProps {
  isConnected: boolean;
}

export default function RealtimeStatus({ isConnected }: RealtimeStatusProps) {
  const [statusMessage, setStatusMessage] = useState<string>('Connect your device to start monitoring');
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  
  const auth = getAuth();
  const database = getDatabase();
  
  // For demo mode
  useEffect(() => {
    if (demoMode) {
      const interval = setInterval(() => {
        setLatestReading({
          glucose: Math.floor(Math.random() * 40 + 80), // 80-120
          heartRate: Math.floor(Math.random() * 20 + 65), // 65-85
          spo2: Math.floor(Math.random() * 5 + 95), // 95-100
          timestamp: Date.now()
        });
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [demoMode]);
  
  // For real readings
  useEffect(() => {
    if (demoMode) return; // Skip if in demo mode
    
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Listen to latest reading
    const readingsRef = ref(database, `users/${userId}/readings`);
    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Get last reading
        const readings = Object.values(data) as Reading[];
        const sorted = readings.sort((a, b) => {
          // If timestamps are strings, compare them lexicographically (reverse order)
          if (typeof a.timestamp === 'string' && typeof b.timestamp === 'string') {
            return b.timestamp.localeCompare(a.timestamp);
          }
          // If timestamps are numbers, subtract normally
          else if (typeof a.timestamp === 'number' && typeof b.timestamp === 'number') {
            return b.timestamp - a.timestamp;
          }
          // Fallback sorting (mixed types)
          return String(b.timestamp).localeCompare(String(a.timestamp));
        });
        
        if (sorted.length > 0) {
          const latest = sorted[0];
          
          // Set latest reading regardless of timestamp
          // The timestamp appears to be in a special format, so we just use the latest reading
          setLatestReading(latest);
        }
      } else {
        setLatestReading(null);
      }
    });
    
    return () => unsubscribe();
  }, [demoMode]);
  
  useEffect(() => {
    if (isConnected) {
      if (latestReading) {
        setStatusMessage('Data received successfully');
      } else {
        setStatusMessage('Device connected. Waiting for data...');
      }
    } else {
      setStatusMessage('Connect your device to start monitoring');
    }
  }, [isConnected, latestReading]);
  
  // Display data - either from real readings or zeros if no recent data
  const displayData = demoMode 
    ? latestReading || { glucose: 0, heartRate: 0, spo2: 0, timestamp: Date.now() }
    : latestReading;

  return (
    <div className="mb-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-destructive'}`}></div>
          <span className="text-sm text-muted-foreground">{statusMessage}</span>
        </div>
        
        <button
          onClick={() => setDemoMode(!demoMode)}
          className={`rounded px-2 py-1 text-xs ${
            demoMode ? "bg-green-900/20 text-green-400" : "bg-slate-800 text-slate-300"
          }`}
        >
          Demo {demoMode ? "ON" : "OFF"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-muted p-4 text-center">
          <div className="mb-1 text-sm font-medium text-muted-foreground">Glucose</div>
          <div className="flex items-baseline justify-center">
            <div className="text-3xl font-semibold">
              {displayData ? displayData.glucose : '0'}
            </div>
            <div className="ml-1 text-sm text-muted-foreground">mg/dL</div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-center">
          <div className="mb-1 text-sm font-medium text-muted-foreground">Heart Rate</div>
          <div className="flex items-baseline justify-center">
            <div className="text-3xl font-semibold">
              {displayData ? displayData.heartRate : '0'}
            </div>
            <div className="ml-1 text-sm text-muted-foreground">BPM</div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 text-center">
          <div className="mb-1 text-sm font-medium text-muted-foreground">SpO2</div>
          <div className="flex items-baseline justify-center">
            <div className="text-3xl font-semibold">
              {displayData ? displayData.spo2 : '0'}
            </div>
            <div className="ml-1 text-sm text-muted-foreground">%</div>
          </div>
        </div>
      </div>

      {displayData && displayData.timestamp && (
        <div className="text-center text-xs text-muted-foreground">
          Last updated: {typeof displayData.timestamp === 'string' 
            ? displayData.timestamp.split(' ')[1] // Just show the time part if it's a string
            : new Date(displayData.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}