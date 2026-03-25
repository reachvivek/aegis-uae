"use client";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useConnectivity() {
  const { data, error, isLoading, mutate } = useSWR("/api/flights/connectivity", fetcher, {
    refreshInterval: 3600_000,
    revalidateOnFocus: false,
  });

  return {
    routes: data?.routes || [],
    baselineHealth: data?.baselineHealth || 0,
    airborne: data?.airborne || 0,
    isLoading,
    isError: !!error,
    mutate,
  };
}
