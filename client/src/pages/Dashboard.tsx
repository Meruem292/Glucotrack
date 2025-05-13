import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "@/lib/firebase";
import MetricCard from "@/components/MetricCard";
import RealtimeStatus from "@/components/RealtimeStatus";
import FoodRecommendationCard from "@/components/FoodRecommendationCard";
import WorkoutRecommendationCard from "@/components/WorkoutRecommendationCard";
import TokenInput from "@/components/TokenInput";
import HealthTipsGenerator from "@/components/HealthTipsGenerator";
import HealthTrends from "@/components/HealthTrends";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

// Import SVG images
import wholeGrainImg from "../assets/images/whole-grain.svg";
import leafyGreensImg from "../assets/images/leafy-greens.svg";
import fattyFishImg from "../assets/images/fatty-fish.svg";
import carbsImg from "../assets/images/carbs.svg";
import fruitImg from "../assets/images/fruit.svg";
import honeyImg from "../assets/images/honey.svg";
import proteinImg from "../assets/images/protein.svg";
import waterImg from "../assets/images/water.svg";
import walkingImg from "../assets/images/walking.svg";
import cyclingImg from "../assets/images/cycling.svg";
import yogaImg from "../assets/images/yoga.svg";
import restImg from "../assets/images/rest.svg";
import stretchingImg from "../assets/images/stretching.svg";
import swimmingImg from "../assets/images/swimming.svg";

interface Reading {
  glucose: number;
  heartRate: number;
  spo2: number;
  timestamp: number | string;
}

interface FoodRecommendation {
  name: string;
  description: string;
  icon: string;
  imageUrl?: string;
}

interface WorkoutRecommendation {
  name: string;
  description: string;
  icon: string;
  imageUrl?: string;
}

