/**
 * XMLTV parser - fetches and parses TV schedule data
 */

import { XMLParser } from 'fast-xml-parser';
import { gunzipSync } from 'fflate';

import type {
  Channel,
  Programme,
  Credits,
  ChannelWithProgrammes,
  XmltvRaw,
  XmltvChannelRaw,
  XmltvProgrammeRaw,
} from './types';
import {
  parseXmltvDate,
  isPrimeTime,
  extractText,
  extractIcon,
  extractCategory,
  extractNameList,
  generateProgrammeId,
} from './utils';

const XMLTV_URL = 'https://xmltvfr.fr/xmltv/xmltv_tnt.xml.gz';

const IGNORE_CHANNELS = new Set<string>([
  'LCI.fr',
  'LaChaineParlementaire.fr',
  'BFMTV.fr',
  'CNews.fr',
  'FranceInfo.fr',
]);

// TNT channel order (by channel number)
const TNT_CHANNEL_ORDER: Record<string, number> = {
  'C1.telepoche.com': 1, // TF1
  'C2.telepoche.com': 2, // France 2
  'C3.telepoche.com': 3, // France 3
  'C4.telepoche.com': 4, // Canal+
  'C5.telepoche.com': 5, // France 5
  'C6.telepoche.com': 6, // M6
  'C7.telepoche.com': 7, // Arte
  'C8.telepoche.com': 8, // C8
  'C9.telepoche.com': 9, // W9
  'C10.telepoche.com': 10, // TMC
  'C11.telepoche.com': 11, // TFX
  'C12.telepoche.com': 12, // NRJ 12
  'C13.telepoche.com': 13, // LCP
  'C14.telepoche.com': 14, // France 4
  'C15.telepoche.com': 15, // BFM TV
  'C16.telepoche.com': 16, // CNEWS
  'C17.telepoche.com': 17, // CSTAR
  'C18.telepoche.com': 18, // Gulli
  'C19.telepoche.com': 19, // TF1 Séries Films
  'C20.telepoche.com': 20, // L'Équipe
  'C21.telepoche.com': 21, // 6ter
  'C22.telepoche.com': 22, // RMC Story
  'C23.telepoche.com': 23, // RMC Découverte
  'C24.telepoche.com': 24, // Chérie 25
  'C25.telepoche.com': 25, // LCI
  'C26.telepoche.com': 26, // Franceinfo
};

/**
 * Fetch and decompress XMLTV data
 */
async function fetchXmltvData(): Promise<string> {
  const response = await fetch(XMLTV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch XMLTV data: ${response.status} ${response.statusText}`);
  }

  const compressedBuffer = await response.arrayBuffer();
  const compressedData = new Uint8Array(compressedBuffer);
  const decompressedData = gunzipSync(compressedData);
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(decompressedData);
}

/**
 * Parse XMLTV XML string
 */
function parseXml(xmlString: string): XmltvRaw {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  return parser.parse(xmlString);
}

/**
 * Parse channel from raw XMLTV data
 */
function parseChannel(raw: XmltvChannelRaw): Channel {
  return {
    id: raw['@_id'],
    name: extractText(raw['display-name']) || raw['@_id'],
    icon: extractIcon(raw.icon),
  };
}

/**
 * Extract credits from raw XMLTV credits data
 */
function extractCredits(raw: XmltvProgrammeRaw['credits']): Credits {
  if (!raw) {
    return { directors: [], actors: [], presenters: [] };
  }
  return {
    directors: extractNameList(raw.director),
    actors: extractNameList(raw.actor),
    presenters: extractNameList(raw.presenter),
  };
}

/**
 * Parse programme from raw XMLTV data
 */
function parseProgramme(raw: XmltvProgrammeRaw): Programme {
  const channelId = raw['@_channel'];
  const start = parseXmltvDate(raw['@_start']);
  const title = extractText(raw.title) || 'Sans titre';

  return {
    id: generateProgrammeId(channelId, start, title),
    channelId,
    start,
    stop: parseXmltvDate(raw['@_stop']),
    title,
    subtitle: extractText(raw['sub-title']),
    description: extractText(raw.desc),
    category: extractCategory(raw.category),
    icon: extractIcon(raw.icon),
    year: raw.date,
    country: extractText(raw.country),
    credits: extractCredits(raw.credits),
  };
}

/**
 * Get channel sort order
 */
function getChannelOrder(channelId: string): number {
  return TNT_CHANNEL_ORDER[channelId] ?? 999;
}

/**
 * Main function: fetch and return channels with their prime-time programmes
 */
export async function getChannelsWithProgrammes(): Promise<ChannelWithProgrammes[]> {
  console.log('Get programmes from XMLTV data');

  // Fetch and parse XMLTV data
  const xmlString = await fetchXmltvData();
  const xmlData = parseXml(xmlString);

  // Parse channels
  const channelsRaw = xmlData.tv.channel || [];
  const channels = channelsRaw.map(parseChannel);

  // Parse programmes and filter for prime time
  const programmesRaw = xmlData.tv.programme || [];
  const allProgrammes = programmesRaw.map(parseProgramme).filter((p) => !IGNORE_CHANNELS.has(p.channelId));

  // Filter programmes for prime time (20h-23h)
  const primeTimeProgrammes = allProgrammes.filter((prog) => isPrimeTime(prog.start, prog.stop));

  // Group programmes by channel
  const programmesByChannel = new Map<string, Programme[]>();
  for (const prog of primeTimeProgrammes) {
    const existing = programmesByChannel.get(prog.channelId) || [];
    existing.push(prog);
    programmesByChannel.set(prog.channelId, existing);
  }

  // Build result: only include channels that have prime-time programmes
  const result: ChannelWithProgrammes[] = [];

  for (const channel of channels) {
    const programmes = programmesByChannel.get(channel.id);
    if (programmes && programmes.length > 0) {
      // Sort programmes by start time
      programmes.sort((a, b) => a.start.getTime() - b.start.getTime());
      result.push({ channel, programmes });
    }
  }

  // Sort channels by TNT order
  result.sort((a, b) => getChannelOrder(a.channel.id) - getChannelOrder(b.channel.id));

  return result;
}

/**
 * Get the build timestamp for display
 */
export function getBuildTime(): Date {
  return new Date();
}
