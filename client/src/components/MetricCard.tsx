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
  
  return (
    <div className="relative overflow-hidden rounded-xl bg-secondary p-5">
      <div className="flex flex-col">
        <span className="mb-1 text-sm text-muted-foreground">{title}</span>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-foreground">{value}</span>
          <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
        </div>
        <div className="mt-2 flex items-center">
          <span className={`rounded-full bg-${color}/20 px-2 py-1 text-xs text-${color}`}>
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
