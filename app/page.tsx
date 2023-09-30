import { heure } from '@/lib/utils';
import { kv } from '@vercel/kv';
import { formatDistance, isTomorrow, setDefaultOptions } from 'date-fns';
import fr from 'date-fns/locale/fr';

setDefaultOptions({ locale: fr });

const filter = (programmes: Programme[]) =>
  programmes.filter((p) => {
    const end = new Date(p.stop);
    const h = end.getHours();
    const m = end.getMinutes();
    return isTomorrow(end) || h >= 21 || (h === 20 && m > 45);
  });

export default async function Home() {
  const lastupdate = new Date((await kv.get<string>('last_update')) || 0);
  const chaines = (await kv.get<Chaine[]>('soirees')) || [];

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
                {filter(chaine.today).map((prog) => (
                  <div key={chaine.id + prog.start} className="flex flex-row">
                    <div className="w-14">{heure(prog.start)}</div>
                    {prog.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-32  text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left">
        <div>
          Dernière mise à jour{' '}
          {formatDistance(lastupdate, new Date(), {
            addSuffix: true,
          })}
        </div>
      </div>
    </main>
  );
}
