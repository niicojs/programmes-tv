import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function heure(input: Date | number) {
  const date = input instanceof Date ? input : new Date(input);
  return Intl.DateTimeFormat('fr', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}
