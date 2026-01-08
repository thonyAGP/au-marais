'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MessageCircle } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore, startOfToday, addDays, differenceInDays, isSameDay, isWithinInterval } from 'date-fns';
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

const WEEKDAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const DEFAULT_SETTINGS: SiteSettings = {
  discounts: { weekly: 10, biweekly: 15, monthly: 20 },
  airbnb: { nightlyMarkup: 19, cleaningFee: 48, touristTax: 2.88, listingId: '618442543008929958' },
  contact: { whatsapp: '33631598400' },
};

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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch {
        console.error('Erreur lors du chargement des paramètres');
      }
    };
    fetchSettings();
  }, []);

  const fetchRates = useCallback(async (month: Date) => {
    setLoading(true);
    setError(null);

    const start = format(startOfMonth(month), 'yyyy-MM-dd');
    const end = format(endOfMonth(addMonths(month, 3)), 'yyyy-MM-dd');

    try {
      const response = await fetch(`/api/availability?start=${start}&end=${end}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();

      const apartmentId = Object.keys(data.data || {})[0];
      if (apartmentId && data.data[apartmentId]) {
        setRates(prev => ({ ...prev, ...data.data[apartmentId] }));
      }
    } catch {
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

    let firstDayOfWeek = start.getDay() - 1;
    if (firstDayOfWeek < 0) firstDayOfWeek = 6;

    const days: CalendarDay[] = [];

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
      setSelection({ checkIn: day.date, checkOut: null });
    } else {
      const checkInDate = new Date(selection.checkIn);
      const clickedDate = new Date(day.date);

      if (isBefore(clickedDate, checkInDate)) {
        setSelection({ checkIn: day.date, checkOut: null });
      } else if (isSameDay(clickedDate, checkInDate)) {
        setSelection({ checkIn: null, checkOut: null });
      } else {
        const daysInRange = eachDayOfInterval({ start: checkInDate, end: clickedDate });
        const allAvailable = daysInRange.every(d => {
          const dateStr = format(d, 'yyyy-MM-dd');
          return rates[dateStr]?.available === 1;
        });

        if (allAvailable) {
          setSelection({ checkIn: selection.checkIn, checkOut: day.date });
        } else {
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

  const totals = calculateTotal();
  const canGoPrevious = !isBefore(startOfMonth(subMonths(currentMonth, 1)), startOfMonth(new Date()));
  const nextMonth = addMonths(currentMonth, 1);

  const renderMonth = (month: Date) => {
    const days = getCalendarDays(month);

    return (
      <div className="flex-1 min-w-0">
        <h4 className="text-center font-medium text-text text-sm mb-2 capitalize">
          {format(month, 'MMMM yyyy', { locale: fr })}
        </h4>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {WEEKDAYS_SHORT.map((day, i) => (
            <div key={i} className="text-center text-[10px] font-medium text-text-muted py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
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
                  relative aspect-square flex items-center justify-center text-xs rounded transition-all
                  ${!day.isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                  ${day.isPast || !day.available ? 'text-text-muted/50 cursor-not-allowed' : 'hover:bg-gold/20 cursor-pointer'}
                  ${day.available && !day.isPast ? 'text-text' : ''}
                  ${day.isToday ? 'ring-1 ring-gold ring-inset' : ''}
                  ${inRange && !isStart && !isEnd ? 'bg-gold/20' : ''}
                  ${isStart || isEnd ? 'bg-gold text-white font-medium' : ''}
                `}
              >
                {day.dayOfMonth}
                {!day.available && day.isCurrentMonth && !day.isPast && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-4 h-px bg-text-muted/30 rotate-45" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="bg-white border border-stone-200 overflow-hidden max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
          <button
            onClick={goToPreviousMonth}
            disabled={!canGoPrevious}
            className="p-2 hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="h-4 w-4 text-text-light" />
          </button>
          <span className="text-sm text-text-muted">Sélectionnez vos dates</span>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-cream transition-colors"
            aria-label="Mois suivant"
          >
            <ChevronRight className="h-4 w-4 text-text-light" />
          </button>
        </div>

        {/* Calendar Grid - 2 months */}
        <div className="p-4">
          {loading && !Object.keys(rates).length ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gold border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-text-muted text-sm">{error}</div>
          ) : (
            <div className="flex gap-6">
              {renderMonth(currentMonth)}
              <div className="w-px bg-stone-200 hidden sm:block" />
              <div className="hidden sm:block flex-1">
                {renderMonth(nextMonth)}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="px-4 pb-3 flex items-center justify-center gap-6 text-[10px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-gold" />
            <span>Sélectionné</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-stone-100 relative">
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-2 h-px bg-text-muted/40 rotate-45" />
              </span>
            </span>
            <span>Indisponible</span>
          </div>
        </div>

        {/* Selection Summary */}
        {(selection.checkIn || totals) && (
          <div className="border-t border-stone-200 p-4 bg-cream">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {selection.checkIn && !selection.checkOut && (
                  <p className="text-text-light text-xs">
                    Arrivée : <span className="font-medium text-text">
                      {format(new Date(selection.checkIn), 'd MMM yyyy', { locale: fr })}
                    </span>
                    <span className="text-text-muted ml-2">→ Choisir départ</span>
                  </p>
                )}
                {totals && (() => {
                  const basePrice = totals.total;
                  const stayDiscount = getStayDiscount(totals.nights, settings);
                  const discountAmount = stayDiscount ? Math.round(basePrice * stayDiscount.percent / 100) : 0;
                  const priceAfterDiscount = basePrice - discountAmount;

                  // Calcul prix Airbnb: nuitées majorées + frais ménage + taxe séjour (2 voyageurs par défaut)
                  const nightlyMarkupPercent = settings.airbnb.nightlyMarkup / 100;
                  const airbnbNightlyTotal = Math.round(basePrice * (1 + nightlyMarkupPercent));
                  const airbnbCleaningFee = settings.airbnb.cleaningFee;
                  const airbnbTouristTax = Math.round(settings.airbnb.touristTax * 2 * totals.nights); // 2 voyageurs
                  const airbnbPrice = airbnbNightlyTotal + airbnbCleaningFee + airbnbTouristTax;
                  const directSavings = airbnbPrice - priceAfterDiscount;
                  const directSavingsPercent = Math.round((directSavings / airbnbPrice) * 100);

                  const airbnbUrl = `https://www.airbnb.fr/rooms/${settings.airbnb.listingId}?check_in=${selection.checkIn}&check_out=${selection.checkOut}&guests=2`;

                  return (
                    <div className="space-y-3">
                      {/* Dates row */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-text-light">
                          {format(new Date(selection.checkIn!), 'd MMM', { locale: fr })}
                        </span>
                        <span className="text-text-muted">→</span>
                        <span className="text-text-light">
                          {format(new Date(selection.checkOut!), 'd MMM', { locale: fr })}
                        </span>
                        <span className="text-text-muted">·</span>
                        <span className="text-text-light">{totals.nights} nuit{totals.nights > 1 ? 's' : ''}</span>
                      </div>

                      {/* Price comparison */}
                      <div className="flex items-center justify-between bg-white border border-stone-200 p-3">
                        <div className="space-y-1">
                          {stayDiscount && (
                            <span className="inline-block text-[10px] px-2 py-0.5 bg-gold/20 text-gold font-medium">
                              -{stayDiscount.percent}% {stayDiscount.label.replace('Réduction ', '')}
                            </span>
                          )}
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-serif text-gold">{priceAfterDiscount}€</span>
                            <a
                              href={airbnbUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-text-muted line-through hover:text-[#FF5A5F] transition-colors"
                            >
                              {airbnbPrice}€ Airbnb
                            </a>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs text-green-600 font-medium">-{directSavings}€</span>
                          <span className="text-[10px] text-green-600/70">({directSavingsPercent}% économisés)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {totals && (
              <button
                onClick={handleReserve}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-medium tracking-wide uppercase transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Réserver via WhatsApp
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