export default function Dashboard() {
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [foodRecommendations, setFoodRecommendations] = useState<FoodRecommendation[]>([]);
  const [workoutRecommendations, setWorkoutRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [allReadings, setAllReadings] = useState<Reading[]>([]);
  const [timeFrame, setTimeFrame] = useState("7"); // Default to 7 days
  const [userHealth, setUserHealth] = useState({
    age: 0,
    weight: 0,
    height: 0,
    condition: ""
  });

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Check device connection status
    const connectionRef = ref(database, `users/${userId}/profile/deviceConnected`);
    const connectionUnsubscribe = onValue(connectionRef, (snapshot) => {
      setIsConnected(Boolean(snapshot.val()));
    });

    // Fetch user health profile
    const healthRef = ref(database, `users/${userId}/health`);
    const healthUnsubscribe = onValue(healthRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserHealth({
          age: data.age || 0,
          weight: data.weight || 0,
          height: data.height || 0,
          condition: data.condition || ""
        });
      }
    });

    // Listen to latest reading
    const readingsRef = ref(database, `users/${userId}/readings`);
    const readingsUnsubscribe = onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Get all readings
        const readings = Object.values(data) as Reading[];
        // Sort readings by timestamp (newest first)
        const sortedReadings = readings.sort((a, b) => {
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
        
        // Set the latest reading
        const latestReading = sortedReadings[0] || null;
        setLatestReading(latestReading);
        
        // Set all readings for analytics
        setAllReadings(sortedReadings);
        
        // Get recommendations based on latest reading
        if (latestReading) {
          fetchRecommendations(latestReading);
        }
      } else {
        setLatestReading(null);
        setAllReadings([]);
      }
    });

    return () => {
      connectionUnsubscribe();
      healthUnsubscribe();
      readingsUnsubscribe();
    };
  }, []);

  // No longer needed due to real-time monitoring from Firebase

  // Filter readings based on selected time frame
  const getFilteredReadings = () => {
    if (!allReadings.length) return [];
    
    const now = new Date().getTime();
    const days = parseInt(timeFrame, 10);
    
    // If timeFrame is 0, return all readings
    if (days === 0) return allReadings;
    
    // Filter readings based on time frame
    const cutoffTime = now - (days * 24 * 60 * 60 * 1000);
    
    return allReadings.filter(reading => {
      // If timestamp is a number, do direct comparison
      if (typeof reading.timestamp === 'number') {
        return reading.timestamp >= cutoffTime;
      } 
      // If timestamp is a string, we need to compare dates
      else if (typeof reading.timestamp === 'string') {
        try {
          // Try to convert string timestamp to Date object for comparison
          // Assuming format "*YYYY-MM-DD HH:MM:SS*"
          const dateParts = reading.timestamp.replace(/[*"]/g, '').split(' ');
          const dateStr = dateParts.join('T');
          const readingDate = new Date(dateStr);
          return !isNaN(readingDate.getTime()) && readingDate.getTime() >= cutoffTime;
        } catch (e) {
          // If date parsing fails, include the reading by default
          return true;
        }
      }
      return true;
    });
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
          icon: "ri-cup-line",
          imageUrl: carbsImg
        },
        {
          name: "Fruit",
          description: "Banana or apple",
          icon: "ri-apple-line",
          imageUrl: fruitImg
        },
        {
          name: "Honey",
          description: "Natural sugar source",
          icon: "ri-drop-line",
          imageUrl: honeyImg
        }
      ];
      
      workoutRecs = [
        {
          name: "Rest",
          description: "Until glucose normalizes",
          icon: "ri-rest-time-line",
          imageUrl: restImg
        },
        {
          name: "Light Walking",
          description: "5-10 minutes",
          icon: "ri-walk-line",
          imageUrl: walkingImg
        },
        {
          name: "Gentle Stretching",
          description: "5 minutes",
          icon: "ri-walk-line",
          imageUrl: stretchingImg
        }
      ];
    } else if (reading.glucose > 180) {
      // High glucose recommendations
      foodRecs = [
        {
          name: "Leafy Greens",
          description: "Low carb vegetables",
          icon: "ri-plant-line",
          imageUrl: leafyGreensImg
        },
        {
          name: "Lean Protein",
          description: "Chicken or fish",
          icon: "ri-meat-line",
          imageUrl: proteinImg
        },
        {
          name: "Water",
          description: "Stay hydrated",
          icon: "ri-drop-line",
          imageUrl: waterImg
        }
      ];
      
      workoutRecs = [
        {
          name: "Brisk Walking",
          description: "30 minutes",
          icon: "ri-walk-line",
          imageUrl: walkingImg
        },
        {
          name: "Swimming",
          description: "20 minutes",
          icon: "ri-swim-line",
          imageUrl: swimmingImg
        },
        {
          name: "Cycling",
          description: "15 minutes",
          icon: "ri-riding-line",
          imageUrl: cyclingImg
        }
      ];
    } else {
      // Normal glucose recommendations
      foodRecs = [
        {
          name: "Whole Grain Foods",
          description: "Low glycemic index",
          icon: "ri-bread-line",
          imageUrl: wholeGrainImg
        },
        {
          name: "Leafy Greens",
          description: "Rich in minerals",
          icon: "ri-plant-line",
          imageUrl: leafyGreensImg
        },
        {
          name: "Fatty Fish",
          description: "Omega-3 fatty acids",
          icon: "ri-fish-line",
          imageUrl: fattyFishImg
        }
      ];
      
      workoutRecs = [
        {
          name: "Brisk Walking",
          description: "30 minutes",
          icon: "ri-walk-line",
          imageUrl: walkingImg
        },
        {
          name: "Cycling",
          description: "20 minutes",
          icon: "ri-riding-line",
          imageUrl: cyclingImg
        },
        {
          name: "Light Yoga",
          description: "15 minutes",
          icon: "ri-heart-line",
          imageUrl: yogaImg
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

      {/* Device Connection */}
      <div className="mb-8 overflow-hidden rounded-xl bg-secondary">
        <div className="bg-muted px-4 py-3">
          <h3 className="font-medium">Device Connection</h3>
        </div>
        <div className="p-4">
          <TokenInput
            onConnectionStatusChange={setIsConnected}
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
            isConnected={isConnected}
          />
          {/* Timestamp is already shown in RealtimeStatus */}
        </div>
      </div>

      {/* Health Analytics Section */}
      <div className="mb-8 overflow-hidden rounded-xl bg-secondary">
        <div className="flex items-center justify-between bg-muted px-4 py-3">
          <h3 className="font-medium">Health Analytics</h3>
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="max-w-[180px] bg-secondary">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="0">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="p-4">
          <HealthTrends 
            readings={getFilteredReadings()}
            timeFrame={timeFrame}
          />
        </div>
      </div>
      
      {/* Health Tips Generator */}
      <div className="mb-8">
        <HealthTipsGenerator
          glucose={latestReading?.glucose || null}
          heartRate={latestReading?.heartRate || null}
          spo2={latestReading?.spo2 || null}
          userAge={userHealth.age}
          userWeight={userHealth.weight}
          userHeight={userHealth.height}
          userCondition={userHealth.condition}
        />
      </div>

      {/* Recommendations Section */}
      <div className="mb-8 overflow-hidden rounded-xl bg-secondary">
        <div className="bg-muted px-4 py-3">
          <h3 className="font-medium">Recommendations</h3>
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
                imageUrl={food.imageUrl}
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
                imageUrl={workout.imageUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
