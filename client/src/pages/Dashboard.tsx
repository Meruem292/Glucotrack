import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "@/lib/firebase";
import MetricCard from "@/components/MetricCard";
import RealtimeStatus from "@/components/RealtimeStatus";
import FoodRecommendationCard from "@/components/FoodRecommendationCard";
import WorkoutRecommendationCard from "@/components/WorkoutRecommendationCard";
import BluetoothConnection from "@/components/BluetoothConnection";
import { formatDate } from "@/lib/utils";

interface Reading {
  glucose: number;
  heartRate: number;
  spo2: number;
  timestamp: number;
}

interface HealthData {
  glucose: number | null;
  heartRate: number | null;
  spo2: number | null;
  timestamp: number | null;
}

interface FoodRecommendation {
  name: string;
  description: string;
  icon: string;
}

interface WorkoutRecommendation {
  name: string;
  description: string;
  icon: string;
}

export default function Dashboard() {
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [foodRecommendations, setFoodRecommendations] = useState<FoodRecommendation[]>([]);
  const [workoutRecommendations, setWorkoutRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [realtimeData, setRealtimeData] = useState<HealthData>({
    glucose: null,
    heartRate: null,
    spo2: null,
    timestamp: null
  });

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Check bluetooth connection status
    const connectionRef = ref(database, `users/${userId}/profile/bluetoothConnected`);
    const connectionUnsubscribe = onValue(connectionRef, (snapshot) => {
      setIsConnected(Boolean(snapshot.val()));
    });

    // Listen to latest reading
    const readingsRef = ref(database, `users/${userId}/readings`);
    const readingsUnsubscribe = onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Get last reading
        const readings = Object.values(data) as Reading[];
        const latestReading = readings.sort((a, b) => b.timestamp - a.timestamp)[0] || null;
        
        setLatestReading(latestReading);
        
        // Get recommendations based on latest reading
        if (latestReading) {
          fetchRecommendations(latestReading);
        }
      } else {
        setLatestReading(null);
      }
    });

    return () => {
      connectionUnsubscribe();
      readingsUnsubscribe();
    };
  }, []);

  const handleDataReceived = (data: HealthData) => {
    setRealtimeData(data);
    // Also update recommendations based on real-time data
    if (data.glucose !== null && data.heartRate !== null && data.spo2 !== null) {
      fetchRecommendations({
        glucose: data.glucose,
        heartRate: data.heartRate,
        spo2: data.spo2,
        timestamp: data.timestamp || Date.now()
      });
    }
  };

  const handleCalibrationStart = () => {
    setIsCalibrating(true);
  };

  const handleCalibrationEnd = () => {
    setIsCalibrating(false);
  };

  const fetchRecommendations = (reading: Reading) => {
    // In a real app, this would use the readings to fetch personalized recommendations
    // Here we're using static recommendations based on glucose levels
    
    let foodRecs: FoodRecommendation[] = [];
    let workoutRecs: WorkoutRecommendation[] = [];

    // Determine which recommendations to show based on glucose levels
    if (reading.glucose < 70) {
      // Low glucose recommendations
      foodRecs = [
        {
          name: "Fast-acting Carbs",
          description: "Glucose tablets or juice",
          icon: "ri-cup-line"
        },
        {
          name: "Fruit",
          description: "Banana or apple",
          icon: "ri-apple-line"
        },
        {
          name: "Honey",
          description: "Natural sugar source",
          icon: "ri-drop-line"
        }
      ];
      
      workoutRecs = [
        {
          name: "Rest",
          description: "Until glucose normalizes",
          icon: "ri-rest-time-line"
        },
        {
          name: "Light Walking",
          description: "5-10 minutes",
          icon: "ri-walk-line"
        },
        {
          name: "Gentle Stretching",
          description: "5 minutes",
          icon: "ri-walk-line"
        }
      ];
    } else if (reading.glucose > 180) {
      // High glucose recommendations
      foodRecs = [
        {
          name: "Leafy Greens",
          description: "Low carb vegetables",
          icon: "ri-plant-line"
        },
        {
          name: "Lean Protein",
          description: "Chicken or fish",
          icon: "ri-meat-line"
        },
        {
          name: "Water",
          description: "Stay hydrated",
          icon: "ri-drop-line"
        }
      ];
      
      workoutRecs = [
        {
          name: "Brisk Walking",
          description: "30 minutes",
          icon: "ri-walk-line"
        },
        {
          name: "Swimming",
          description: "20 minutes",
          icon: "ri-swim-line"
        },
        {
          name: "Cycling",
          description: "15 minutes",
          icon: "ri-riding-line"
        }
      ];
    } else {
      // Normal glucose recommendations
      foodRecs = [
        {
          name: "Whole Grain Foods",
          description: "Low glycemic index",
          icon: "ri-bread-line"
        },
        {
          name: "Leafy Greens",
          description: "Rich in minerals",
          icon: "ri-plant-line"
        },
        {
          name: "Fatty Fish",
          description: "Omega-3 fatty acids",
          icon: "ri-fish-line"
        }
      ];
      
      workoutRecs = [
        {
          name: "Brisk Walking",
          description: "30 minutes",
          icon: "ri-walk-line"
        },
        {
          name: "Cycling",
          description: "20 minutes",
          icon: "ri-riding-line"
        },
        {
          name: "Light Yoga",
          description: "15 minutes",
          icon: "ri-heart-line"
        }
      ];
    }

    setFoodRecommendations(foodRecs);
    setWorkoutRecommendations(workoutRecs);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="mb-6 text-xl font-semibold">Health Dashboard</h2>
      
      {/* Realtime Monitoring Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard 
          title="Glucose" 
          value={latestReading?.glucose || 0} 
          unit="mg/dL" 
          icon="ri-drop-line" 
          metricType="glucose"
        />
        <MetricCard 
          title="Heart Rate" 
          value={latestReading?.heartRate || 0} 
          unit="BPM" 
          icon="ri-heart-pulse-line" 
          metricType="heartRate"
        />
        <MetricCard 
          title="SpO2" 
          value={latestReading?.spo2 || 0} 
          unit="%" 
          icon="ri-pulse-line" 
          metricType="spo2"
        />
      </div>

      {/* Bluetooth Connection */}
      <div className="mb-8 overflow-hidden rounded-xl bg-secondary">
        <div className="bg-muted px-4 py-3">
          <h3 className="font-medium">Device Connection</h3>
        </div>
        <div className="p-4">
          <BluetoothConnection
            onDataReceived={handleDataReceived}
            onCalibrationStart={handleCalibrationStart}
            onCalibrationEnd={handleCalibrationEnd}
          />
        </div>
      </div>
      
      {/* Real-time Status */}
      <div className="mb-8 overflow-hidden rounded-xl bg-secondary">
        <div className="bg-muted px-4 py-3">
          <h3 className="font-medium">Real-time Monitoring</h3>
        </div>
        <div className="p-4">
          <RealtimeStatus 
            data={realtimeData}
            isConnected={isConnected}
            isCalibrating={isCalibrating}
          />
          <div className="text-sm text-muted-foreground">
            Last update: <span>{
              realtimeData.timestamp ? 
                formatDate(new Date(realtimeData.timestamp)) : 
                (latestReading ? formatDate(new Date(latestReading.timestamp)) : "No data")
            }</span>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="mb-8 overflow-hidden rounded-xl bg-secondary">
        <div className="flex items-center justify-between bg-muted px-4 py-3">
          <h3 className="font-medium">Recommendations</h3>
          <button className="text-sm text-accent">View All</button>
        </div>
        <div className="p-4">
          {/* Food Recommendations */}
          <h4 className="mb-3 text-sm font-medium text-muted-foreground">Suggested Foods</h4>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {foodRecommendations.map((food, index) => (
              <FoodRecommendationCard 
                key={index} 
                name={food.name} 
                description={food.description} 
                icon={food.icon} 
              />
            ))}
          </div>

          {/* Exercise Recommendations */}
          <h4 className="mb-3 text-sm font-medium text-muted-foreground">Suggested Workouts</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workoutRecommendations.map((workout, index) => (
              <WorkoutRecommendationCard 
                key={index} 
                name={workout.name} 
                description={workout.description} 
                icon={workout.icon} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
