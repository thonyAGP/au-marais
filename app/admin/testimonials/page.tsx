'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container } from '@/components/ui';
import {
  Lock,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  MapPin,
  RefreshCw,
  ChevronDown,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import type { Testimonial } from '@/types/testimonial';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-800', icon: Clock },
  approved: { label: 'Approuvé', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function AdminTestimonialsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setIsAuthenticated(true);
        loadTestimonials(token);
      } else {
        sessionStorage.removeItem('adminToken');
      }
    } catch {
      sessionStorage.removeItem('adminToken');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        sessionStorage.setItem('adminToken', data.token);
        document.cookie = `adminToken=${data.token}; path=/; max-age=86400`;
        setIsAuthenticated(true);
        loadTestimonials(data.token);
      } else {
        setLoginError(data.error || 'Mot de passe incorrect');
      }
    } catch {
      setLoginError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const loadTestimonials = useCallback(async (token?: string) => {
    setIsRefreshing(true);
    try {
      const authToken = token || sessionStorage.getItem('adminToken');
      const url = statusFilter === 'all'
        ? '/api/testimonials'
        : `/api/testimonials?status=${statusFilter}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.testimonials || []);
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTestimonials();
    }
  }, [isAuthenticated, statusFilter, loadTestimonials]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    setActionLoading(id);
    try {
      const authToken = sessionStorage.getItem('adminToken');

      if (action === 'delete') {
        await fetch(`/api/testimonials/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } else {
        await fetch(`/api/testimonials/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            action,
            rejectionReason: action === 'reject' ? rejectionReason : undefined,
          }),
        });
      }

      loadTestimonials();
      setRejectionReason('');
      setExpandedId(null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    document.cookie = 'adminToken=; path=/; max-age=0';
    setIsAuthenticated(false);
    setTestimonials([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white border border-stone-200 p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-gold" />
            </div>
            <h1 className="font-serif text-2xl text-text">Admin Témoignages</h1>
            <p className="text-text-muted text-sm mt-2">Au Marais</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe admin"
              className="w-full px-4 py-3 bg-cream border border-stone-200 focus:border-gold focus:outline-none"
            />
            {loginError && (
              <p className="text-red-500 text-sm">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold text-white font-medium hover:bg-gold-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Connexion'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/admin/reservations"
              className="text-sm text-gold hover:underline"
            >
              Admin Réservations →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <MessageSquare className="h-6 w-6 text-gold" />
              <h1 className="font-serif text-xl text-text">Modération Témoignages</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/reservations"
                className="text-sm text-text-muted hover:text-gold"
              >
                Réservations
              </Link>
              <button
                onClick={() => loadTestimonials()}
                disabled={isRefreshing}
                className="p-2 hover:bg-cream rounded transition-colors"
              >
                <RefreshCw className={`h-5 w-5 text-text-muted ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-cream rounded transition-colors"
              >
                <LogOut className="h-5 w-5 text-text-muted" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-stone-200">
        <Container>
          <div className="flex gap-2 py-3 overflow-x-auto">
            {(['pending', 'approved', 'rejected', 'all'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-gold text-white'
                    : 'bg-cream text-text-muted hover:bg-stone-200'
                }`}
              >
                {status === 'all' ? 'Tous' : statusConfig[status].label}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* Content */}
      <Container className="py-6">
        {testimonials.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            Aucun témoignage {statusFilter !== 'all' && `${statusConfig[statusFilter as keyof typeof statusConfig].label.toLowerCase()}`}
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => {
              const config = statusConfig[testimonial.status];
              const StatusIcon = config.icon;
              const isExpanded = expandedId === testimonial.id;

              return (
                <div
                  key={testimonial.id}
                  className="bg-white border border-stone-200 overflow-hidden"
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : testimonial.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-cream/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-text">{testimonial.author.name}</p>
                        {testimonial.author.location && (
                          <p className="text-sm text-text-muted flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {testimonial.author.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= testimonial.rating
                                ? 'text-gold fill-gold'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-text-muted">
                        {formatDate(testimonial.createdAt)}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-text-muted transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-stone-200 p-4 bg-cream/30">
                      {/* Review text */}
                      <div className="mb-4">
                        <p className="text-text leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                      </div>

                      {/* Rejection reason input (only for pending) */}
                      {testimonial.status === 'pending' && (
                        <div className="mb-4">
                          <label className="block text-sm text-text-muted mb-1">
                            Raison du rejet (optionnel)
                          </label>
                          <input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Raison si rejet..."
                            className="w-full px-3 py-2 bg-white border border-stone-200 text-sm focus:border-gold focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {testimonial.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(testimonial.id, 'approve')}
                              disabled={actionLoading === testimonial.id}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approuver
                            </button>
                            <button
                              onClick={() => handleAction(testimonial.id, 'reject')}
                              disabled={actionLoading === testimonial.id || !rejectionReason}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4" />
                              Rejeter
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleAction(testimonial.id, 'delete')}
                          disabled={actionLoading === testimonial.id}
                          className="flex items-center gap-2 px-4 py-2 bg-stone-600 text-white text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 ml-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </button>
                      </div>

                      {/* Admin notes / rejection reason */}
                      {testimonial.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-sm">
                          <span className="font-medium text-red-800">Raison du rejet:</span>{' '}
                          <span className="text-red-700">{testimonial.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
