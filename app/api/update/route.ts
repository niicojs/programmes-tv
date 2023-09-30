import { NextRequest, NextResponse } from 'next/server';
import { gunzip } from 'node:zlib';
import { promisify } from 'node:util';
import { XmltvProgramme, parseXmltv } from '@iptv/xmltv';
import { isToday, isTomorrow } from 'date-fns';
import { kv } from '@vercel/kv';
import { ofetch } from 'ofetch';

const ungz = promisify(gunzip);

export async function GET(request: NextRequest) {
  try {
    console.log('Récupération du programme en ligne...');

    const result = await ofetch('https://xmltvfr.fr/xmltv/xmltv_tnt.xml.gz');
    const buffer = Buffer.from(await result.arrayBuffer());
    const xmltv = (await ungz(buffer)).toString('utf-8');

    const programme = parseXmltv(xmltv);
    if (!programme.channels || !programme.programmes) {
      console.log('Pas assez de données...');
      return NextResponse.json({ ok: false, error: 'No data' });
    }

    const chaines: Chaine[] = programme.channels.map((c) => ({
      id: c.id,
      name: c.displayName?.at(0)?._value || c.id,
      icon: c.icon?.at(0)?.src,
      today: [],
      tomorrow: [],
    }));

    const today = programme.programmes
      .filter((p) => isToday(p.start))
      .sort((b, a) => b.start.getTime() - a.start.getTime());

    const tomorrow = programme.programmes
      .filter((p) => isTomorrow(p.start) || isTomorrow(p.stop!))
      .sort((b, a) => b.start.getTime() - a.start.getTime());

    const build = (name: 'today' | 'tomorrow', eps: XmltvProgramme[]) => {
      console.log('build ' + name);
      for (const chaine of chaines) {
        const progs = eps.filter(
          (p) => p.channel === chaine.id && p.start.getHours() >= 20
        );
        for (const prog of progs) {
          chaine[name].push({
            start: prog.start.getTime(),
            stop: prog.stop!.getTime(),
            title: prog.title.filter((p) => p.lang === 'fr')[0]._value,
            desc: prog.desc?.filter((p) => p.lang === 'fr')[0]._value || '',
            category:
              prog.category?.filter((p) => p.lang === 'fr')[0]._value || '',
            icon: prog.icon?.at(0)?.src,
          });
        }
      }
    };
    build('today', today);
    build('tomorrow', tomorrow);

    await kv.set('last_update', new Date());
    await kv.set('soirees', chaines);

    console.log('Done.');
  } catch (e) {
    console.error(e);
  }

  return NextResponse.json({ ok: true });
}
