/**
 * Types for XMLTV data structures
 */

/** TV Channel information */
export interface Channel {
  id: string;
  name: string;
  icon?: string;
}

/** Credits/cast information */
export interface Credits {
  directors: string[];
  actors: string[];
  presenters: string[];
}

/** TV Programme/Show information */
export interface Programme {
  id: string;
  channelId: string;
  start: Date;
  stop: Date;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  icon?: string;
  year?: string;
  country?: string;
  credits: Credits;
}

/** Channel with its associated programmes */
export interface ChannelWithProgrammes {
  channel: Channel;
  programmes: Programme[];
}

/** Raw XMLTV credits element */
export interface XmltvCreditsRaw {
  director?: string | string[];
  actor?: string | { '#text': string } | (string | { '#text': string })[];
  presenter?: string | string[];
}

/** Raw XMLTV channel element from parser */
export interface XmltvChannelRaw {
  '@_id': string;
  'display-name': string | { '#text': string };
  icon?: { '@_src': string } | { '@_src': string }[];
}

/** Raw XMLTV programme element from parser */
export interface XmltvProgrammeRaw {
  '@_start': string;
  '@_stop': string;
  '@_channel': string;
  title: string | { '#text': string };
  'sub-title'?: string | { '#text': string };
  desc?: string | { '#text': string };
  category?: string | { '#text': string } | (string | { '#text': string })[];
  icon?: { '@_src': string } | { '@_src': string }[];
  date?: string;
  country?: string | { '#text': string };
  credits?: XmltvCreditsRaw;
}

/** Raw XMLTV root structure from parser */
export interface XmltvRaw {
  tv: {
    channel: XmltvChannelRaw[];
    programme: XmltvProgrammeRaw[];
  };
}
