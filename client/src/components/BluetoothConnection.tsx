import { useState, useEffect } from "react";
import { auth, database } from "@/lib/firebase";
import { ref, update, onValue, push } from "firebase/database";
import { useToast } from "@/hooks/use-toast";

interface HealthData {
  glucose: number | null;
  heartRate: number | null;
  spo2: number | null;
  timestamp: string | number | null;
}

interface BluetoothConnectionProps {
  onDataReceived?: (data: HealthData) => void;
  onCalibrationStart?: () => void;
  onCalibrationEnd?: () => void;
}

export default function BluetoothConnection({ 
  onDataReceived, 
  onCalibrationStart, 
  onCalibrationEnd 
}: BluetoothConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Check if there's an existing connection status in Firebase
    const connectionRef = ref(database, `users/${userId}/profile/bluetoothConnected`);
    const unsubscribe = onValue(connectionRef, (snapshot) => {
      const isConnected = snapshot.val();
      setIsConnected(Boolean(isConnected));
    });

    return () => unsubscribe();
  }, []);

  const connectToDevice = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to connect to a device"
      });
      return;
    }

    try {
      setIsConnecting(true);

      if (!navigator.bluetooth) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Bluetooth is not supported in your browser. Please use Chrome, Edge, or Opera."
        });
        return;
      }

      toast({
        title: "Searching for Devices",
        description: "Looking for compatible health devices nearby. Note: Only devices advertising Bluetooth health services will appear."
      });

      // Request the device with more flexible options to improve discovery
      // This will allow the user to select any Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        // Use acceptAllDevices to show all Bluetooth devices for testing
        acceptAllDevices: true,
        // Include common health monitoring services that might be used 
        optionalServices: [
          '0000180d-0000-1000-8000-00805f9b34fb', // Heart Rate service
          '00001808-0000-1000-8000-00805f9b34fb', // Glucose service
          '00001809-0000-1000-8000-00805f9b34fb', // Health Thermometer
          '0000180a-0000-1000-8000-00805f9b34fb'  // Device Information
        ]
      });

      setDevice(device);

      // Listen for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setServer(null);
        setCharacteristic(null);
        
        // Update the connection status in Firebase with properly formatted date
        const now = new Date();
        const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
        update(ref(database, `users/${userId}/profile`), {
          bluetoothConnected: false,
          lastConnection: formattedDate
        });
        
        toast({
          variant: "destructive",
          title: "Disconnected",
          description: "The Bluetooth device has been disconnected"
        });
      });

      try {
        // Connect to GATT server
        const server = await device.gatt?.connect();
        if (!server) {
          throw new Error("Failed to connect to GATT server");
        }
        
        setServer(server);

        toast({
          title: "Connected",
          description: `Connected to ${device.name || 'Bluetooth device'}`
        });

        // Get available services (for testing purposes)
        const services = await server.getPrimaryServices();
        console.log("Available services:", services.map(s => s.uuid));
        
        let service;
        let characteristic;
        
        // Try to find the heart rate service first
        try {
          service = await server.getPrimaryService('0000180d-0000-1000-8000-00805f9b34fb'); // Heart Rate service
          const characteristics = await service.getCharacteristics();
          console.log("Available characteristics:", characteristics.map(c => c.uuid));
          
          // Try to get the heart rate measurement characteristic
          characteristic = await service.getCharacteristic('00002a37-0000-1000-8000-00805f9b34fb');
        } catch (serviceError) {
          console.log("Heart rate service not found, looking for other services...");
          
          // Look for other health-related services if heart rate isn't available
          for (const serviceUuid of [
            '00001808-0000-1000-8000-00805f9b34fb', // Glucose
            '00001809-0000-1000-8000-00805f9b34fb', // Health Thermometer
            '0000180a-0000-1000-8000-00805f9b34fb'  // Device Information
          ]) {
            try {
              service = await server.getPrimaryService(serviceUuid);
              if (service) {
                // If we found a service, try to get all its characteristics
                const characteristics = await service.getCharacteristics();
                if (characteristics.length > 0) {
                  // Use the first characteristic that supports notifications
                  for (const c of characteristics) {
                    if (c.properties.notify) {
                      characteristic = c;
                      break;
                    }
                  }
                  if (!characteristic && characteristics.length > 0) {
                    // If no notify-supporting characteristics found, use the first one
                    characteristic = characteristics[0];
                  }
                  break;
                }
              }
            } catch (err) {
              console.log(`Service ${serviceUuid} not found.`);
            }
          }
        }
        
        if (!service || !characteristic) {
          throw new Error("No compatible health services found on this device");
        }
        
        setCharacteristic(characteristic);

        // If the characteristic supports notifications, enable them
        if (characteristic.properties.notify) {
          // Enable notifications
          await characteristic.startNotifications();
          
          // Listen for changes in the characteristic value
          characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        } else {
          // If notifications aren't supported, we'll need to poll for changes
          toast({
            variant: "destructive",
            title: "Limited Functionality",
            description: "This device doesn't support continuous monitoring. Values will need to be read manually."
          });
        }

        setIsConnected(true);

        // Update the connection status in Firebase
        update(ref(database, `users/${userId}/profile`), {
          bluetoothConnected: true,
          lastConnection: Date.now()
        });

        // At this point, the device is connected and we're ready to receive data
        toast({
          title: "Ready for Reading",
          description: "Device connected successfully. Waiting for data..."
        });
      } catch (error) {
        const connectionError = error as Error;
        console.error("Connection error details:", connectionError);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: connectionError.message || "Failed to connect to the device properly. Please try another device."
        });
        
        // Clean up if connection failed
        if (device && device.gatt?.connected) {
          await device.gatt.disconnect();
        }
        setIsConnected(false);
        setServer(null);
        setCharacteristic(null);
        
        throw connectionError; // Re-throw to be caught by the outer catch block
      }

    } catch (error) {
      console.error('Error connecting to Bluetooth device:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to the Bluetooth device. Please try again."
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCharacteristicValueChanged = (event: Event) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Get the value from the characteristic
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    
    if (!value) return;

    // Parse the data from the ESP32
    try {
      // Convert ArrayBuffer to string
      const decoder = new TextDecoder('utf-8');
      const dataString = decoder.decode(value.buffer);
      
      // Parse the JSON data
      const data = JSON.parse(dataString);
      
      // Check if this is a calibration message
      if (data.status === 'calibrating') {
        if (!isCalibrating) {
          setIsCalibrating(true);
          if (onCalibrationStart) onCalibrationStart();
          
          toast({
            title: "Calibrating",
            description: "Device is calibrating. Please keep your finger on the sensor."
          });
        }
        return;
      }
      
      // Check if this is a calibration complete message
      if (data.status === 'calibrated') {
        setIsCalibrating(false);
        if (onCalibrationEnd) onCalibrationEnd();
        
        toast({
          title: "Calibration Complete",
          description: "Device is ready to take measurements."
        });
        return;
      }
      
      // Process the health data (glucose, heart rate, SpO2)
      if (data && data.glucose !== undefined && data.heartRate !== undefined && data.spo2 !== undefined) {
        // If we were calibrating, end calibration
        if (isCalibrating) {
          setIsCalibrating(false);
          if (onCalibrationEnd) onCalibrationEnd();
        }
        
        // Format data to 2 decimal places
        const healthData: HealthData = {
          glucose: parseFloat(data.glucose.toFixed(2)),
          heartRate: parseFloat(data.heartRate.toFixed(2)),
          spo2: parseFloat(data.spo2.toFixed(2)),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        
        // Store the reading in Firebase
        // Push creates a new entry with a unique key in the specified location
        push(ref(database, `users/${userId}/readings`), healthData);
        
        // Call the callback if provided to update real-time display
        if (onDataReceived) {
          onDataReceived(healthData);
        }
        
        toast({
          title: "New Reading",
          description: "Successfully received new health data"
        });
      }
    } catch (error) {
      console.error('Error parsing data from ESP32:', error);
    }
  };

  const disconnectDevice = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // If in demo mode, just clean up the demo
    if (isDemoMode) {
      setIsDemoMode(false);
      setIsConnected(false);
      
      // Update Firebase status
      update(ref(database, `users/${userId}/profile`), {
        bluetoothConnected: false,
        lastConnection: Date.now()
      });
      
      toast({
        title: "Demo Mode Ended",
        description: "Disconnected from demo mode"
      });
      return;
    }

    // Normal Bluetooth disconnect
    try {
      if (device && device.gatt?.connected) {
        await device.gatt.disconnect();
      }
      
      // Update the connection status in Firebase
      update(ref(database, `users/${userId}/profile`), {
        bluetoothConnected: false,
        lastConnection: Date.now()
      });
      
      setIsConnected(false);
      setIsCalibrating(false);
      setServer(null);
      setCharacteristic(null);
      
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from the device"
      });
    } catch (error) {
      console.error('Error disconnecting from device:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to disconnect from the device"
      });
    }
  };
  
  // Function to start demo mode for testing without a real device
  const startDemoMode = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to use demo mode"
      });
      return;
    }
    
    setIsDemoMode(true);
    setIsConnected(true);
    
    // Update Firebase status with properly formatted timestamp
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
    update(ref(database, `users/${userId}/profile`), {
      bluetoothConnected: true,
      lastConnection: formattedDate
    });
    
    toast({
      title: "Demo Mode Activated",
      description: "Using simulated data for testing"
    });
    
    // Simulate calibration process
    setIsCalibrating(true);
    if (onCalibrationStart) onCalibrationStart();
    
    // Simulate calibration completion after 3 seconds
    setTimeout(() => {
      setIsCalibrating(false);
      if (onCalibrationEnd) onCalibrationEnd();
      
      // Start sending demo data
      sendDemoData(userId);
    }, 3000);
  };
  
  // Generate and send demo health data
  const sendDemoData = (userId: string) => {
    // Don't continue if demo mode has been disabled
    if (!isDemoMode) return;
    
    // Generate reasonable random values (with 2 decimal places)
    const glucose = parseFloat((80 + Math.random() * 60).toFixed(2)); // 80-140 range
    const heartRate = parseFloat((60 + Math.random() * 40).toFixed(2)); // 60-100 range
    const spo2 = parseFloat((95 + Math.random() * 5).toFixed(2)); // 95-100 range
    
    // Use consistent timestamp format
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
    
    const healthData: HealthData = {
      glucose,
      heartRate,
      spo2,
      timestamp: formattedDate
    };
    
    // Save to Firebase
    push(ref(database, `users/${userId}/readings`), healthData);
    
    // Update real-time display
    if (onDataReceived) {
      onDataReceived(healthData);
    }
    
    // Send a notification every 5th reading
    if (Math.random() > 0.8) {
      toast({
        title: "New Demo Reading",
        description: `Glucose: ${glucose} mg/dL, Heart: ${heartRate} BPM, SpO2: ${spo2}%`
      });
    }
    
    // Schedule next data point if still in demo mode
    if (isDemoMode) {
      // Send new data every 3-5 seconds
      const nextDelay = 3000 + Math.random() * 2000;
      setTimeout(() => sendDemoData(userId), nextDelay);
    }
  };

  return (
    <div className="mb-6 rounded-xl bg-secondary p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Bluetooth Device Connection</h3>
        {isDemoMode && (
          <span className="inline-block px-2 py-1 text-xs font-medium bg-orange-600 rounded-md text-white">
            Demo Mode
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-destructive'}`}></div>
        <span className="text-sm text-muted-foreground">
          {isConnected 
            ? isCalibrating 
              ? "Connected - Device is calibrating..." 
              : isDemoMode ? "Connected to Demo Device (Simulated)" : "Connected to Bluetooth device" 
            : "Not connected to any device"}
        </span>
      </div>
      
      <div className="mt-2 rounded-md bg-blue-900/30 p-2 text-xs text-blue-200">
        <p><strong>Note:</strong> Web Bluetooth can only connect to special health devices that advertise specific services. Most phones and regular Bluetooth devices won't appear in the device list.</p>
      </div>
      
      <div className="mt-4 flex gap-2 flex-wrap">
        {!isConnected ? (
          <>
            <button
              onClick={connectToDevice}
              disabled={isConnecting}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
            >
              {isConnecting ? (
                <span className="flex items-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Connecting...
                </span>
              ) : (
                "Connect to Device"
              )}
            </button>
            
            <button
              onClick={startDemoMode}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
            >
              Try Demo Mode
            </button>
          </>
        ) : (
          <button
            onClick={disconnectDevice}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition hover:bg-destructive/80"
          >
            {isDemoMode ? "Stop Demo" : "Disconnect"}
          </button>
        )}
      </div>
      
      {isConnected && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">
            {isCalibrating 
              ? "Device is calibrating. This may take a moment..." 
              : isDemoMode 
                ? "Demo mode is active. Simulated health data will be generated automatically." 
                : "Device is connected. Follow instructions or interact with the device to receive health data."}
          </p>
        </div>
      )}
    </div>
  );
}