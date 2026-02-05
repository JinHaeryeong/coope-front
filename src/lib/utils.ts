import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: number | string) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: '2-digit', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date));
};

export const isToday = (dateString: string) => {
  const today = new Date();
  const targetDate = new Date(dateString);

  return (
    today.getFullYear() === targetDate.getFullYear() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getDate() === targetDate.getDate()
  );
};