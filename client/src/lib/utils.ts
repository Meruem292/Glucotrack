import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  const months = [
    "01", "02", "03", "04", "05", "06", 
    "07", "08", "09", "10", "11", "12"
  ];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
}

export function getHealthStatus(
  metric: string,
  value: number
): { status: string; color: string } {
  switch (metric) {
    case "glucose":
      if (value < 70) return { status: "Low", color: "warning" };
      if (value > 180) return { status: "High", color: "danger" };
      if (value > 140) return { status: "Elevated", color: "warning" };
      return { status: "Normal", color: "success" };
    
    case "heartRate":
      if (value < 60) return { status: "Low", color: "warning" };
      if (value > 100) return { status: "High", color: "danger" };
      return { status: "Normal", color: "success" };
    
    case "spo2":
      if (value < 95) return { status: "Low", color: "danger" };
      if (value < 97) return { status: "Fair", color: "warning" };
      return { status: "Excellent", color: "success" };
    
    default:
      return { status: "Unknown", color: "muted" };
  }
}
