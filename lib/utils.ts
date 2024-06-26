import { type ClassValue, clsx } from 'clsx';
import { toZonedTime } from 'date-fns-tz';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function heure(input: Date | number) {
  const date = input instanceof Date ? input : new Date(input);
  const local = toZonedTime(date, 'Europe/Paris');
  return Intl.DateTimeFormat('fr', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(local);
}
