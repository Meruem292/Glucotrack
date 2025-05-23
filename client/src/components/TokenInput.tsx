import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";

interface TokenInputProps {
  onConnectionStatusChange: (connected: boolean) => void;
}

export default function TokenInput({
  onConnectionStatusChange,
}: TokenInputProps) {
  const [token, setToken] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const auth = getAuth();
  const database = getDatabase();

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Check connection status
    const connectionRef = ref(
      database,
      `users/${userId}/profile/deviceConnected`
    );
    const unsubscribe = onValue(connectionRef, (snapshot) => {
      const connected = Boolean(snapshot.val());
      setIsConnected(connected);
      onConnectionStatusChange(connected);

      if (connected) {
        setStatusMessage("Ready to receive data from the device");
      } else {
        setStatusMessage("");
      }
    });

    // Also check if token exists
    const tokenRef = ref(database, `users/${userId}/profile/token`);
    const tokenUnsubscribe = onValue(tokenRef, (snapshot) => {
      const savedToken = snapshot.val();
      if (savedToken) {
        setToken(savedToken);
      }
    });

    return () => {
      unsubscribe();
      tokenUnsubscribe();
    };
  }, [onConnectionStatusChange]);

  const handleConnect = async () => {
    if (!token.trim()) {
      setStatusMessage("Please enter a valid token");
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      setStatusMessage("You must be logged in to connect a device");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Connecting to device...");

    try {
      // Save token to user profile
      await set(ref(database, `users/${userId}/profile/token`), token);

      // Set connection status to true
      await set(ref(database, `users/${userId}/profile/deviceConnected`), true);

      // Update last connection timestamp
      await set(
        ref(database, `users/${userId}/profile/lastConnection`),
        Date.now()
      );

      setStatusMessage("Device connected! Receiving data...");
    } catch (error) {
      console.error("Error connecting to device:", error);
      setStatusMessage("Failed to connect. Please try again.");

      // Set connection status to false
      await set(
        ref(database, `users/${userId}/profile/deviceConnected`),
        false
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setIsLoading(true);

    try {
      // Set connection status to false
      await set(
        ref(database, `users/${userId}/profile/deviceConnected`),
        false
      );
      setStatusMessage("Device disconnected");
    } catch (error) {
      console.error("Error disconnecting device:", error);
      setStatusMessage("Failed to disconnect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
        <Input
          type="text"
          placeholder="Enter device token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={isLoading || isConnected}
          className="flex-1"
        />

        {isConnected ? (
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            disabled={isLoading}
          >
            Disconnect
          </Button>
        ) : (
          <Button onClick={handleConnect} disabled={isLoading || !token.trim()}>
            Connect
          </Button>
        )}
      </div>

      {statusMessage && (
        <div
          className={`rounded-md p-2 text-sm ${
            isConnected
              ? "bg-green-900/20 text-green-400"
              : statusMessage.includes("Failed")
              ? "bg-red-900/20 text-red-400"
              : "bg-blue-900/20 text-blue-400"
          }`}
        >
          {statusMessage}
        </div>
      )}

      <div className="mt-2 text-sm text-muted-foreground">
        <p>
          Enter the token generated by your monitoring device to connect and
          start receiving data.
        </p>
        <p className="text-red-500">
          If real-time monitoring doesn't update, please check if the token is
          correct.
        </p>
      </div>
    </div>
  );
}
