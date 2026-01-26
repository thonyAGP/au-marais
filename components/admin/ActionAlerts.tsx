'use client';

import { CreditCard, Inbox, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ActionAlertsProps {
  pendingCount: number;
  awaitingPaymentCount: number;
  failedEmailsCount: number;
}

export const ActionAlerts = ({
  pendingCount,
  awaitingPaymentCount,
  failedEmailsCount,
}: ActionAlertsProps) => {
  const alerts = [
    {
      id: 'payments',
      icon: CreditCard,
      count: awaitingPaymentCount,
      label: 'Paiements',
      sublabel: 'en attente',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      href: '#kanban',
    },
    {
      id: 'requests',
      icon: Inbox,
      count: pendingCount,
      label: 'Demandes',
      sublabel: 'nouvelles',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      href: '#kanban',
    },
    {
      id: 'emails',
      icon: Mail,
      count: failedEmailsCount,
      label: 'Emails',
      sublabel: 'en échec',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      href: '/admin/monitoring',
    },
    {
      id: 'ok',
      icon: CheckCircle,
      count: 0,
      label: 'Problèmes',
      sublabel: 'signalés',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      href: '#',
    },
  ];

  const hasAlerts = pendingCount > 0 || awaitingPaymentCount > 0 || failedEmailsCount > 0;

  return (
    <div className={`rounded-lg border p-4 ${hasAlerts ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
      <div className="flex items-center gap-2 mb-3">
        {hasAlerts ? (
          <span className="text-amber-700 font-medium text-sm">Actions requises</span>
        ) : (
          <span className="text-green-700 font-medium text-sm">Tout est en ordre</span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          const isActive = alert.count > 0;
          const Wrapper = alert.href.startsWith('/') ? Link : 'a';

          return (
            <Wrapper
              key={alert.id}
              href={alert.href}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg border transition-all
                ${isActive
                  ? `${alert.bgColor} ${alert.borderColor} hover:shadow-md cursor-pointer`
                  : 'bg-white border-stone-200 opacity-50'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-5 w-5 ${isActive ? alert.color : 'text-stone-400'}`} />
                <span className={`text-2xl font-bold ${isActive ? alert.color : 'text-stone-400'}`}>
                  {alert.count}
                </span>
              </div>
              <span className={`text-xs ${isActive ? alert.color : 'text-stone-400'}`}>
                {alert.label}
              </span>
              <span className={`text-[10px] ${isActive ? alert.color : 'text-stone-400'} opacity-75`}>
                {alert.sublabel}
              </span>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
};
