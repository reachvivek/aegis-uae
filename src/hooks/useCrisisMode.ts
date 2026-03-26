"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useCrisisMode() {
  const { data, mutate } = useSWR("/api/admin/crisis-mode", fetcher, {
    refreshInterval: 5_000,
    revalidateOnFocus: true,
  });

  const active = data?.active === true;

  // Apply/remove crisis-mode class on <html>
  useEffect(() => {
    if (active) {
      document.documentElement.classList.add("crisis-mode");
    } else {
      document.documentElement.classList.remove("crisis-mode");
    }
    return () => {
      document.documentElement.classList.remove("crisis-mode");
    };
  }, [active]);

  return { crisisMode: active, mutate };
}
