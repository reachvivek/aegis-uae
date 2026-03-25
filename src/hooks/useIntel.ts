"use client";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useIntel() {
  const { data, error, isLoading, mutate } = useSWR("/api/intel", fetcher, {
    refreshInterval: 900_000,
    revalidateOnFocus: false,
  });

  return {
    developments: data?.developments || [],
    totalArticles: data?.totalArticles || 0,
    isLoading,
    isError: !!error,
    mutate,
  };
}
