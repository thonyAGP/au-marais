'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MessageCircle, ExternalLink } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfToday, addDays, differenceInDays, isSameDay, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { CalendarDay, DateRange } from '@/types/smoobu';
import type { SiteSettings } from '@/types/settings';

interface AvailabilityCalendarProps {
  className?: string;
}

interface RatesData {
  [date: string]: {
    price: number | null;
    available: 0 | 1;
    min_length_of_stay: number | null;
  };
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Valeurs par défaut (utilisées si l'API ne répond pas)
const DEFAULT_SETTINGS: SiteSettings = {
  discounts: { weekly: 10, biweekly: 15, monthly: 20 },
  airbnb: { serviceFee: 15, listingId: '618442543008929958' },
  contact: { whatsapp: '33631598400' },
};

// Réductions par durée de séjour (basées sur les settings)
const getStayDiscounts = (settings: SiteSettings) => {
  const discounts = [];
  if (settings.discounts.monthly > 0) {
    discounts.push({ minNights: 28, percent: settings.discounts.monthly, label: 'Réduction mensuelle' });
  }
  if (settings.discounts.biweekly > 0) {
    discounts.push({ minNights: 14, percent: settings.discounts.biweekly, label: 'Réduction 2 semaines' });
  }
  if (settings.discounts.weekly > 0) {
    discounts.push({ minNights: 7, percent: settings.discounts.weekly, label: 'Réduction semaine' });
  }
  return discounts;
};

const getStayDiscount = (nights: number, settings: SiteSettings) => {
  const discounts = getStayDiscounts(settings);
  for (const discount of discounts) {
    if (nights >= discount.minNights) {
      return discount;
    }
  }
  return null;
};

export const AvailabilityCalendar = ({ className }: AvailabilityCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rates, setRates] = useState<RatesData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<DateRange>({ checkIn: null, checkOut: null });
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Charger les paramètres depuis l'API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch {
        // Utiliser les valeurs par défaut en cas d'erreur
        console.error('Erreur lors du chargement des paramètres');
      }
    };
    fetchSettings();
  }, []);

  const fetchRates = useCallback(async (month: Date) => {
    setLoading(true);
    setError(null);

    const start = format(startOfMonth(month), 'yyyy-MM-dd');
    const end = format(endOfMonth(addMonths(month, 2)), 'yyyy-MM-dd');

    try {
      const response = await fetch(`/api/availability?start=${start}&end=${end}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();

      const apartmentId = Object.keys(data.data || {})[0];
      if (apartmentId && data.data[apartmentId]) {
        setRates(prev => ({ ...prev, ...data.data[apartmentId] }));
      }
    } catch (err) {
      setError('Impossible de charger les disponibilités');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates(currentMonth);
  }, [currentMonth, fetchRates]);

  const goToPreviousMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    if (!isBefore(startOfMonth(prevMonth), startOfMonth(new Date()))) {
      setCurrentMonth(prevMonth);
    }
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getCalendarDays = (month: Date): CalendarDay[] => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const today = startOfToday();

    // Get first day of the week (Monday = 0)
    let firstDayOfWeek = start.getDay() - 1;
    if (firstDayOfWeek < 0) firstDayOfWeek = 6;

    const days: CalendarDay[] = [];

    // Add empty days for padding
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = addDays(start, -(firstDayOfWeek - i));
      days.push({
        date: format(date, 'yyyy-MM-dd'),
        dayOfMonth: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        isPast: true,
        available: false,
        price: null,
        minStay: null,
      });
    }

    // Add month days
    eachDayOfInterval({ start, end }).forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const rateInfo = rates[dateStr];
      const isPast = isBefore(date, today);

      days.push({
        date: dateStr,
        dayOfMonth: date.getDate(),
        isCurrentMonth: true,
        isToday: isToday(date),
        isPast,
        available: !isPast && rateInfo?.available === 1,
        price: rateInfo?.price ?? null,
        minStay: rateInfo?.min_length_of_stay ?? null,
      });
    });

    return days;
  };

  const handleDayClick = (day: CalendarDay) => {
    if (!day.available || !day.isCurrentMonth) return;

    if (!selection.checkIn || (selection.checkIn && selection.checkOut)) {
      // Start new selection
      setSelection({ checkIn: day.date, checkOut: null });
    } else {
      // Complete selection
      const checkInDate = new Date(selection.checkIn);
      const clickedDate = new Date(day.date);

      if (isBefore(clickedDate, checkInDate)) {
        // Clicked date is before check-in, restart
        setSelection({ checkIn: day.date, checkOut: null });
      } else if (isSameDay(clickedDate, checkInDate)) {
        // Same day, reset
        setSelection({ checkIn: null, checkOut: null });
      } else {
        // Check if all dates in range are available
        const daysInRange = eachDayOfInterval({ start: checkInDate, end: clickedDate });
        const allAvailable = daysInRange.every(d => {
          const dateStr = format(d, 'yyyy-MM-dd');
          return rates[dateStr]?.available === 1;
        });

        if (allAvailable) {
          setSelection({ checkIn: selection.checkIn, checkOut: day.date });
        } else {
          // Some days not available, restart
          setSelection({ checkIn: day.date, checkOut: null });
        }
      }
    }
  };

  const isInRange = (date: string): boolean => {
    if (!selection.checkIn || !selection.checkOut) return false;
    const d = new Date(date);
    return isWithinInterval(d, {
      start: new Date(selection.checkIn),
      end: new Date(selection.checkOut),
    });
  };

  const isCheckIn = (date: string): boolean => selection.checkIn === date;
  const isCheckOut = (date: string): boolean => selection.checkOut === date;

  const calculateTotal = (): { nights: number; total: number } | null => {
    if (!selection.checkIn || !selection.checkOut) return null;

    const start = new Date(selection.checkIn);
    const end = new Date(selection.checkOut);
    const nights = differenceInDays(end, start);

    let total = 0;
    const daysInRange = eachDayOfInterval({ start, end: addDays(end, -1) });

    for (const day of daysInRange) {
      const dateStr = format(day, 'yyyy-MM-dd');
      const price = rates[dateStr]?.price;
      if (price) total += price;
    }

    return { nights, total };
  };

  const handleReserve = () => {
    if (!selection.checkIn || !selection.checkOut) return;

    const checkInFormatted = format(new Date(selection.checkIn), 'd MMMM yyyy', { locale: fr });
    const checkOutFormatted = format(new Date(selection.checkOut), 'd MMMM yyyy', { locale: fr });
    const totals = calculateTotal();

    const message = encodeURIComponent(
      `Bonjour,\n\nJe souhaite réserver l'appartement Au Marais :\n` +
      `- Arrivée : ${checkInFormatted}\n` +
      `- Départ : ${checkOutFormatted}\n` +
      `- ${totals?.nights} nuit(s)\n` +
      `- Total estimé : ${totals?.total}€\n\n` +
      `Merci de me confirmer la disponibilité.`
    );

    window.open(`https://wa.me/${settings.contact.whatsapp}?text=${message}`, '_blank');
  };

  const days = getCalendarDays(currentMonth);
  const totals = calculateTotal();
  const canGoPrevious = !isBefore(startOfMonth(subMonths(currentMonth, 1)), startOfMonth(new Date()));

  return (
    <div className={className}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <button
            onClick={goToPreviousMonth}
            disabled={!canGoPrevious}
            className="p-2 rounded-full hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="h-5 w-5 text-stone-600" />
          </button>
          <h3 className="font-serif text-xl text-stone-900 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Mois suivant"
          >
            <ChevronRight className="h-5 w-5 text-stone-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-xs font-medium text-stone-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          {loading && !Object.keys(rates).length ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-stone-500">{error}</div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const inRange = isInRange(day.date);
                const isStart = isCheckIn(day.date);
                const isEnd = isCheckOut(day.date);

                return (
                  <button
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    disabled={!day.available || !day.isCurrentMonth}
                    className={`
                      relative aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-all
                      ${!day.isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                      ${day.isPast || !day.available ? 'text-stone-300 cursor-not-allowed' : 'hover:bg-gold/10 cursor-pointer'}
                      ${day.available && !day.isPast ? 'text-stone-700' : ''}
                      ${day.isToday ? 'ring-1 ring-gold' : ''}
                      ${inRange && !isStart && !isEnd ? 'bg-gold/20' : ''}
                      ${isStart || isEnd ? 'bg-gold text-white' : ''}
                    `}
                  >
                    <span className={`font-medium ${isStart || isEnd ? 'text-white' : ''}`}>
                      {day.dayOfMonth}
                    </span>
                    {day.available && day.price && !day.isPast && (
                      <span className={`text-[10px] ${isStart || isEnd ? 'text-white/80' : 'text-stone-400'}`}>
                        {day.price}€
                      </span>
                    )}
                    {!day.available && day.isCurrentMonth && !day.isPast && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-6 h-px bg-stone-300 rotate-45" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="px-4 pb-4 flex items-center justify-center gap-6 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-gold" />
            <span>Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-stone-200 relative">
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-2 h-px bg-stone-400 rotate-45" />
              </span>
            </span>
            <span>Indisponible</span>
          </div>
        </div>

        {/* Selection Summary */}
        {(selection.checkIn || totals) && (
          <div className="border-t border-stone-100 p-4 bg-stone-50">
            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 text-gold mt-0.5" />
              <div className="flex-1">
                {selection.checkIn && !selection.checkOut && (
                  <p className="text-stone-600 text-sm">
                    Arrivée : <span className="font-medium text-stone-900">
                      {format(new Date(selection.checkIn), 'd MMMM yyyy', { locale: fr })}
                    </span>
                    <br />
                    <span className="text-stone-400">Sélectionnez votre date de départ</span>
                  </p>
                )}
                {totals && (() => {
                  const basePrice = totals.total;
                  const stayDiscount = getStayDiscount(totals.nights, settings);
                  const discountAmount = stayDiscount ? Math.round(basePrice * stayDiscount.percent / 100) : 0;
                  const priceAfterDiscount = basePrice - discountAmount;

                  // Prix Airbnb = même prix avec réduction + frais de service (configurable via admin)
                  const airbnbServiceFeePercent = settings.airbnb.serviceFee / 100;
                  const airbnbPrice = Math.round(priceAfterDiscount * (1 + airbnbServiceFeePercent));
                  const directSavings = airbnbPrice - priceAfterDiscount;
                  const directSavingsPercent = Math.round((directSavings / airbnbPrice) * 100);

                  const airbnbUrl = `https://www.airbnb.fr/rooms/${settings.airbnb.listingId}?check_in=${selection.checkIn}&check_out=${selection.checkOut}&guests=2`;

                  return (
                    <>
                      {/* Dates */}
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-600">Arrivée</span>
                        <span className="font-medium text-stone-900">
                          {format(new Date(selection.checkIn!), 'd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-stone-600">Départ</span>
                        <span className="font-medium text-stone-900">
                          {format(new Date(selection.checkOut!), 'd MMM yyyy', { locale: fr })}
                        </span>
                      </div>

                      {/* Détail du prix */}
                      <div className="pt-3 border-t border-stone-200 space-y-2">
                        {/* Prix de base */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-stone-600">{totals.nights} nuit{totals.nights > 1 ? 's' : ''}</span>
                          <span className="text-stone-600">{basePrice}€</span>
                        </div>

                        {/* Badge réduction durée */}
                        {stayDiscount && (
                          <div className="flex justify-between items-center text-sm bg-amber-50 -mx-2 px-2 py-2 rounded border border-amber-200">
                            <span className="text-amber-700 font-medium flex items-center gap-2">
                              <span className="text-lg">🎉</span>
                              {stayDiscount.label} (-{stayDiscount.percent}%)
                            </span>
                            <span className="text-amber-700 font-bold">-{discountAmount}€</span>
                          </div>
                        )}

                        {/* Sous-total après réduction */}
                        {stayDiscount && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-stone-500">Sous-total</span>
                            <span className="text-stone-700 font-medium">{priceAfterDiscount}€</span>
                          </div>
                        )}

                        {/* Séparateur comparaison */}
                        <div className="pt-2 mt-2 border-t border-dashed border-stone-200">
                          <p className="text-xs text-stone-400 text-center mb-2">Comparez et économisez</p>
                        </div>

                        {/* Prix Airbnb barré avec lien */}
                        <a
                          href={airbnbUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex justify-between items-center text-sm group hover:bg-red-50 -mx-2 px-2 py-2 rounded transition-colors border border-transparent hover:border-red-200"
                        >
                          <span className="text-stone-400 flex items-center gap-2">
                            <svg className="h-4 w-4 text-[#FF5A5F]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.7 18.5c-.5.8-1.1 1.5-1.9 2-.8.6-1.7.9-2.7 1-.4 0-.9 0-1.3-.1-.5-.1-.9-.3-1.3-.5-.4-.2-.8-.5-1.2-.8-.4-.3-.7-.7-1-1.1-.3-.4-.5-.8-.7-1.3-.2-.5-.3-1-.4-1.5 0-.3 0-.5.1-.8.1-.3.2-.5.3-.8.1-.2.3-.5.5-.7.2-.2.4-.4.6-.6l4.4-4.4c.2-.2.4-.3.6-.4.2-.1.5-.2.7-.2.3 0 .5 0 .8.1.3.1.5.2.7.4.2.2.4.4.5.6.1.2.2.5.2.8 0 .3-.1.5-.2.8-.1.2-.3.5-.5.7l-2.4 2.4c-.1.1-.1.2-.1.3s0 .2.1.3c.1.1.2.1.3.1s.2 0 .3-.1l2.4-2.4c.4-.4.7-.8.9-1.3.2-.5.3-1 .3-1.5s-.1-1-.3-1.5c-.2-.5-.5-.9-.9-1.3-.4-.4-.8-.7-1.3-.9-.5-.2-1-.3-1.5-.3s-1 .1-1.5.3c-.5.2-.9.5-1.3.9L7.2 11c-.4.4-.7.8-.9 1.3-.2.5-.3 1-.3 1.5s.1 1 .3 1.5c.2.5.5.9.9 1.3.4.4.8.7 1.3.9.5.2 1 .3 1.5.3.3 0 .5 0 .8-.1.3-.1.5-.2.8-.3.2-.1.5-.3.7-.5.2-.2.4-.4.6-.6.3.4.6.8 1 1.1.4.3.8.6 1.2.8.4.2.9.4 1.3.5.5.1.9.1 1.3.1z"/>
                            </svg>
                            Sur Airbnb
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <span className="text-red-400 line-through font-medium">{airbnbPrice}€</span>
                        </a>

                        {/* Prix direct */}
                        <div className="flex justify-between items-center bg-gold/10 -mx-2 px-2 py-2 rounded">
                          <span className="text-stone-900 font-medium">✨ Prix direct</span>
                          <span className="text-2xl font-serif text-gold">{priceAfterDiscount}€</span>
                        </div>

                        {/* Économie totale */}
                        <div className="flex justify-between items-center bg-green-100 -mx-2 px-3 py-3 rounded-lg">
                          <div>
                            <span className="text-green-800 text-sm font-bold block">Vous économisez</span>
                            <span className="text-green-600 text-xs">en réservant en direct</span>
                          </div>
                          <div className="text-right">
                            <span className="text-green-800 text-xl font-bold block">{directSavings}€</span>
                            <span className="text-green-600 text-xs font-medium">soit {directSavingsPercent}%</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {totals && (
              <button
                onClick={handleReserve}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Réserver via WhatsApp
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
