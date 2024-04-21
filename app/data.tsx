import { kv } from '@vercel/kv';

export async function getEvening() {
  const chaines = (await kv.get<Chaine[]>('evening')) || [];

  for (const chaine of chaines) {
    const prog = chaine.programmes.find(
      (p) => p.stop - p.start > 1_000 * 60 * 40
    );
    if (prog) prog.main = true;
  }

  return chaines;
}

export async function getLastUpdate() {
  return new Date((await kv.get<string>('last_update')) || 0);
}
