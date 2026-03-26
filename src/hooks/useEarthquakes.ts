"use client";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useEarthquakes() {
  const { data, error, isLoading, mutate } = useSWR("/api/earthquakes", fetcher, {
    refreshInterval: 900_000,
    revalidateOnFocus: false,
  });

  return {
    quakes: data?.quakes || [],
    count: data?.count || 0,
    isLoading,
    isError: !!error,
    mutate,
  };
}
