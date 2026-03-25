"use client";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useStatus() {
  const { data, error, isLoading, mutate } = useSWR("/api/status", fetcher, {
    refreshInterval: 10_000,
    revalidateOnFocus: false,
  });

  return {
    items: data?.items || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
