'use client';

import { BarChart3, Mail, CreditCard, Calendar, TrendingUp } from 'lucide-react';

interface QuickLinksProps {
  links?: {
    vercel?: string;
    vercelAnalytics?: string;
    resend?: string;
    stripe?: string;
    smoobu?: string;
  };
}

export const QuickLinks = ({ links }: QuickLinksProps) => {
  const linkItems = [
    {
      id: 'analytics',
      icon: BarChart3,
      label: 'Analytics',
      href: links?.vercelAnalytics || 'https://vercel.com',
      bgColor: 'bg-stone-900',
      hoverColor: 'hover:bg-stone-800',
    },
    {
      id: 'resend',
      icon: Mail,
      label: 'Resend',
      href: links?.resend || 'https://resend.com/emails',
      bgColor: 'bg-violet-600',
      hoverColor: 'hover:bg-violet-500',
    },
    {
      id: 'stripe',
      icon: CreditCard,
      label: 'Stripe',
      href: links?.stripe || 'https://dashboard.stripe.com/payments',
      bgColor: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-500',
    },
    {
      id: 'smoobu',
      icon: Calendar,
      label: 'Smoobu',
      href: links?.smoobu || 'https://login.smoobu.com',
      bgColor: 'bg-teal-600',
      hoverColor: 'hover:bg-teal-500',
    },
    {
      id: 'vercel',
      icon: TrendingUp,
      label: 'Vercel',
      href: links?.vercel || 'https://vercel.com',
      bgColor: 'bg-stone-600',
      hoverColor: 'hover:bg-stone-500',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      <h3 className="text-sm font-medium text-text mb-3">Liens externes</h3>

      <div className="grid grid-cols-2 gap-2">
        {linkItems.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-white text-xs
                transition-colors ${link.bgColor} ${link.hoverColor}
              `}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{link.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};
