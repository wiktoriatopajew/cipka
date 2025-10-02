import { useEffect, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";

export function useOnlineStatus(enabled: boolean = true) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Send heartbeat immediately
    const sendHeartbeat = async () => {
      try {
        await apiRequest("POST", "/api/users/heartbeat");
      } catch (error) {
        // Silently fail - user might not be logged in
        console.log('Heartbeat failed:', error);
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Send heartbeat every 30 seconds
    intervalRef.current = setInterval(sendHeartbeat, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled]);
}
