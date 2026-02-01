/**
 * Utility functions for date formatting and parsing
 */

const PARIS_TIMEZONE = 'Europe/Paris';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/**
 * Get date components in Paris timezone
 */
function getParisDateParts(date: Date): {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hours: number;
  minutes: number;
} {
  // Use Intl.DateTimeFormat to get parts in Paris timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: PARIS_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '0';

  // Map weekday abbreviation to day index (0 = Sunday)
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year: parseInt(get('year'), 10),
    month: parseInt(get('month'), 10) - 1, // 0-indexed like JS Date
    day: parseInt(get('day'), 10),
    weekday: weekdayMap[get('weekday')] ?? 0,
    hours: parseInt(get('hour'), 10),
    minutes: parseInt(get('minute'), 10),
  };
}

/**
 * Format a date as French time (e.g., "20h35") in Paris timezone
 */
export function formatTime(date: Date): string {
  const { hours, minutes } = getParisDateParts(date);
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}

/**
 * Format a date as French full date (e.g., "Lundi 27 janvier 2025") in Paris timezone
 */
export function formatDateFR(date: Date): string {
  const { weekday, day, month, year } = getParisDateParts(date);
  const dayName = DAYS_FR[weekday];
  const monthName = MONTHS_FR[month];
  return `${dayName} ${day} ${monthName} ${year}`;
}

/**
 * Parse XMLTV date format (YYYYMMDDHHmmss +0100) to Date
 */
export function parseXmltvDate(xmltvDate: string): Date {
  // Format: 20250127203500 +0100
  const dateStr = xmltvDate.trim();

  // Extract components
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // 0-indexed
  const day = parseInt(dateStr.substring(6, 8), 10);
  const hours = parseInt(dateStr.substring(8, 10), 10);
  const minutes = parseInt(dateStr.substring(10, 12), 10);
  const seconds = parseInt(dateStr.substring(12, 14), 10);

  // Parse timezone offset if present (e.g., +0100)
  const tzMatch = dateStr.match(/([+-])(\d{2})(\d{2})$/);
  if (tzMatch) {
    const tzSign = tzMatch[1] === '+' ? 1 : -1;
    const tzHours = parseInt(tzMatch[2], 10);
    const tzMinutes = parseInt(tzMatch[3], 10);
    const tzOffsetMs = tzSign * (tzHours * 60 + tzMinutes) * 60 * 1000;

    // Create UTC date and adjust for timezone
    const utcDate = Date.UTC(year, month, day, hours, minutes, seconds);
    return new Date(utcDate - tzOffsetMs);
  }

  // No timezone, assume local time
  return new Date(year, month, day, hours, minutes, seconds);
}

/**
 * Get today's date at a specific hour in Paris timezone
 */
function getTodayAt(hour: number, minute: number = 0): Date {
  const now = new Date();
  const { year, month, day } = getParisDateParts(now);

  // Create a date string in Paris timezone and parse it
  // Format: YYYY-MM-DDTHH:mm:ss
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

  // Parse this as a Paris time by creating a formatter that outputs the offset
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: PARIS_TIMEZONE,
    timeZoneName: 'shortOffset',
  });

  // Get the current Paris offset (handles DST automatically)
  const parts = formatter.formatToParts(now);
  const offsetPart = parts.find((p) => p.type === 'timeZoneName')?.value || '+01:00';
  // Convert "GMT+1" or "GMT+2" to "+01:00" or "+02:00"
  const offsetMatch = offsetPart.match(/GMT([+-])(\d+)/);
  let isoOffset = '+01:00';
  if (offsetMatch) {
    const sign = offsetMatch[1];
    const hours = offsetMatch[2].padStart(2, '0');
    isoOffset = `${sign}${hours}:00`;
  }

  return new Date(`${dateStr}${isoOffset}`);
}

/**
 * Check if a programme is in prime time evening slots
 * Only keep programmes that end after 21h15 (first and second part of evening)
 * This filters out JT, weather, and short pre-evening shows
 */
export function isPrimeTime(start: Date, stop: Date): boolean {
  const minEndTime = getTodayAt(21, 15); // Programme must end after 21h15
  const maxStartTime = getTodayAt(23, 30); // Programme must start before 23h30

  // Programme ends after 21h15 AND starts before 23h30
  return stop > minEndTime && start < maxStartTime;
}

/**
 * Extract text from XMLTV field that can be string or object with #text
 */
export function extractText(field: string | { '#text': string } | undefined): string | undefined {
  if (!field) return undefined;
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && '#text' in field) return field['#text'];
  // Handle unexpected types (e.g., numbers that XML parser might return)
  return String(field);
}

/**
 * Extract first icon URL from XMLTV icon field
 */
export function extractIcon(field: { '@_src': string } | { '@_src': string }[] | undefined): string | undefined {
  if (!field) return undefined;
  if (Array.isArray(field)) {
    return field[0]?.['@_src'];
  }
  return field['@_src'];
}

/**
 * Extract first category from XMLTV category field
 */
export function extractCategory(
  field: string | { '#text': string } | (string | { '#text': string })[] | undefined,
): string | undefined {
  if (!field) return undefined;
  if (Array.isArray(field)) {
    return extractText(field[0]);
  }
  return extractText(field);
}

/**
 * Extract a list of names from XMLTV credits field (actors, directors, presenters)
 * Handles string, array, or object with #text
 */
export function extractNameList(
  field: string | { '#text': string } | (string | { '#text': string })[] | undefined,
): string[] {
  if (!field) return [];
  if (Array.isArray(field)) {
    return field.map((item) => extractText(item) || '').filter(Boolean);
  }
  const text = extractText(field);
  return text ? [text] : [];
}

/**
 * Generate a unique ID for a programme based on channel, start time, and title
 */
export function generateProgrammeId(channelId: string, start: Date, title: string): string {
  const timestamp = start.getTime();
  // Ensure title is a string before processing
  const safeTitle = typeof title === 'string' ? title : String(title || '');
  const titleSlug = safeTitle
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  return `${channelId}-${timestamp}-${titleSlug}`;
}
