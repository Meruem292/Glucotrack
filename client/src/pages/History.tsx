import { useEffect, useState } from "react";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { database, auth } from "@/lib/firebase";
import { formatDate, getHealthStatus } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Reading {
  id: string;
  glucose: number;
  heartRate: number;
  spo2: number;
  timestamp: number | string;
}

export default function History() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [timeFrame, setTimeFrame] = useState("7");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const readingsRef = query(
      ref(database, `users/${userId}/readings`),
      orderByChild('timestamp')
    );

    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const readingsArray = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value
        }));
        
        // Sort by timestamp (newest first)
        const sortedReadings = readingsArray.sort((a, b) => b.timestamp - a.timestamp);
        
        // Filter by time frame if needed
        const filteredReadings = filterReadingsByTimeFrame(sortedReadings, parseInt(timeFrame));
        
        setReadings(filteredReadings);
      } else {
        setReadings([]);
      }
    });

    return () => unsubscribe();
  }, [timeFrame]);

  const filterReadingsByTimeFrame = (readings: Reading[], days: number) => {
    if (days === 0) return readings; // All time
    
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    return readings.filter(reading => {
      // If timestamp is a number, do direct comparison
      if (typeof reading.timestamp === 'number') {
        return reading.timestamp >= cutoffTime;
      } 
      // If timestamp is a string, we need to compare dates
      else if (typeof reading.timestamp === 'string') {
        try {
          // Try to convert string timestamp to Date object for comparison
          // Assuming format like "*YYYY-MM-DD HH:MM:SS*"
          const cleanTimestamp = reading.timestamp.replace(/[*"]/g, '');
          // Replace space with T for ISO format
          const parts = cleanTimestamp.split(' ');
          if (parts.length === 2) {
            const isoString = `${parts[0]}T${parts[1]}`;
            const readingDate = new Date(isoString);
            return !isNaN(readingDate.getTime()) && readingDate.getTime() >= cutoffTime;
          }
          return true;
        } catch (e) {
          // If date parsing fails, include the reading by default
          return true;
        }
      }
      return true;
    });
  };

  // Pagination related calculations

  // Pagination
  const totalPages = Math.ceil(readings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReadings = readings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
        <h2 className="mb-4 text-xl font-semibold md:mb-0">Health History</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="max-w-[180px]">
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
      </div>

      {/* History Table */}
      <div className="mb-6 overflow-hidden rounded-xl bg-secondary">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date & Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Glucose (mg/dL)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Heart Rate (BPM)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">SpO2 (%)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {paginatedReadings.length > 0 ? (
                paginatedReadings.map((reading) => {
                  const status = getHealthStatus("glucose", reading.glucose);
                  return (
                    <tr key={reading.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(new Date(reading.timestamp))}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{reading.glucose}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{reading.heartRate}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{reading.spo2}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full bg-${status.color}/20 px-2 py-0.5 text-xs font-medium text-${status.color}`}>
                          {status.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No health data recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {readings.length > 0 && (
          <div className="flex items-center justify-between bg-muted px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, readings.length)} of {readings.length} results
            </span>
            <div className="flex space-x-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded bg-secondary px-3 py-1 text-muted-foreground hover:bg-blue-600/20 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`rounded px-3 py-1 ${
                      currentPage === pageNum ? "bg-accent text-white" : "bg-secondary text-muted-foreground hover:bg-blue-600/20"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="rounded bg-secondary px-3 py-1 text-muted-foreground hover:bg-blue-600/20 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
