"use client";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useNews() {
  const { data, error, isLoading, mutate } = useSWR("/api/news", fetcher, {
    refreshInterval: 300_000,
    revalidateOnFocus: false,
  });

  return {
    articles: data?.articles || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
