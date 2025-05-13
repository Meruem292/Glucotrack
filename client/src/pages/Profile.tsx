import { useState, useEffect } from "react";
import { auth, database } from "@/lib/firebase";
import { ref, get, set, update, query, orderByChild, limitToLast, onValue, off } from "firebase/database";
import { updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { formatDate, getHealthStatus } from "@/lib/utils";

interface UserProfile {
  name: string;
  email: string;
  deviceConnected: boolean;
  lastConnection: number | null;
  token: string;
  health: {
    age: number;
    weight: number;
    height: number;
    condition: string;
  };
}

interface Reading {
  glucose: number;
  heartRate: number;
  spo2: number;
  timestamp: number | string;
}

export default function Profile() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    deviceConnected: false,
    lastConnection: null,
    token: "",
    health: {
      age: 0,
      weight: 0,
      height: 0,
      condition: "None"
    }
  });
  const [recentReadings, setRecentReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch profile data from Firebase
        const userRef = ref(database, `users/${user.uid}/profile`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const profileData = snapshot.val();
          setProfile({
            name: user.displayName || "",
            email: user.email || "",
            deviceConnected: profileData.deviceConnected || false,
            lastConnection: profileData.lastConnection || null,
            token: profileData.token || "",
            health: profileData.health || {
              age: 0,
              weight: 0,
              height: 0,
              condition: "None"
            }
          });
        } else {
          setProfile({
            name: user.displayName || "",
            email: user.email || "",
            deviceConnected: false,
            lastConnection: null,
            token: "",
            health: {
              age: 0,
              weight: 0,
              height: 0,
              condition: "None"
            }
          });
        }

        // Fetch recent readings
        const readingsRef = query(
          ref(database, `users/${user.uid}/readings`),
          orderByChild('timestamp'),
          limitToLast(5)
        );
        
        onValue(readingsRef, (readingSnapshot) => {
          const data = readingSnapshot.val();
          if (data) {
            const readingsArray = Object.values(data) as Reading[];
            // Sort by timestamp (newest first)
            const sortedReadings = readingsArray.sort((a, b) => {
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
            setRecentReadings(sortedReadings);
          }
        });
        
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    
    // Cleanup subscription when component unmounts
    return () => {
      const user = auth.currentUser;
      if (user) {
        const readingsRef = ref(database, `users/${user.uid}/readings`);
        // Turn off the listener
        off(readingsRef);
      }
    };
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'health') {
        setProfile(prev => ({
          ...prev,
          health: {
            ...prev.health,
            [child]: value
          }
        }));
      }
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveChanges = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      
      // Update displayName in Firebase Auth
      if (user.displayName !== profile.name) {
        await updateProfile(user, { displayName: profile.name });
      }
      
      // Update profile in Firebase Realtime Database
      const userRef = ref(database, `users/${user.uid}/profile`);
      await update(userRef, {
        health: profile.health
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHealthInfo = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      
      // Update health info in Firebase Realtime Database
      const healthRef = ref(database, `users/${user.uid}/profile/health`);
      await update(healthRef, profile.health);
      
      toast({
        title: "Success",
        description: "Health information updated successfully"
      });
    } catch (error) {
      console.error("Error updating health info:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update health information"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetConnection = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      
      // Reset device connection in Firebase Realtime Database
      await update(ref(database, `users/${user.uid}/profile`), {
        deviceConnected: false,
        lastConnection: Date.now()
      });
      
      setProfile(prev => ({
        ...prev,
        deviceConnected: false,
        lastConnection: Date.now()
      }));
      
      toast({
        title: "Success",
        description: "Device connection reset successfully"
      });
    } catch (error) {
      console.error("Error resetting device connection:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset device connection"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="mb-6 text-xl font-semibold">Profile Settings</h2>
      
      <div className="mb-6 overflow-hidden rounded-xl bg-secondary">
        <div className="p-6">
          <div className="mb-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <i className="ri-user-line text-3xl text-accent"></i>
            </div>
            <div>
              <h3 className="text-lg font-medium">{profile.name}</h3>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="mt-2">
                <button className="rounded-lg bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-blue-600/20">
                  Change Photo
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-muted pt-6">
            <h4 className="mb-4 font-medium">Personal Information</h4>
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={profile.name} 
                    onChange={handleChange}
                    className="w-full rounded-lg border border-muted bg-muted px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">Email</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-muted bg-muted px-4 py-3 text-foreground opacity-70 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <h5 className="mb-2 font-medium">Device Information</h5>
                <div className="rounded-lg border border-muted bg-muted/50 p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">User ID:</span>
                    <code className="inline-block rounded bg-black/20 px-2 py-1 text-sm font-mono">
                      {auth.currentUser?.uid?.substring(0, 10)}...
                    </code>
                  </div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Device Token:</span>
                    <code className="inline-block rounded bg-black/20 px-2 py-1 text-sm font-mono">
                      {profile.token || "No token"}
                    </code>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Connection Status:</span>
                    <span className={`inline-flex items-center gap-1 rounded-full ${profile.deviceConnected ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'} px-2 py-0.5 text-xs font-medium`}>
                      <span className={`h-2 w-2 rounded-full ${profile.deviceConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      {profile.deviceConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  {profile.lastConnection && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last connection: {formatDate(new Date(profile.lastConnection))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  type="button" 
                  className="rounded-lg bg-accent px-4 py-2 font-medium text-white transition duration-200 hover:bg-blue-600"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
          
          <div className="border-t border-muted pt-6 mt-6">
            <h4 className="mb-4 font-medium">Health Information</h4>
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">Age</label>
                  <input 
                    type="number" 
                    name="health.age"
                    value={profile.health.age} 
                    onChange={handleChange}
                    className="w-full rounded-lg border border-muted bg-muted px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">Weight (kg)</label>
                  <input 
                    type="number" 
                    name="health.weight"
                    value={profile.health.weight} 
                    onChange={handleChange}
                    className="w-full rounded-lg border border-muted bg-muted px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">Height (cm)</label>
                  <input 
                    type="number" 
                    name="health.height"
                    value={profile.health.height} 
                    onChange={handleChange}
                    className="w-full rounded-lg border border-muted bg-muted px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">Health Conditions</label>
                <select 
                  name="health.condition"
                  value={profile.health.condition}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-muted bg-muted px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option>None</option>
                  <option>Type 1 Diabetes</option>
                  <option>Type 2 Diabetes</option>
                  <option>Hypertension</option>
                  <option>Heart Condition</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div className="pt-2">
                <button 
                  type="button" 
                  className="rounded-lg bg-accent px-4 py-2 font-medium text-white transition duration-200 hover:bg-blue-600"
                  onClick={handleUpdateHealthInfo}
                >
                  Update Health Info
                </button>
              </div>
            </form>
          </div>
          
          <div className="border-t border-muted pt-6 mt-6">
            <h4 className="mb-4 font-medium">Recent Readings</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Date & Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Glucose (mg/dL)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Heart Rate (BPM)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">SpO2 (%)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {recentReadings.length > 0 ? (
                    recentReadings.map((reading, index) => {
                      const status = getHealthStatus("glucose", reading.glucose);
                      return (
                        <tr key={index} className="hover:bg-muted/50">
                          <td className="px-4 py-2 text-xs text-muted-foreground">
                            {formatDate(new Date(reading.timestamp))}
                          </td>
                          <td className="px-4 py-2 text-xs text-foreground">{reading.glucose}</td>
                          <td className="px-4 py-2 text-xs text-foreground">{reading.heartRate}</td>
                          <td className="px-4 py-2 text-xs text-foreground">{reading.spo2}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center rounded-full bg-${status.color}/20 px-2 py-0.5 text-xs font-medium text-${status.color}`}>
                              {status.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-sm text-muted-foreground">
                        No recent readings
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="border-t border-muted pt-6 mt-6">
            <h4 className="mb-4 font-medium text-destructive">Danger Zone</h4>
            <div className="rounded-lg bg-destructive/10 p-4">
              <h5 className="mb-2 font-medium text-destructive">Reset Device Connection</h5>
              <p className="mb-3 text-sm text-muted-foreground">This will clear your device connection status and require reconnecting to your ESP32 device.</p>
              <button 
                type="button" 
                className="rounded-lg bg-muted px-4 py-2 font-medium text-destructive transition duration-200 hover:bg-destructive/20"
                onClick={handleResetConnection}
              >
                Reset Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
