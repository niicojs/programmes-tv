/**
 * Utility functions for date formatting and parsing
 */

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
 * Format a date as French time (e.g., "20h35")
 */
export function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}

/**
 * Format a date as French full date (e.g., "Lundi 27 janvier 2025")
 */
export function formatDateFR(date: Date): string {
  const dayName = DAYS_FR[date.getDay()];
  const day = date.getDate();
  const month = MONTHS_FR[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName} ${day} ${month} ${year}`;
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
 * Get today's date at a specific hour (in local timezone)
 */
export function getTodayAt(hour: number, minute: number = 0): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
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
  const titleSlug = safeTitle.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  return `${channelId}-${timestamp}-${titleSlug}`;
}
