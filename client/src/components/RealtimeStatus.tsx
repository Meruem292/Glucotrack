interface RealtimeStatusProps {
  isConnected: boolean;
}

export default function RealtimeStatus({ isConnected }: RealtimeStatusProps) {
  return (
    <div className="mb-3 flex items-center">
      <div className={`mr-2 h-3 w-3 rounded-full ${isConnected ? 'animate-pulse bg-success' : 'bg-destructive'}`}></div>
      <span className="text-sm text-muted-foreground">
        {isConnected 
          ? "Device connected and sending data" 
          : "No device connection detected"}
      </span>
    </div>
  );
}
