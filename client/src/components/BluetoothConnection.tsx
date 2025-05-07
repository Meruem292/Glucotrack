import { useState, useEffect } from "react";
import { auth, database } from "@/lib/firebase";
import { ref, update, onValue } from "firebase/database";
import { useToast } from "@/hooks/use-toast";

interface BluetoothConnectionProps {
  onDataReceived?: (data: any) => void;
}

export default function BluetoothConnection({ onDataReceived }: BluetoothConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
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
        title: "Connecting",
        description: "Please select your ESP32 device from the list"
      });

      // Request the device with a specific service UUID used by ESP32
      // Note: You'll need to replace this with your actual ESP32 service UUID
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['health_thermometer'] }, // Example service, replace with your ESP32 service
          { namePrefix: 'ESP32' }
        ],
        optionalServices: ['battery_service', 'health_thermometer'] // Add any optional services you'll use
      });

      setDevice(device);

      // Listen for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setServer(null);
        setCharacteristic(null);
        
        // Update the connection status in Firebase
        update(ref(database, `users/${userId}/profile`), {
          bluetoothConnected: false,
          lastConnection: Date.now()
        });
        
        toast({
          variant: "destructive",
          title: "Disconnected",
          description: "The Bluetooth device has been disconnected"
        });
      });

      // Connect to GATT server
      const server = await device.gatt?.connect();
      setServer(server);

      // Get the primary service
      // Replace 'health_thermometer' with your ESP32 service UUID
      const service = await server?.getPrimaryService('health_thermometer');

      // Get the characteristic that provides the health data
      // Replace with your ESP32 characteristic UUID
      const characteristic = await service?.getCharacteristic('measurement');
      setCharacteristic(characteristic);

      // Enable notifications
      await characteristic?.startNotifications();

      // Listen for changes in the characteristic value
      characteristic?.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

      setIsConnected(true);

      // Update the connection status in Firebase
      update(ref(database, `users/${userId}/profile`), {
        bluetoothConnected: true,
        lastConnection: Date.now()
      });

      toast({
        title: "Connected",
        description: `Connected to ${device.name || 'ESP32 device'}`
      });

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
    // This will depend on how your ESP32 sends the data
    // For example, if it sends a JSON string:
    try {
      // Convert ArrayBuffer to string
      const decoder = new TextDecoder('utf-8');
      const dataString = decoder.decode(value.buffer);
      
      // Parse the JSON data
      const data = JSON.parse(dataString);
      
      // Process the health data (glucose, heart rate, SpO2)
      if (data && data.glucose !== undefined && data.heartRate !== undefined && data.spo2 !== undefined) {
        // Create a new reading entry in Firebase
        const newReadingRef = ref(database, `users/${userId}/readings/${Date.now()}`);
        update(newReadingRef, {
          glucose: data.glucose,
          heartRate: data.heartRate,
          spo2: data.spo2,
          timestamp: Date.now()
        });
        
        // Call the callback if provided
        if (onDataReceived) {
          onDataReceived(data);
        }
      }
    } catch (error) {
      console.error('Error parsing data from ESP32:', error);
    }
  };

  const disconnectDevice = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

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

  return (
    <div className="mb-6 rounded-xl bg-secondary p-4">
      <h3 className="mb-4 font-medium">ESP32 Bluetooth Connection</h3>
      
      <div className="flex items-center space-x-2">
        <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-destructive'}`}></div>
        <span className="text-sm text-muted-foreground">
          {isConnected ? "Connected to ESP32 device" : "Not connected to any device"}
        </span>
      </div>
      
      <div className="mt-4">
        {!isConnected ? (
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
              "Connect to ESP32"
            )}
          </button>
        ) : (
          <button
            onClick={disconnectDevice}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition hover:bg-destructive/80"
          >
            Disconnect
          </button>
        )}
      </div>
      
      {isConnected && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">
            ESP32 device will prompt you to place your finger on the sensor. Data will be automatically collected and stored in your account.
          </p>
        </div>
      )}
    </div>
  );
}