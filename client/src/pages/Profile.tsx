import { useState, useEffect } from "react";
import { auth, database } from "@/lib/firebase";
import { ref, get, set, update } from "firebase/database";
import { updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import BluetoothConnection from "@/components/BluetoothConnection";

interface UserProfile {
  name: string;
  email: string;
  bluetoothConnected: boolean;
  lastConnection: number | null;
  health: {
    age: number;
    weight: number;
    height: number;
    condition: string;
  };
}

export default function Profile() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    bluetoothConnected: false,
    lastConnection: null,
    health: {
      age: 0,
      weight: 0,
      height: 0,
      condition: "None"
    }
  });
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
            bluetoothConnected: profileData.bluetoothConnected || false,
            lastConnection: profileData.lastConnection || null,
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
            bluetoothConnected: false,
            lastConnection: null,
            health: {
              age: 0,
              weight: 0,
              height: 0,
              condition: "None"
            }
          });
        }
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
      
      // Reset bluetooth connection in Firebase Realtime Database
      await update(ref(database, `users/${user.uid}/profile`), {
        bluetoothConnected: false,
        lastConnection: Date.now()
      });
      
      setProfile(prev => ({
        ...prev,
        bluetoothConnected: false,
        lastConnection: Date.now()
      }));
      
      toast({
        title: "Success",
        description: "Bluetooth connection reset successfully"
      });
    } catch (error) {
      console.error("Error resetting bluetooth connection:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset bluetooth connection"
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
                <h5 className="mb-2 font-medium">ESP32 Connection Status</h5>
                <BluetoothConnection />
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
            <h4 className="mb-4 font-medium text-destructive">Danger Zone</h4>
            <div className="rounded-lg bg-destructive/10 p-4">
              <h5 className="mb-2 font-medium text-destructive">Reset Bluetooth Connection</h5>
              <p className="mb-3 text-sm text-muted-foreground">This will clear your Bluetooth connection status and require reconnecting to your ESP32 device.</p>
              <button 
                type="button" 
                className="rounded-lg bg-muted px-4 py-2 font-medium text-destructive transition duration-200 hover:bg-destructive/20"
                onClick={handleResetConnection}
              >
                Reset Bluetooth
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
