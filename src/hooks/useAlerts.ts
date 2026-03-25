"use client";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useAlerts() {
  const { data, error, isLoading, mutate } = useSWR("/api/alerts", fetcher, {
    refreshInterval: 10_000,
    revalidateOnFocus: false,
  });

  return {
    alerts: data?.alerts || [],
    count: data?.count || 0,
    isLoading,
    isError: !!error,
    mutate,
  };
}
