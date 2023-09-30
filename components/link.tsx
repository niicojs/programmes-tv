import React from 'react';
import { cn } from '@/lib/utils';
import NextLink, { LinkProps } from 'next/link';

type N = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement>;

export function Link({ children, className, ...rest }: N) {
  return (
    <NextLink
      className={cn(
        'text-blue-500 hover:underline underline-offset-4 decoration-blue-500',
        className
      )}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
