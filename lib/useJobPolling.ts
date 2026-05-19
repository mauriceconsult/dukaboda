// lib/useJobPolling.ts
//
// Polls /api/delivery/jobs every INTERVAL ms.
// Stops polling when the app is backgrounded (AppState).
// Exposes loading, error, and a manual refetch.

import { useState, useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import type { DeliveryJob } from "@/types/delivery";

const INTERVAL = 10_000; // 10 seconds

type FetchFn = (token: string) => Promise<DeliveryJob[]>;

export function useJobPolling(fetchFn: FetchFn) {
  const { getToken } = useAuth();
  const [jobs, setJobs]       = useState<DeliveryJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef  = useRef<AppStateStatus>(AppState.currentState);

  const fetchJobs = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await fetchFn(token);
      setJobs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [fetchFn, getToken]);

  const startPolling = useCallback(() => {
    fetchJobs(); // immediate first fetch
    intervalRef.current = setInterval(fetchJobs, INTERVAL);
  }, [fetchJobs]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Pause polling when app goes to background, resume on foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        next === "active"
      ) {
        startPolling();
      } else if (next.match(/inactive|background/)) {
        stopPolling();
      }
      appStateRef.current = next;
    });

    startPolling();

    return () => {
      stopPolling();
      sub.remove();
    };
  }, [startPolling, stopPolling]);

  return { jobs, loading, error, refetch: fetchJobs };
}
