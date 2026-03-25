"use client";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useWeather() {
  const { data, error, isLoading, mutate } = useSWR("/api/weather", fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });

  return {
    zones: data?.zones || [],
    locations: data?.locations || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
