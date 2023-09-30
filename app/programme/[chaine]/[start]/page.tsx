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

export default async function Programme({ params }: Props) {
  const chaines = (await kv.get<Chaine[]>('today')) || [];
  console.log(`chaine ${params.chaine} at ${params.start}`);

  const programme = chaines
    .filter((c) => c.id === params.chaine)[0]
    .programmes.filter((p) => p.start === +params.start)[0];

  return (
    <div className="container mx-auto w-full py-10">
      <Card className="max-w-[650px] mx-auto">
        <CardHeader>
          <CardTitle>{programme.title}</CardTitle>
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
