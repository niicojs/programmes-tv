import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { heure } from '@/lib/utils';
import { kv } from '@vercel/kv';

type Props = {
  params: { chaine: string; start: string };
};

export const revalidate = 60 * 60; // 1 hour

export default async function Programme({ params }: Props) {
  const chaines = (await kv.get<Chaine[]>('evening')) || [];
  console.log(`chaine ${params.chaine} at ${params.start}`);

  const chaine = chaines.filter((c) => c.id === params.chaine)[0];
  const programme = chaine.programmes.filter(
    (p) => p.start === +params.start
  )[0];

  return (
    <div className="container mx-auto w-full py-10">
      <Card className="max-w-[650px] mx-auto">
        <CardHeader>
          <CardTitle>
            {chaine.name} - {programme.title}
          </CardTitle>
          <CardDescription>
            {programme.category}, de {heure(programme.start)} à{' '}
            {heure(programme.stop)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <img className="object-contain h-50 w-80" src={programme.icon} />
          <div className="mt-2">{programme.desc}</div>
        </CardContent>
      </Card>
    </div>
  );
}
