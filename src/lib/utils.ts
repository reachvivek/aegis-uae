import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "normal": case "open": case "low": return "text-success";
    case "elevated": case "moderate": return "text-amber";
    case "critical": case "closed": case "high": return "text-danger";
    default: return "text-muted-foreground";
  }
}

export function getStatusBg(status: string): string {
  switch (status.toLowerCase()) {
    case "normal": case "open": case "low": return "bg-success-dim";
    case "elevated": case "moderate": return "bg-amber-dim";
    case "critical": case "closed": case "high": return "bg-danger-dim";
    default: return "bg-muted";
  }
}
