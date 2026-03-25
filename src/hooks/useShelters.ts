"use client";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useShelters() {
  const { data, error, isLoading, mutate } = useSWR("/api/shelters", fetcher, {
    refreshInterval: 86400_000,
    revalidateOnFocus: false,
  });

  return {
    shelters: data?.shelters || [],
    count: data?.count || 0,
    isLoading,
    isError: !!error,
    mutate,
  };
}
