import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface Reading {
  glucose: number;
  heartRate: number;
  spo2: number;
  timestamp: number;
}

interface HealthTrendsProps {
  readings: Reading[];
  timeFrame: string;
}

export default function HealthTrends({ readings, timeFrame }: HealthTrendsProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Process the data for charts
  useEffect(() => {
    if (!readings.length) {
      setChartData([]);
      return;
    }

    // Sort readings by timestamp (oldest first for charting)
    const sortedReadings = [...readings].sort((a, b) => a.timestamp - b.timestamp);

    // Process for chart display
    const processed = sortedReadings.map((reading) => {
      // Format timestamp for display
      const date = new Date(reading.timestamp);
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      
      return {
        glucose: reading.glucose,
        heartRate: reading.heartRate,
        spo2: reading.spo2,
        timestamp: reading.timestamp,
        date: formattedDate,
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
    });

    setChartData(processed);
  }, [readings]);

  // Format the tooltip values
  const formatTooltip = (value: number, name: string) => {
    if (name === "glucose") return `${value} mg/dL`;
    if (name === "heartRate") return `${value} BPM`;
    if (name === "spo2") return `${value}%`;
    return value;
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card p-2 shadow-md">
          <p className="mb-1 text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} className="text-xs" style={{ color: entry.color }}>
              {`${entry.name === "glucose" ? "Glucose" : 
                 entry.name === "heartRate" ? "Heart Rate" : 
                 entry.name === "spo2" ? "SpO2" : entry.name}: ${entry.value}${
                 entry.name === "glucose" ? " mg/dL" : 
                 entry.name === "heartRate" ? " BPM" : 
                 entry.name === "spo2" ? "%" : ""}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Range markers for normal ranges
  const renderReferenceLines = (metric: string) => {
    if (metric === "glucose") {
      return (
        <>
          <Area 
            type="monotone" 
            dataKey="glucose" 
            stroke="#4285F4" 
            fill="#4285F4" 
            fillOpacity={0.2}
            activeDot={{ r: 6 }} 
          />
        </>
      );
    }
    
    if (metric === "heartRate") {
      return (
        <>
          <Line 
            type="monotone" 
            dataKey="heartRate" 
            stroke="#F44236" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }} 
          />
        </>
      );
    }
    
    if (metric === "spo2") {
      return (
        <>
          <Line 
            type="monotone" 
            dataKey="spo2" 
            stroke="#4CAF50" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }} 
          />
        </>
      );
    }
    
    return null;
  };

  // Get the date range display
  const getDateRangeDisplay = () => {
    if (chartData.length === 0) return "No data";
    
    const firstDate = new Date(chartData[0].timestamp);
    const lastDate = new Date(chartData[chartData.length - 1].timestamp);
    
    return `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
  };

  // Calculate metrics statistics
  const calculateStats = (metric: string) => {
    if (chartData.length === 0) {
      return { avg: 0, min: 0, max: 0, current: 0 };
    }

    const values = chartData.map(item => item[metric]);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
      avg: Math.round(sum / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
      current: values[values.length - 1]
    };
  };

  // Get normal range text
  const getNormalRangeText = (metric: string) => {
    if (metric === "glucose") return "70-180 mg/dL";
    if (metric === "heartRate") return "60-100 BPM";
    if (metric === "spo2") return "95-100%";
    return "";
  };

  // Get units for metrics
  const getMetricUnit = (metric: string) => {
    if (metric === "glucose") return "mg/dL";
    if (metric === "heartRate") return "BPM";
    if (metric === "spo2") return "%";
    return "";
  };

  const glucoseStats = calculateStats("glucose");
  const heartRateStats = calculateStats("heartRate");
  const spo2Stats = calculateStats("spo2");

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle>Health Metrics Analytics</CardTitle>
        <p className="text-sm text-muted-foreground">
          {getDateRangeDisplay()}
        </p>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="all">All Metrics</TabsTrigger>
            <TabsTrigger value="glucose">Glucose</TabsTrigger>
            <TabsTrigger value="heartRate">Heart Rate</TabsTrigger>
            <TabsTrigger value="spo2">SpO2</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-3">
                <h3 className="text-sm font-medium text-primary">Glucose</h3>
                <div className="mt-1 text-2xl font-semibold">{glucoseStats.current} mg/dL</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Avg: {glucoseStats.avg} mg/dL • Range: {glucoseStats.min}-{glucoseStats.max} mg/dL
                </div>
              </div>
              
              <div className="rounded-lg border bg-card p-3">
                <h3 className="text-sm font-medium text-primary">Heart Rate</h3>
                <div className="mt-1 text-2xl font-semibold">{heartRateStats.current} BPM</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Avg: {heartRateStats.avg} BPM • Range: {heartRateStats.min}-{heartRateStats.max} BPM
                </div>
              </div>
              
              <div className="rounded-lg border bg-card p-3">
                <h3 className="text-sm font-medium text-primary">SpO2</h3>
                <div className="mt-1 text-2xl font-semibold">{spo2Stats.current}%</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Avg: {spo2Stats.avg}% • Range: {spo2Stats.min}-{spo2Stats.max}%
                </div>
              </div>
            </div>
            
            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      domain={[60, 200]} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      domain={[50, 110]}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="glucose" 
                      stroke="#4285F4" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Glucose"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="#F44236" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Heart Rate"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="spo2" 
                      stroke="#4CAF50" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="SpO2"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No data available for selected time frame</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Glucose Tab */}
          <TabsContent value="glucose">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Glucose Levels</h3>
                <p className="text-sm text-muted-foreground">Normal range: {getNormalRangeText("glucose")}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold">{glucoseStats.current} mg/dL</div>
                <div className="text-sm text-muted-foreground">Current reading</div>
              </div>
            </div>
            
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg border bg-card p-3 text-center">
                <div className="text-sm text-muted-foreground">Average</div>
                <div className="text-xl font-medium">{glucoseStats.avg} mg/dL</div>
              </div>
              <div className="rounded-lg border bg-card p-3 text-center">
                <div className="text-sm text-muted-foreground">Minimum</div>
                <div className="text-xl font-medium">{glucoseStats.min} mg/dL</div>
              </div>
              <div className="rounded-lg border bg-card p-3 text-center">
                <div className="text-sm text-muted-foreground">Maximum</div>
                <div className="text-xl font-medium">{glucoseStats.max} mg/dL</div>
              </div>
            </div>
            
            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      domain={[
                        Math.max(0, glucoseStats.min - 10),
                        glucoseStats.max + 10
                      ]}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {renderReferenceLines("glucose")}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No glucose data available</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Heart Rate Tab */}
          <TabsContent value="heartRate">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Heart Rate</h3>
                <p className="text-sm text-muted-foreground">Normal range: {getNormalRangeText("heartRate")}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold">{heartRateStats.current} BPM</div>
                <div className="text-sm text-muted-foreground">Current reading</div>
              </div>
            </div>
            
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg border bg-card p-3 text-center">
                <div className="text-sm text-muted-foreground">Average</div>
                <div className="text-xl font-medium">{heartRateStats.avg} BPM</div>
              </div>
              <div className="rounded-lg border bg-card p-3 text-center">
                <div className="text-sm text-muted-foreground">Minimum</div>
                <div className="text-xl font-medium">{heartRateStats.min} BPM</div>
              </div>
              <div className="rounded-lg border bg-card p-3 text-center">
                <div className="text-sm text-muted-foreground">Maximum</div>
                <div className="text-xl font-medium">{heartRateStats.max} BPM</div>
              </div>
            </div>
            
            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      domain={[
                        Math.max(0, heartRateStats.min - 5),
                        heartRateStats.max + 5
                      ]}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {renderReferenceLines("heartRate")}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No heart rate data available</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* SpO2 Tab */}
          <TabsContent value="spo2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Oxygen Saturation</h3>
                <p className="text-sm text-muted-foreground">Normal range: {getNormalRangeText("spo2")}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold">{spo2Stats.current}%</div>
                <div className="text-sm text-muted-foreground">Current reading</div>
              </div>
            </div>
            
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg border bg-card p-3 text-center">
                <div className="text-sm text-muted-foreground">Average</div>
                <div className="text-xl font-medium">{spo2Stats.avg}%</div>
              </div>
              <div className="rounded-lg border bg-card p-3 text-center">
                <div className="text-sm text-muted-foreground">Minimum</div>
                <div className="text-xl font-medium">{spo2Stats.min}%</div>
              </div>
              <div className="rounded-lg border bg-card p-3 text-center">
                <div className="text-sm text-muted-foreground">Maximum</div>
                <div className="text-xl font-medium">{spo2Stats.max}%</div>
              </div>
            </div>
            
            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      domain={[
                        Math.max(80, spo2Stats.min - 2),
                        100
                      ]}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {renderReferenceLines("spo2")}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No SpO2 data available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}