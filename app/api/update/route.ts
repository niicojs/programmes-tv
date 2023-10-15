import { NextResponse } from 'next/server';
import { gunzip } from 'node:zlib';
import { promisify } from 'node:util';
import { XmltvProgramme, parseXmltv } from '@iptv/xmltv';
import { isToday } from 'date-fns';
import { kv } from '@vercel/kv';
import { ofetch } from 'ofetch';
import { utcToZonedTime } from 'date-fns-tz';

const ungz = promisify(gunzip);

export const revalidate = 0;

export async function GET() {
  try {
    console.log('Récupération du programme en ligne...');

    const result = await ofetch('https://xmltvfr.fr/xmltv/xmltv_tnt.xml.gz');
    const buffer = Buffer.from(await result.arrayBuffer());
    const xmltv = (await ungz(buffer)).toString('utf-8');

    const programme = parseXmltv(xmltv);
    if (!programme.channels || !programme.programmes) {
      console.log('Pas assez de données...');
      return NextResponse.json(
        { ok: false, error: 'No data' },
        { status: 500 }
      );
    }

    const chaines: Chaine[] = programme.channels.map((c) => ({
      id: c.id,
      name: c.displayName?.at(0)?._value || c.id,
      icon: c.icon?.at(0)?.src,
      programmes: [],
    }));

    const today = programme.programmes
      .filter((p) => isToday(p.start))
      .sort((b, a) => b.start.getTime() - a.start.getTime());

    // const tomorrow = programme.programmes
    //   .filter((p) => isTomorrow(p.start) || isTomorrow(p.stop!))
    //   .sort((b, a) => b.start.getTime() - a.start.getTime());

    const build = (eps: XmltvProgramme[]) => {
      const result = structuredClone(chaines);
      for (const chaine of result) {
        const progs = eps.filter((p) => p.channel === chaine.id);
        for (const prog of progs) {
          chaine.programmes.push({
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
      return result;
    };

    const allDay = build(today);
    const evening = allDay.map((c) => ({
      ...c,
      programmes: c.programmes.filter((p) => {
        const start = utcToZonedTime(new Date(p.start), 'Europe/Paris');
        return (
          (start.getHours() === 20 && start.getMinutes() > 40) ||
          start.getHours() >= 21
        );
      }),
    }));

    // console.log(evening);

    await kv.set('last_update', new Date());
    // await kv.set('today', allDay);
    await kv.set('evening', evening);

    console.log('Done.');

    return NextResponse.json({ ok: true, date: new Date() });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: (e as any).toString() },
      { status: 500 }
    );
  }
}
