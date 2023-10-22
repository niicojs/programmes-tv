type Programme = {
  start: number;
  stop: number;
  title: string;
  desc: string;
  category: string;
  icon?: string;
  main?: boolean;
};

type Chaine = {
  id: string;
  name: string;
  icon?: string;
  programmes: Programme[];
};
