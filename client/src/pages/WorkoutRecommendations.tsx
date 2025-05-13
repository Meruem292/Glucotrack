import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "@/lib/firebase";
import { getHealthStatus } from "@/lib/utils";

interface Reading {
  glucose: number;
  heartRate: number;
  spo2: number;
  timestamp: number | string;
}

interface WorkoutItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  duration: string;
  intensity: string;
  tags: string[];
}

export default function WorkoutRecommendations() {
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [workoutRecommendations, setWorkoutRecommendations] = useState<WorkoutItem[]>([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Fetch latest reading
    const readingsRef = ref(database, `users/${userId}/readings`);
    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Get last reading
        const readings = Object.values(data) as Reading[];
        const latestReading = readings.sort((a, b) => b.timestamp - a.timestamp)[0] || null;
        setLatestReading(latestReading);
        
        // Get workout recommendations based on readings
        if (latestReading) {
          fetchWorkoutRecommendations(latestReading);
        }
      } else {
        setLatestReading(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchWorkoutRecommendations = (reading: Reading) => {
    // In a real app, this would fetch from an API based on readings
    // For now, we'll use static data
    
    const recommendations: WorkoutItem[] = [
      {
        id: "1",
        name: "Brisk Walking",
        description: "Low-impact exercise that's excellent for cardiovascular health and blood sugar management.",
        imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        duration: "30 minutes",
        intensity: "Low",
        tags: ["low-impact", "beginner-friendly", "cardio"]
      },
      {
        id: "2",
        name: "Swimming",
        description: "Full-body workout that's gentle on joints while improving heart health and circulation.",
        imageUrl: "https://images.unsplash.com/photo-1600965962102-9d64e16133ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        duration: "20-30 minutes",
        intensity: "Low-Medium",
        tags: ["low-impact", "full-body", "cardio"]
      },
      {
        id: "3",
        name: "Yoga",
        description: "Combines gentle stretching with breathing techniques to reduce stress and improve flexibility.",
        imageUrl: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        duration: "15-20 minutes",
        intensity: "Low",
        tags: ["low-impact", "flexibility", "stress-reducing"]
      },
      {
        id: "4",
        name: "Stationary Cycling",
        description: "Low-impact cardio exercise that improves leg strength and cardiovascular health.",
        imageUrl: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        duration: "20 minutes",
        intensity: "Medium",
        tags: ["low-impact", "cardio", "leg-strengthening"]
      },
      {
        id: "5",
        name: "Resistance Band Training",
        description: "Gentle strength training that helps build muscle and improve metabolism.",
        imageUrl: "https://images.unsplash.com/photo-1517637382994-f02da38c6728?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        duration: "15-20 minutes",
        intensity: "Low-Medium",
        tags: ["strength-training", "beginner-friendly", "full-body"]
      },
      {
        id: "6",
        name: "Tai Chi",
        description: "Gentle flowing movements that improve balance, reduce stress, and enhance circulation.",
        imageUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        duration: "15 minutes",
        intensity: "Low",
        tags: ["low-impact", "balance", "stress-reducing"]
      }
    ];
    
    setWorkoutRecommendations(recommendations);
  };

  const filteredWorkouts = activeCategory === "all" 
    ? workoutRecommendations 
    : workoutRecommendations.filter(workout => workout.tags.includes(activeCategory));

  const glucoseStatus = latestReading ? getHealthStatus("glucose", latestReading.glucose) : { status: "Unknown", color: "muted" };
  const heartRateStatus = latestReading ? getHealthStatus("heartRate", latestReading.heartRate) : { status: "Unknown", color: "muted" };
  const spo2Status = latestReading ? getHealthStatus("spo2", latestReading.spo2) : { status: "Unknown", color: "muted" };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="mb-6 text-xl font-semibold">Workout Recommendations</h2>

      {/* Latest Metrics Summary */}
      <div className="mb-6 rounded-xl bg-secondary p-4">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Based on your latest readings:</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className={`mr-2 h-3 w-3 rounded-full bg-${glucoseStatus.color}`}></div>
            <span className="text-sm">Glucose: <span className="font-medium">{latestReading?.glucose || 0} mg/dL</span></span>
          </div>
          <div className="flex items-center">
            <div className={`mr-2 h-3 w-3 rounded-full bg-${heartRateStatus.color}`}></div>
            <span className="text-sm">Heart Rate: <span className="font-medium">{latestReading?.heartRate || 0} BPM</span></span>
          </div>
          <div className="flex items-center">
            <div className={`mr-2 h-3 w-3 rounded-full bg-${spo2Status.color}`}></div>
            <span className="text-sm">SpO2: <span className="font-medium">{latestReading?.spo2 || 0}%</span></span>
          </div>
        </div>
      </div>

      {/* Workout Categories Tabs */}
      <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
        <button 
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
            activeCategory === "all" ? "bg-accent text-white" : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setActiveCategory("all")}
        >
          All Recommendations
        </button>
        <button 
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
            activeCategory === "low-impact" ? "bg-accent text-white" : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setActiveCategory("low-impact")}
        >
          Low Impact
        </button>
        <button 
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
            activeCategory === "cardio" ? "bg-accent text-white" : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setActiveCategory("cardio")}
        >
          Cardio
        </button>
        <button 
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
            activeCategory === "strength-training" ? "bg-accent text-white" : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setActiveCategory("strength-training")}
        >
          Strength Training
        </button>
        <button 
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
            activeCategory === "stress-reducing" ? "bg-accent text-white" : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setActiveCategory("stress-reducing")}
        >
          Stress Reducing
        </button>
      </div>

      {/* Workout Recommendations Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout) => (
            <div key={workout.id} className="overflow-hidden rounded-xl bg-secondary">
              <div 
                className="h-40 bg-cover bg-center" 
                style={{ backgroundImage: `url(${workout.imageUrl})` }}
              ></div>
              <div className="p-4">
                <h3 className="mb-1 font-medium">{workout.name}</h3>
                <p className="mb-2 text-sm text-muted-foreground">{workout.description}</p>
                
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-1 text-xs text-accent">
                    <i className="ri-time-line mr-1"></i> {workout.duration}
                  </span>
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs ${
                    workout.intensity === "Low" 
                      ? "bg-success/10 text-success" 
                      : workout.intensity === "Medium" 
                        ? "bg-warning/10 text-warning" 
                        : "bg-destructive/10 text-destructive"
                  }`}>
                    <i className="ri-speed-up-line mr-1"></i> {workout.intensity} Intensity
                  </span>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {workout.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                    >
                      {tag.replace("-", " ")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            No workout recommendations available for this category.
          </div>
        )}
      </div>
    </div>
  );
}