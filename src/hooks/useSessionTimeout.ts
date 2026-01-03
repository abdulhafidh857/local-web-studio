import { useEffect, useRef, useCallback } from "react";

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  onTimeout: () => void;
  enabled?: boolean;
}

export const useSessionTimeout = ({
  timeoutMinutes = 30,
  onTimeout,
  enabled = true,
}: UseSessionTimeoutOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (enabled) {
      timeoutRef.current = setTimeout(() => {
        onTimeout();
      }, timeoutMinutes * 60 * 1000);
    }
  }, [timeoutMinutes, onTimeout, enabled]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Activity events to track
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    // Throttle the reset to avoid excessive calls
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledReset = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          resetTimeout();
          throttleTimeout = null;
        }, 1000); // Throttle to once per second
      }
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, throttledReset, { passive: true });
    });

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Check if session should have expired while tab was hidden
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        if (timeSinceLastActivity >= timeoutMinutes * 60 * 1000) {
          onTimeout();
        } else {
          resetTimeout();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start initial timeout
    resetTimeout();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
      activityEvents.forEach((event) => {
        document.removeEventListener(event, throttledReset);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, resetTimeout, timeoutMinutes, onTimeout]);

  return { resetTimeout };
};
