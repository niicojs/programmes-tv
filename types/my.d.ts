type Programme = {
  start: number;
  stop: number;
  title: string;
  desc: string;
  category: string;
  icon?: string;
};

type Chaine = {
  id: string;
  name: string;
  icon?: string;
  today: Programme[];
  tomorrow: Programme[];
};
