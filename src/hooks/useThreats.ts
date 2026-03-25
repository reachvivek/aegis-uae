"use client";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useThreats() {
  const { data, error, isLoading, mutate } = useSWR("/api/threats", fetcher, {
    refreshInterval: 15_000,
    revalidateOnFocus: false,
  });

  return {
    events: data?.events || [],
    stats: data?.stats || {},
    isLoading,
    isError: !!error,
    mutate,
  };
}
