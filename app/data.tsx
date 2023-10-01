import { kv } from '@vercel/kv';

export async function getEvening() {
  //
  const chaines = (await kv.get<Chaine[]>('evening')) || [];

  // fix logo
  const canal = chaines.find((c) => c.id === 'CanalPlus.fr');
  if (canal) {
    canal.icon =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Logo_Canal%2B_1995.svg/1280px-Logo_Canal%2B_1995.svg.png';
  }
  const c8 = chaines.find((c) => c.id === 'C8.fr');
  if (c8) {
    c8.icon =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Logo_C8_2016.svg/langfr-225px-Logo_C8_2016.svg.png';
  }

  return chaines;
}

export async function getLastUpdate() {
  return new Date((await kv.get<string>('last_update')) || 0);
}
