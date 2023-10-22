import { formatDistance, setDefaultOptions } from 'date-fns';
import fr from 'date-fns/locale/fr';
import { utcToZonedTime } from 'date-fns-tz';

import { Link } from '@/components/link';
import { heure } from '@/lib/utils';
import { getEvening, getLastUpdate } from './data';
import clsx from 'clsx';

setDefaultOptions({ locale: fr });

export const revalidate = 60 * 60; // 1 hour

export default async function Home() {
  const lastupdate = await getLastUpdate();
  const chaines = await getEvening();
  const now = utcToZonedTime(new Date(), 'Europe/Paris');

  return (
    <main className="flex min-h-screen flex-col justify-between md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:p-4 font-bold">
          Ce soir à la télé
        </p>
      </div>

      <div className="relative flex flex-col lg:w-auto lg:p-4 gap-4 mt-20 md:mt-0">
        {chaines.map((chaine) => (
          <div key={chaine.id} className="border-2 p-2">
            <div className="font-semibold">{chaine.name}</div>
            <div className="flex flex-row">
              <img src={chaine.icon} className="object-contain h-12 w-20 p-2" />
              <div className="grow ml-2">
                {chaine.programmes.map((prog) => (
                  <div key={chaine.id + prog.start} className="flex flex-row">
                    <div className="w-14">{heure(prog.start)}</div>
                    <Link
                      href={`/programme/${chaine.id}/${prog.start}`}
                      className={clsx({ 'font-bold': prog.main })}
                    >
                      {prog.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-32 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left lg:p-4">
        <div>
          Dernière mise à jour{' '}
          {formatDistance(lastupdate, new Date(), {
            addSuffix: true,
          })}
          , généré le{' '}
          {Intl.DateTimeFormat('fr', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }).format(now)}
        </div>
      </div>
    </main>
  );
}
