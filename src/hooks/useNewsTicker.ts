"use client";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useNewsTicker() {
  const { data, error, isLoading, mutate } = useSWR("/api/news/ticker", fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });

  return {
    items: data?.items || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
