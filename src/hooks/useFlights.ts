"use client";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useFlights() {
  const { data, error, isLoading, mutate } = useSWR("/api/flights", fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });

  return {
    flights: data?.flights || [],
    airports: data?.airports || [],
    airborne: data?.airborne || 0,
    isLoading,
    isError: !!error,
    mutate,
  };
}
