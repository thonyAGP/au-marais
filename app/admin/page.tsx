'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container, DevModeBanner } from '@/components/ui';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminHeader } from './AdminHeader';
import { KanbanBoard, ActionAlerts, QuickStats, QuickLinks } from '@/components/admin';
import type { Reservation } from '@/types/reservation';

interface MonitoringData {
  failedEmails: { id: string }[];
  links: {
    vercel: string;
    vercelAnalytics: string;
    resend: string;
    stripe: string;
    smoobu: string;
  };
}

export default function AdminDashboardPage() {
  const { isAuthenticated, isLoading, token } = useAdminAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsRefreshing(true);
    setError(null);

    try {
      const [reservationsRes, monitoringRes] = await Promise.all([
        fetch('/api/reservations', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        }),
        fetch('/api/admin/monitoring', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        }),
      ]);

      if (reservationsRes.ok) {
        const data = await reservationsRes.json();
        setReservations(data.reservations || []);
      }

      if (monitoringRes.ok) {
        const data = await monitoringRes.json();
        setMonitoringData(data);
      }
    } catch {
      setError('Erreur lors du chargement des données');
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadData();
    }
  }, [isAuthenticated, token, loadData]);

  const handleAction = async (id: string, action: string) => {
    if (!token) return;
    setActionLoading(id);
    setError(null);

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const actionLabels: Record<string, string> = {
          approve: 'Réservation approuvée',
          reject: 'Réservation refusée',
          mark_paid: 'Paiement confirmé',
        };
        setSuccessMessage(actionLabels[action] || 'Action effectuée');
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadData();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de l\'action');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const actionMap: Record<string, string> = {
      approved: 'approve',
      rejected: 'reject',
      paid: 'mark_paid',
    };
    const action = actionMap[newStatus];
    if (action) {
      await handleAction(id, action);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <DevModeBanner />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-text-muted">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin title="Dashboard" subtitle="Au Marais - Administration" />;
  }

  // Calculate stats for ActionAlerts
  const pendingCount = reservations.filter((r) => r.status === 'pending').length;
  const awaitingPaymentCount = reservations.filter((r) => r.status === 'approved').length;
  const failedEmailsCount = monitoringData?.failedEmails?.length || 0;

  return (
    <div className="min-h-screen bg-cream">
      <DevModeBanner />
      <AdminHeader />

      <div className="py-6">
        <Container size="xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-gold" />
              <div>
                <h1 className="font-serif text-2xl text-text">Tableau de bord</h1>
                <p className="text-text-muted text-sm">Vue d'ensemble des réservations</p>
              </div>
            </div>
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-text-muted hover:text-text hover:bg-cream transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-700">
              {successMessage}
            </div>
          )}

          {/* Action Alerts */}
          <div className="mb-6">
            <ActionAlerts
              pendingCount={pendingCount}
              awaitingPaymentCount={awaitingPaymentCount}
              failedEmailsCount={failedEmailsCount}
            />
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Kanban Board - Takes 3 columns */}
            <div className="lg:col-span-3" id="kanban">
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <h2 className="font-medium text-text mb-4">Réservations</h2>
                <KanbanBoard
                  reservations={reservations}
                  onStatusChange={handleStatusChange}
                  onAction={handleAction}
                  isLoading={actionLoading !== null}
                />
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              <QuickStats reservations={reservations} />
              <QuickLinks links={monitoringData?.links} />
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
