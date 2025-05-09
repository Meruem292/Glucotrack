import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface HealthTipsGeneratorProps {
  glucose: number | null;
  heartRate: number | null;
  spo2: number | null;
  userAge?: number;
  userWeight?: number;
  userHeight?: number;
  userCondition?: string;
}

interface HealthTip {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

// Predefined health tips based on different metrics and ranges
const healthTipsData: HealthTip[] = [
  // Glucose related tips
  { 
    id: 'g1', 
    category: 'glucose', 
    title: 'Lower Your Blood Sugar', 
    description: 'Regular physical activity helps lower blood glucose levels. Try to get at least 30 minutes of moderate exercise most days of the week.',
    priority: 'medium',
    tags: ['exercise', 'blood sugar', 'activity']
  },
  { 
    id: 'g2', 
    category: 'glucose', 
    title: 'Balanced Diet for Stable Glucose', 
    description: 'Include a variety of foods in your diet with a focus on vegetables, whole grains, lean protein, and healthy fats to maintain stable blood sugar levels.',
    priority: 'medium',
    tags: ['diet', 'nutrition', 'blood sugar']
  },
  { 
    id: 'g3', 
    category: 'glucose', 
    title: 'Stay Hydrated', 
    description: 'Proper hydration helps your kidneys flush out excess glucose. Aim to drink at least 8 glasses of water daily.',
    priority: 'low',
    tags: ['hydration', 'water', 'kidney health']
  },
  { 
    id: 'g4', 
    category: 'glucose', 
    title: 'High Glucose Alert!', 
    description: 'Your glucose levels are elevated. Consider reducing carbohydrate intake and increasing physical activity to help lower blood sugar levels.',
    priority: 'high',
    tags: ['high glucose', 'alert', 'carbohydrates']
  },
  { 
    id: 'g5', 
    category: 'glucose', 
    title: 'Low Glucose Warning', 
    description: 'Your glucose levels are low. Consider consuming a small amount of fast-acting carbohydrates, like fruit juice or glucose tablets.',
    priority: 'high',
    tags: ['low glucose', 'hypoglycemia', 'warning']
  },
  
  // Heart rate related tips
  { 
    id: 'h1', 
    category: 'heartRate', 
    title: 'Cardio for Heart Health', 
    description: 'Regular cardiovascular exercise like walking, swimming, or cycling can improve heart efficiency and lower resting heart rate.',
    priority: 'medium',
    tags: ['cardio', 'exercise', 'heart health']
  },
  { 
    id: 'h2', 
    category: 'heartRate', 
    title: 'Stress Management', 
    description: 'High stress levels can increase heart rate. Practice relaxation techniques like deep breathing, meditation, or yoga.',
    priority: 'medium',
    tags: ['stress', 'relaxation', 'meditation']
  },
  { 
    id: 'h3', 
    category: 'heartRate', 
    title: 'Elevated Heart Rate', 
    description: 'Your heart rate is higher than normal. This could be due to stress, caffeine, or dehydration. Try to rest and stay hydrated.',
    priority: 'medium',
    tags: ['tachycardia', 'elevated heart rate', 'rest']
  },
  { 
    id: 'h4', 
    category: 'heartRate', 
    title: 'Caffeine and Heart Rate', 
    description: 'Consuming too much caffeine can increase heart rate. Consider limiting coffee, tea, and energy drinks, especially later in the day.',
    priority: 'low',
    tags: ['caffeine', 'stimulants', 'heart rate']
  },
  
  // SPO2 related tips
  { 
    id: 's1', 
    category: 'spo2', 
    title: 'Breathing Exercises', 
    description: 'Deep breathing exercises can help improve oxygen saturation. Try taking slow, deep breaths through your nose and exhaling through your mouth.',
    priority: 'medium',
    tags: ['breathing', 'oxygen', 'lungs']
  },
  { 
    id: 's2', 
    category: 'spo2', 
    title: 'Low Oxygen Alert', 
    description: 'Your oxygen saturation is lower than optimal. This could be due to respiratory issues, anemia, or high altitude. Consider consulting a healthcare provider.',
    priority: 'high',
    tags: ['hypoxemia', 'low oxygen', 'alert']
  },
  { 
    id: 's3', 
    category: 'spo2', 
    title: 'Improve Air Quality', 
    description: 'Poor air quality can affect oxygen saturation. Consider using an air purifier in your home and avoiding polluted environments.',
    priority: 'low',
    tags: ['air quality', 'pollution', 'environment']
  },
  { 
    id: 's4', 
    category: 'spo2', 
    title: 'Breathing Issues and Sleep', 
    description: 'Low oxygen levels can be associated with sleep apnea or other sleep disorders. Consider discussing your sleep quality with a healthcare provider.',
    priority: 'medium',
    tags: ['sleep', 'apnea', 'breathing']
  },
  
  // General health tips
  { 
    id: 'gen1', 
    category: 'general', 
    title: 'Quality Sleep', 
    description: 'Aim for 7-9 hours of quality sleep each night. Good sleep helps regulate glucose metabolism and supports overall health.',
    priority: 'medium',
    tags: ['sleep', 'rest', 'recovery']
  },
  { 
    id: 'gen2', 
    category: 'general', 
    title: 'Regular Health Check-ups', 
    description: 'Schedule regular check-ups with your healthcare provider to monitor your health metrics and adjust your care plan as needed.',
    priority: 'low',
    tags: ['healthcare', 'check-ups', 'prevention']
  },
  { 
    id: 'gen3', 
    category: 'general', 
    title: 'Mental Health Matters', 
    description: 'Stress and anxiety can affect physical health metrics. Prioritize mental health through relaxation techniques, social connections, and seeking support when needed.',
    priority: 'medium',
    tags: ['mental health', 'stress', 'self-care']
  },
  { 
    id: 'gen4', 
    category: 'general', 
    title: 'Consistent Meal Times', 
    description: 'Eating meals at regular times helps maintain stable blood sugar levels and supports metabolic health.',
    priority: 'low',
    tags: ['meal timing', 'routine', 'metabolism']
  }
];

export default function HealthTipsGenerator({
  glucose,
  heartRate,
  spo2,
  userAge,
  userWeight,
  userHeight,
  userCondition
}: HealthTipsGeneratorProps) {
  const [loading, setLoading] = useState(true);
  const [selectedTips, setSelectedTips] = useState<HealthTip[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  // Determine relevant health tips based on metrics
  useEffect(() => {
    setLoading(true);
    
    // Wait for mock API response
    const timer = setTimeout(() => {
      const selectedTips: HealthTip[] = [];
      
      // Generate glucose-related tips
      if (glucose !== null) {
        if (glucose > 180) {
          // High glucose
          selectedTips.push(
            healthTipsData.find(tip => tip.id === 'g4') as HealthTip,
            healthTipsData.find(tip => tip.id === 'g1') as HealthTip,
            healthTipsData.find(tip => tip.id === 'g2') as HealthTip
          );
        } else if (glucose < 70) {
          // Low glucose
          selectedTips.push(
            healthTipsData.find(tip => tip.id === 'g5') as HealthTip
          );
        } else {
          // Normal glucose
          selectedTips.push(
            healthTipsData.find(tip => tip.id === 'g2') as HealthTip,
            healthTipsData.find(tip => tip.id === 'g3') as HealthTip
          );
        }
      }
      
      // Generate heart rate-related tips
      if (heartRate !== null) {
        if (heartRate > 100) {
          // High heart rate
          selectedTips.push(
            healthTipsData.find(tip => tip.id === 'h3') as HealthTip,
            healthTipsData.find(tip => tip.id === 'h2') as HealthTip,
            healthTipsData.find(tip => tip.id === 'h4') as HealthTip
          );
        } else {
          // Normal heart rate
          selectedTips.push(
            healthTipsData.find(tip => tip.id === 'h1') as HealthTip
          );
        }
      }
      
      // Generate SpO2-related tips
      if (spo2 !== null) {
        if (spo2 < 95) {
          // Low oxygen
          selectedTips.push(
            healthTipsData.find(tip => tip.id === 's2') as HealthTip,
            healthTipsData.find(tip => tip.id === 's1') as HealthTip
          );
        } else if (spo2 < 98) {
          // Borderline low oxygen
          selectedTips.push(
            healthTipsData.find(tip => tip.id === 's1') as HealthTip,
            healthTipsData.find(tip => tip.id === 's3') as HealthTip
          );
        }
      }
      
      // Always include some general tips
      selectedTips.push(
        healthTipsData.find(tip => tip.id === 'gen1') as HealthTip,
        healthTipsData.find(tip => tip.id === 'gen3') as HealthTip
      );
      
      // Add condition-specific tips if user condition is known
      if (userCondition === 'diabetes') {
        selectedTips.push(
          healthTipsData.find(tip => tip.id === 'g1') as HealthTip,
          healthTipsData.find(tip => tip.id === 'g2') as HealthTip
        );
      }
      
      // Remove duplicates
      const uniqueTips = Array.from(new Set(selectedTips.map(tip => tip.id)))
        .map(id => selectedTips.find(tip => tip.id === id)) as HealthTip[];
      
      // Sort by priority
      const priorityMap = { 'high': 0, 'medium': 1, 'low': 2 };
      const sortedTips = uniqueTips.sort((a, b) => 
        priorityMap[a.priority] - priorityMap[b.priority]
      );
      
      setSelectedTips(sortedTips);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [glucose, heartRate, spo2, userCondition]);
  
  // Filter tips based on selected category
  const filteredTips = activeTab === "all" 
    ? selectedTips 
    : selectedTips.filter(tip => tip.category === activeTab || tip.category === 'general');
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Interactive Health Tips</CardTitle>
        <CardDescription>
          Personalized recommendations based on your health metrics
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All Tips</TabsTrigger>
            <TabsTrigger value="glucose" className="text-xs sm:text-sm">Glucose</TabsTrigger>
            <TabsTrigger value="heartRate" className="text-xs sm:text-sm">Heart Rate</TabsTrigger>
            <TabsTrigger value="spo2" className="text-xs sm:text-sm">SpO2</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Generating health tips...</span>
              </div>
            ) : filteredTips.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {filteredTips.map((tip) => (
                  <AccordionItem key={tip.id} value={tip.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center">
                        <span className="mr-2">{tip.title}</span>
                        {tip.priority === 'high' && (
                          <Badge variant="destructive" className="ml-1">Important</Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pb-2">{tip.description}</div>
                      <div className="flex flex-wrap gap-1">
                        {tip.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                No tips available for the selected category.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <p className="text-xs text-muted-foreground">
          Tips are based on your current health metrics
        </p>
        <Button variant="outline" size="sm" onClick={() => setLoading(true)}>
          <i className="ri-refresh-line mr-1"></i> Refresh
        </Button>
      </CardFooter>
    </Card>
  );
}