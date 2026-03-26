"use client";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useStats() {
  const { data, error, isLoading, mutate } = useSWR("/api/stats", fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });

  return {
    aviation: data?.aviation || { airborne: 0, airports: 0, trackedFlights: 0 },
    defense: data?.defense || { totalEvents: 0, missiles: 0, drones: 0, escalations: 0 },
    weather: data?.weather || { zones: 0, hasThunder: false, hasRain: false },
    lastSynced: data?.lastSynced || { flights: null, threats: null, weather: null },
    isLoading,
    isError: !!error,
    mutate,
  };
}
