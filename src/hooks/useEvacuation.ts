"use client";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useEvacuation() {
  const { data, error, isLoading, mutate } = useSWR("/api/evacuation", fetcher, {
    refreshInterval: 1800_000,
    revalidateOnFocus: false,
  });

  return {
    routes: data?.routes || [],
    airborne: data?.airborne || 0,
    isLoading,
    isError: !!error,
    mutate,
  };
}
