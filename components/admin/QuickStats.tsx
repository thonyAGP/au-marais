'use client';

import { TrendingUp, Calendar, CreditCard } from 'lucide-react';
import type { Reservation } from '@/types/reservation';

interface QuickStatsProps {
  reservations: Reservation[];
}

export const QuickStats = ({ reservations }: QuickStatsProps) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Calculate monthly stats
  const monthlyReservations = reservations.filter((r) => {
    const arrivalDate = new Date(r.arrivalDate);
    return arrivalDate >= startOfMonth && arrivalDate <= endOfMonth && r.status === 'paid';
  });

  const monthlyRevenue = monthlyReservations.reduce((sum, r) => sum + (r.depositAmount || 0), 0);
  const totalPaid = reservations.filter((r) => r.status === 'paid').length;

  // Calculate occupancy for the month
  const daysInMonth = endOfMonth.getDate();
  let occupiedDays = 0;

  monthlyReservations.forEach((r) => {
    const arrival = new Date(r.arrivalDate);
    const departure = new Date(r.departureDate);

    // Clamp to current month
    const effectiveArrival = arrival < startOfMonth ? startOfMonth : arrival;
    const effectiveDeparture = departure > endOfMonth ? endOfMonth : departure;

    const nights = Math.ceil(
      (effectiveDeparture.getTime() - effectiveArrival.getTime()) / (1000 * 60 * 60 * 24)
    );
    occupiedDays += Math.max(0, nights);
  });

  const occupancyRate = Math.min(100, Math.round((occupiedDays / daysInMonth) * 100));

  const stats = [
    {
      id: 'revenue',
      icon: CreditCard,
      value: `${monthlyRevenue.toLocaleString('fr-FR')}€`,
      label: 'CA ce mois',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
    },
    {
      id: 'occupancy',
      icon: Calendar,
      value: `${occupancyRate}%`,
      label: 'Occupation',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'reservations',
      icon: TrendingUp,
      value: `${monthlyReservations.length}`,
      label: 'Réserv. ce mois',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      <h3 className="text-sm font-medium text-text mb-3">Stats rapides</h3>

      <div className="space-y-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <div className={`font-semibold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-text-muted">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-text-muted">
        Total payées: {totalPaid} réservations
      </div>
    </div>
  );
};
