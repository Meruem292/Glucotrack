import { getHealthStatus } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: string;
  metricType: string;
}

export default function MetricCard({ title, value, unit, icon, metricType }: MetricCardProps) {
  const { status, color } = getHealthStatus(metricType, value);
  
  // Map color names to Tailwind classes
  const getColorClasses = (colorName: string) => {
    switch (colorName) {
      case "success":
        return {
          bg: "bg-green-500/20",
          text: "text-green-500"
        };
      case "warning":
        return {
          bg: "bg-yellow-500/20",
          text: "text-yellow-500"
        };
      case "danger":
        return {
          bg: "bg-red-500/20",
          text: "text-red-500"
        };
      case "muted":
      default:
        return {
          bg: "bg-gray-500/20",
          text: "text-gray-500"
        };
    }
  };
  
  const colorClasses = getColorClasses(color);
  
  return (
    <div className="relative overflow-hidden rounded-xl bg-secondary p-5">
      <div className="flex flex-col">
        <span className="mb-1 text-sm text-muted-foreground">{title}</span>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-foreground">{value}</span>
          <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
        </div>
        <div className="mt-2 flex items-center">
          <span className={`rounded-full ${colorClasses.bg} px-2 py-1 text-xs ${colorClasses.text}`}>
            {status}
          </span>
        </div>
      </div>
      <div className="absolute right-4 top-4 text-4xl text-accent opacity-20">
        <i className={icon}></i>
      </div>
    </div>
  );
}
