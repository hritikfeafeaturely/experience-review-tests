'use client';

import { useRouter } from 'next/navigation';
import { TableRow } from '@/components/ui/table';
import type { ReactNode } from 'react';

interface ClickableTableRowProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function ClickableTableRow({ href, children, className }: ClickableTableRowProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't navigate if clicking on a link or button
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' || target.closest('a') || target.tagName === 'BUTTON') {
      return;
    }
    router.push(href);
  };

  return (
    <TableRow 
      onClick={handleClick}
      className={className}
    >
      {children}
    </TableRow>
  );
}

