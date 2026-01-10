'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ComponentProps } from 'react';

type LocaleLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

export const LocaleLink = ({ href, ...props }: LocaleLinkProps) => {
  const params = useParams();
  const locale = params?.locale || 'fr';

  // If href is external or already has locale, don't modify
  if (href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) {
    return <Link href={href} {...props} />;
  }

  // Add locale prefix to internal links
  const localizedHref = href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`;

  return <Link href={localizedHref} {...props} />;
};
