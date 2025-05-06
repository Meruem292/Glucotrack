import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "@/lib/firebase";
import { getHealthStatus } from "@/lib/utils";

interface Reading {
  glucose: number;
  heartRate: number;
  spo2: number;
  timestamp: number;
}

interface FoodItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

export default function FoodRecommendations() {
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [foodRecommendations, setFoodRecommendations] = useState<FoodItem[]>([]);

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
        
        // Get food recommendations based on readings
        if (latestReading) {
          fetchFoodRecommendations(latestReading);
        }
      } else {
        setLatestReading(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchFoodRecommendations = (reading: Reading) => {
    // In a real app, this would fetch from an API based on readings
    // For now, we'll use static data
    
    const recommendations: FoodItem[] = [
      {
        id: "1",
        name: "Grilled Salmon",
        description: "Rich in omega-3 fatty acids that support heart health and may help regulate blood sugar.",
        imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        tags: ["protein-rich", "low-glycemic"]
      },
      {
        id: "2",
        name: "Mixed Green Salad",
        description: "Leafy greens provide essential nutrients and fiber that help manage blood glucose levels.",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        tags: ["high-fiber", "low-calorie"]
      },
      {
        id: "3",
        name: "Overnight Oats",
        description: "Whole grain oats provide slow-releasing carbohydrates to maintain stable blood sugar levels.",
        imageUrl: "https://images.unsplash.com/photo-1568093858174-0f391ea21c45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        tags: ["high-fiber", "medium-glycemic"]
      },
      {
        id: "4",
        name: "Greek Yogurt with Berries",
        description: "High in protein and probiotics with antioxidant-rich berries to support gut health.",
        imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0bfdf63?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        tags: ["protein-rich", "probiotic"]
      },
      {
        id: "5",
        name: "Avocado Toast on Whole Grain",
        description: "Healthy fats and fiber to help maintain steady blood sugar levels throughout the day.",
        imageUrl: "https://images.unsplash.com/photo-1506974210756-8e1b8985d348?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        tags: ["heart-healthy", "high-fiber"]
      },
      {
        id: "6",
        name: "Quinoa Bowl with Vegetables",
        description: "Complete protein with complex carbs for sustained energy and stable glucose.",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=500",
        tags: ["protein-rich", "high-fiber"]
      }
    ];
    
    setFoodRecommendations(recommendations);
  };

  const filteredFoods = activeCategory === "all" 
    ? foodRecommendations 
    : foodRecommendations.filter(food => food.tags.includes(activeCategory));

  const glucoseStatus = latestReading ? getHealthStatus("glucose", latestReading.glucose) : { status: "Unknown", color: "muted" };
  const heartRateStatus = latestReading ? getHealthStatus("heartRate", latestReading.heartRate) : { status: "Unknown", color: "muted" };
  const spo2Status = latestReading ? getHealthStatus("spo2", latestReading.spo2) : { status: "Unknown", color: "muted" };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="mb-6 text-xl font-semibold">Food Recommendations</h2>

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

      {/* Food Categories Tabs */}
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
            activeCategory === "low-glycemic" ? "bg-accent text-white" : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setActiveCategory("low-glycemic")}
        >
          Low Glycemic
        </button>
        <button 
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
            activeCategory === "heart-healthy" ? "bg-accent text-white" : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setActiveCategory("heart-healthy")}
        >
          Heart Healthy
        </button>
        <button 
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
            activeCategory === "protein-rich" ? "bg-accent text-white" : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setActiveCategory("protein-rich")}
        >
          High Protein
        </button>
        <button 
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
            activeCategory === "high-fiber" ? "bg-accent text-white" : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setActiveCategory("high-fiber")}
        >
          High Fiber
        </button>
      </div>

      {/* Food Recommendations Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food) => (
            <div key={food.id} className="overflow-hidden rounded-xl bg-secondary">
              <div 
                className="h-40 bg-cover bg-center" 
                style={{ backgroundImage: `url(${food.imageUrl})` }}
              ></div>
              <div className="p-4">
                <h3 className="mb-1 font-medium">{food.name}</h3>
                <p className="mb-2 text-sm text-muted-foreground">{food.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {food.tags.map((tag, index) => {
                    let bgColor = "bg-accent/10";
                    let textColor = "text-accent";
                    
                    if (tag === "low-glycemic" || tag === "low-calorie") {
                      bgColor = "bg-success/10";
                      textColor = "text-success";
                    } else if (tag === "medium-glycemic") {
                      bgColor = "bg-warning/10";
                      textColor = "text-warning";
                    }
                    
                    return (
                      <span 
                        key={index} 
                        className={`rounded-full px-2 py-1 text-xs ${bgColor} ${textColor}`}
                      >
                        {tag.replace("-", " ")}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            No food recommendations available for this category.
          </div>
        )}
      </div>
    </div>
  );
}
