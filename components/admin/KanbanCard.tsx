'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, CreditCard, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Reservation } from '@/types/reservation';

interface KanbanCardProps {
  reservation: Reservation;
  onAction?: (id: string, action: string) => void;
  isLoading?: boolean;
}

export const KanbanCard = ({ reservation, onAction, isLoading }: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: reservation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const isPastStay = new Date(reservation.departureDate) < new Date();
  const isUpcoming = new Date(reservation.arrivalDate) > new Date();
  const isOngoing = !isPastStay && !isUpcoming;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg border border-stone-200 p-3 cursor-grab active:cursor-grabbing
        hover:shadow-md hover:border-gold/50 transition-all
        ${isDragging ? 'opacity-50 shadow-lg ring-2 ring-gold' : ''}
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Header: Name + Amount */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <User className="h-3.5 w-3.5 text-text-muted flex-shrink-0" />
          <span className="font-medium text-text text-sm truncate">
            {reservation.firstName} {reservation.lastName}
          </span>
        </div>
        <span className="font-semibold text-gold text-sm flex-shrink-0">
          {reservation.total}€
        </span>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
        <Calendar className="h-3 w-3" />
        <span>
          {formatDate(reservation.arrivalDate)} → {formatDate(reservation.departureDate)}
        </span>
        {isOngoing && (
          <span className="ml-auto bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
            En cours
          </span>
        )}
        {isPastStay && reservation.status === 'paid' && (
          <span className="ml-auto bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
            Terminé
          </span>
        )}
      </div>

      {/* Deposit info for approved status */}
      {reservation.status === 'approved' && reservation.depositAmount && (
        <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-2">
          <CreditCard className="h-3 w-3" />
          <span>Acompte: {reservation.depositAmount}€</span>
          {reservation.stripePaymentLinkUrl && (
            <a
              href={reservation.stripePaymentLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-blue-500 hover:text-blue-700"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t border-stone-100">
        {reservation.status === 'pending' && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction?.(reservation.id, 'approve');
              }}
              className="flex-1 text-xs py-1 px-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
            >
              Approuver
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction?.(reservation.id, 'reject');
              }}
              className="flex-1 text-xs py-1 px-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
            >
              Refuser
            </button>
          </>
        )}
        {reservation.status === 'approved' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction?.(reservation.id, 'mark_paid');
            }}
            className="flex-1 text-xs py-1 px-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
          >
            Marquer payé
          </button>
        )}
        <Link
          href={`/admin/reservations/${reservation.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs py-1 px-2 text-gold hover:text-gold-dark transition-colors"
        >
          Détails
        </Link>
      </div>
    </div>
  );
};
