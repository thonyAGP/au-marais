'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Inbox, Hourglass, CheckCircle, XCircle, Archive } from 'lucide-react';
import { KanbanColumn, ColumnConfig } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import type { Reservation } from '@/types/reservation';

const COLUMNS: ColumnConfig[] = [
  {
    id: 'pending',
    title: 'Demandes',
    icon: Inbox,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    statuses: ['pending'],
  },
  {
    id: 'approved',
    title: 'À payer',
    icon: Hourglass,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    statuses: ['approved'],
  },
  {
    id: 'paid',
    title: 'Payées',
    icon: CheckCircle,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    statuses: ['paid'],
  },
  {
    id: 'rejected',
    title: 'Refusées',
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    statuses: ['rejected'],
  },
  {
    id: 'cancelled',
    title: 'Annulées',
    icon: Archive,
    color: 'text-stone-600',
    bgColor: 'bg-stone-50',
    borderColor: 'border-stone-200',
    statuses: ['cancelled'],
  },
];

interface KanbanBoardProps {
  reservations: Reservation[];
  onStatusChange: (id: string, newStatus: string) => Promise<void>;
  onAction: (id: string, action: string) => Promise<void>;
  isLoading?: boolean;
}

export const KanbanBoard = ({
  reservations,
  onStatusChange,
  onAction,
  isLoading,
}: KanbanBoardProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const reservationsByColumn = useMemo(() => {
    const grouped: Record<string, Reservation[]> = {};

    COLUMNS.forEach((col) => {
      grouped[col.id] = reservations
        .filter((r) => col.statuses.includes(r.status))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    return grouped;
  }, [reservations]);

  const activeReservation = useMemo(() => {
    if (!activeId) return null;
    return reservations.find((r) => r.id === activeId) || null;
  }, [activeId, reservations]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeReservation = reservations.find((r) => r.id === active.id);
    if (!activeReservation) return;

    const targetColumnId = over.id as string;
    const targetColumn = COLUMNS.find((col) => col.id === targetColumnId);

    if (!targetColumn) return;
    if (targetColumn.statuses.includes(activeReservation.status)) return;

    const newStatus = targetColumn.statuses[0];

    // Map column to action
    const actionMap: Record<string, string> = {
      approved: 'approve',
      rejected: 'reject',
      paid: 'mark_paid',
    };

    const action = actionMap[newStatus];
    if (action) {
      await onAction(activeReservation.id, action);
    }
  };

  const handleAction = async (id: string, action: string) => {
    await onAction(id, action);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            config={column}
            reservations={reservationsByColumn[column.id] || []}
            onAction={handleAction}
            isLoading={isLoading}
          />
        ))}
      </div>

      <DragOverlay>
        {activeReservation ? (
          <div className="opacity-80 rotate-3">
            <KanbanCard reservation={activeReservation} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
