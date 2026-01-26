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

const MAIN_COLUMNS: ColumnConfig[] = [
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
];

const ARCHIVE_COLUMNS: ColumnConfig[] = [
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

const ALL_COLUMNS = [...MAIN_COLUMNS, ...ARCHIVE_COLUMNS];

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

    ALL_COLUMNS.forEach((col) => {
      grouped[col.id] = reservations
        .filter((r) => col.statuses.includes(r.status))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    return grouped;
  }, [reservations]);

  const archiveCount = useMemo(() => {
    return ARCHIVE_COLUMNS.reduce((acc, col) => acc + (reservationsByColumn[col.id]?.length || 0), 0);
  }, [reservationsByColumn]);

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
    const targetColumn = ALL_COLUMNS.find((col) => col.id === targetColumnId);

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

  const [showArchive, setShowArchive] = useState(false);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Main workflow columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {MAIN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            config={column}
            reservations={reservationsByColumn[column.id] || []}
            onAction={handleAction}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Archive section (collapsed by default) */}
      <div className="border-t border-stone-200 pt-4">
        <button
          onClick={() => setShowArchive(!showArchive)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors mb-3"
        >
          <Archive className="h-4 w-4" />
          <span>Archives ({archiveCount})</span>
          <span className={`transition-transform ${showArchive ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {showArchive && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ARCHIVE_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                config={column}
                reservations={reservationsByColumn[column.id] || []}
                onAction={handleAction}
                isLoading={isLoading}
                compact
              />
            ))}
          </div>
        )}
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
