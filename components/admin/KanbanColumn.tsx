'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { LucideIcon } from 'lucide-react';
import { KanbanCard } from './KanbanCard';
import type { Reservation } from '@/types/reservation';

export interface ColumnConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  statuses: string[];
}

interface KanbanColumnProps {
  config: ColumnConfig;
  reservations: Reservation[];
  onAction?: (id: string, action: string) => void;
  isLoading?: boolean;
  compact?: boolean;
}

export const KanbanColumn = ({ config, reservations, onAction, isLoading, compact }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: config.id,
  });

  const Icon = config.icon;

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col rounded-lg border-2 transition-colors
        ${compact ? 'min-h-[150px]' : 'min-h-[400px]'}
        ${isOver ? 'border-gold bg-gold/5' : config.borderColor}
        ${config.bgColor}
      `}
    >
      {/* Column Header */}
      <div className={`flex items-center gap-2 p-3 border-b ${config.borderColor}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
        <h3 className={`font-medium text-sm ${config.color}`}>{config.title}</h3>
        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
          {reservations.length}
        </span>
      </div>

      {/* Column Content */}
      <div className={`flex-1 p-2 space-y-2 overflow-y-auto ${compact ? 'max-h-[200px]' : 'max-h-[500px]'}`}>
        <SortableContext
          items={reservations.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          {reservations.length === 0 ? (
            <div className={`flex items-center justify-center text-text-muted text-sm ${compact ? 'h-12' : 'h-24'}`}>
              Aucune réservation
            </div>
          ) : (
            reservations.map((reservation) => (
              <KanbanCard
                key={reservation.id}
                reservation={reservation}
                onAction={onAction}
                isLoading={isLoading}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};
