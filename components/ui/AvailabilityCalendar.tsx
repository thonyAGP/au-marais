'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MessageCircle, Tag, Check, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore, startOfToday, addDays, differenceInDays, isSameDay, isWithinInterval } from 'date-fns';
import { fr, enUS, es, de, pt, zhCN } from 'date-fns/locale';
import type { CalendarDay, DateRange } from '@/types/smoobu';
import type { SiteSettings } from '@/types/settings';
import type { Locale } from '@/lib/i18n/config';

interface CalendarDict {
  weekdays: string[];
  selectDates: string;
  previousMonth: string;
  nextMonth: string;
  selected: string;
  unavailable: string;
  arrival: string;
  departure: string;
  chooseCheckout: string;
  night: string;
  nights: string;
  saved: string;
  reserveWhatsApp: string;
  discounts: {
    weekly: string;
    biweekly: string;
    monthly: string;
  };
  promoCode: {
    placeholder: string;
    apply: string;
    applied: string;
    invalid: string;
    expired: string;
    minNights: string;
    discount: string;
  };
  errors: {
    loadingSettings: string;
    loading: string;
    unavailable: string;
  };
  whatsappMessage: {
    greeting: string;
    intro: string;
    checkIn: string;
    checkOut: string;
    nightsLabel: string;
    estimatedTotal: string;
    promoCodeLabel: string;
    confirmation: string;
  };
}

interface AvailabilityCalendarProps {
  className?: string;
  dict: CalendarDict;
  locale: Locale;
}

const dateFnsLocales: Record<Locale, typeof fr> = {
  fr,
  en: enUS,
  es,
  de,
  pt,
  zh: zhCN,
};

interface RatesData {
  [date: string]: {
    price: number | null;
    available: 0 | 1;
    min_length_of_stay: number | null;
  };
}

interface PromoCodeState {
  code: string;
  validated: boolean;
  validating: boolean;
  discount: number;
  type: 'percent' | 'fixed';
  description: string;
  error: string | null;
}

const DEFAULT_SETTINGS: SiteSettings = {
  discounts: { weekly: 10, biweekly: 15, monthly: 20 },
  airbnb: { nightlyMarkup: 19, cleaningFee: 48, touristTax: 2.88, listingId: '618442543008929958' },
  contact: { whatsapp: '33631598400' },
  emails: { fromEmail: 'reservation@au-marais.fr', fromName: 'Au Marais', adminEmails: ['au-marais@hotmail.com'] },
};

const getStayDiscounts = (settings: SiteSettings, discountLabels: CalendarDict['discounts']) => {
  const discounts = [];
  if (settings.discounts.monthly > 0) {
    discounts.push({ minNights: 28, percent: settings.discounts.monthly, label: discountLabels.monthly });
  }
  if (settings.discounts.biweekly > 0) {
    discounts.push({ minNights: 14, percent: settings.discounts.biweekly, label: discountLabels.biweekly });
  }
  if (settings.discounts.weekly > 0) {
    discounts.push({ minNights: 7, percent: settings.discounts.weekly, label: discountLabels.weekly });
  }
  return discounts;
};

const getStayDiscount = (nights: number, settings: SiteSettings, discountLabels: CalendarDict['discounts']) => {
  const discounts = getStayDiscounts(settings, discountLabels);
  for (const discount of discounts) {
    if (nights >= discount.minNights) {
      return discount;
    }
  }
  return null;
};

export const AvailabilityCalendar = ({ className, dict, locale }: AvailabilityCalendarProps) => {
  const dateLocale = useMemo(() => dateFnsLocales[locale] || fr, [locale]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rates, setRates] = useState<RatesData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<DateRange>({ checkIn: null, checkOut: null });
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [promoCode, setPromoCode] = useState<PromoCodeState>({
    code: '',
    validated: false,
    validating: false,
    discount: 0,
    type: 'percent',
    description: '',
    error: null,
  });
  const [promoInput, setPromoInput] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch {
        console.error(dict.errors.loadingSettings);
      }
    };
    fetchSettings();
  }, [dict.errors.loadingSettings]);

  const fetchRates = useCallback(async (month: Date) => {
    setLoading(true);
    setError(null);

    const start = format(startOfMonth(month), 'yyyy-MM-dd');
    const end = format(endOfMonth(addMonths(month, 3)), 'yyyy-MM-dd');

    try {
      const response = await fetch(`/api/availability?start=${start}&end=${end}`);
      if (!response.ok) throw new Error(dict.errors.loading);
      const data = await response.json();

      const apartmentId = Object.keys(data.data || {})[0];
      if (apartmentId && data.data[apartmentId]) {
        setRates(prev => ({ ...prev, ...data.data[apartmentId] }));
      }
    } catch {
      setError(dict.errors.unavailable);
    } finally {
      setLoading(false);
    }
  }, [dict.errors.loading, dict.errors.unavailable]);

  useEffect(() => {
    fetchRates(currentMonth);
  }, [currentMonth, fetchRates]);

  const validatePromoCode = async () => {
    if (!promoInput.trim()) return;

    const totals = calculateTotal();
    const nights = totals?.nights || 0;

    setPromoCode(prev => ({ ...prev, validating: true, error: null }));

    try {
      const response = await fetch('/api/promo-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoInput.trim(),
          nights,
          totalPrice: totals?.total || 0,
        }),
      });

      const result = await response.json();

      if (result.valid) {
        setPromoCode({
          code: result.code,
          validated: true,
          validating: false,
          discount: result.discount,
          type: result.type,
          description: result.description,
          error: null,
        });
      } else {
        setPromoCode(prev => ({
          ...prev,
          validated: false,
          validating: false,
          error: result.error || dict.promoCode.invalid,
        }));
      }
    } catch {
      setPromoCode(prev => ({
        ...prev,
        validated: false,
        validating: false,
        error: dict.promoCode.invalid,
      }));
    }
  };

  const clearPromoCode = () => {
    setPromoCode({
      code: '',
      validated: false,
      validating: false,
      discount: 0,
      type: 'percent',
      description: '',
      error: null,
    });
    setPromoInput('');
  };

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

    const checkInFormatted = format(new Date(selection.checkIn), 'd MMMM yyyy', { locale: dateLocale });
    const checkOutFormatted = format(new Date(selection.checkOut), 'd MMMM yyyy', { locale: dateLocale });
    const totals = calculateTotal();
    const msg = dict.whatsappMessage;

    // Calculate final price with promo code if applied
    let finalTotal = totals?.total || 0;
    if (promoCode.validated && totals) {
      if (promoCode.type === 'percent') {
        finalTotal = Math.round(totals.total * (1 - promoCode.discount / 100));
      } else {
        finalTotal = Math.max(0, totals.total - promoCode.discount);
      }
    }

    let message = `${msg.greeting}\n\n${msg.intro}\n` +
      `- ${msg.checkIn} : ${checkInFormatted}\n` +
      `- ${msg.checkOut} : ${checkOutFormatted}\n` +
      `- ${totals?.nights} ${msg.nightsLabel}\n` +
      `- ${msg.estimatedTotal} : ${finalTotal}€`;

    // Add promo code line if validated
    if (promoCode.validated) {
      message += `\n- ${msg.promoCodeLabel} : ${promoCode.code} (-${promoCode.discount}${promoCode.type === 'percent' ? '%' : '€'})`;
    }

    message += `\n\n${msg.confirmation}`;

    window.open(`https://wa.me/${settings.contact.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const totals = calculateTotal();
  const canGoPrevious = !isBefore(startOfMonth(subMonths(currentMonth, 1)), startOfMonth(new Date()));
  const nextMonth = addMonths(currentMonth, 1);

  const renderMonth = (month: Date) => {
    const days = getCalendarDays(month);

    return (
      <div className="flex-1 min-w-0">
        <h4 className="text-center font-medium text-text text-sm mb-2 capitalize">
          {format(month, 'MMMM yyyy', { locale: dateLocale })}
        </h4>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {dict.weekdays.map((day, i) => (
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
            aria-label={dict.previousMonth}
          >
            <ChevronLeft className="h-4 w-4 text-text-light" />
          </button>
          <span className="text-sm text-text-muted">{dict.selectDates}</span>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-cream transition-colors"
            aria-label={dict.nextMonth}
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
            <span>{dict.selected}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-stone-100 relative">
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-2 h-px bg-text-muted/40 rotate-45" />
              </span>
            </span>
            <span>{dict.unavailable}</span>
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
                    {dict.arrival} : <span className="font-medium text-text">
                      {format(new Date(selection.checkIn), 'd MMM yyyy', { locale: dateLocale })}
                    </span>
                    <span className="text-text-muted ml-2">→ {dict.chooseCheckout}</span>
                  </p>
                )}
                {totals && (() => {
                  const basePrice = totals.total;
                  const stayDiscount = getStayDiscount(totals.nights, settings, dict.discounts);
                  const stayDiscountAmount = stayDiscount ? Math.round(basePrice * stayDiscount.percent / 100) : 0;
                  const priceAfterStayDiscount = basePrice - stayDiscountAmount;

                  // Apply promo code discount if validated
                  let promoDiscountAmount = 0;
                  if (promoCode.validated) {
                    if (promoCode.type === 'percent') {
                      promoDiscountAmount = Math.round(priceAfterStayDiscount * promoCode.discount / 100);
                    } else {
                      promoDiscountAmount = promoCode.discount;
                    }
                  }
                  const finalPrice = priceAfterStayDiscount - promoDiscountAmount;

                  // Calcul prix Airbnb: nuitées majorées + frais ménage + taxe séjour (2 voyageurs par défaut)
                  const nightlyMarkupPercent = settings.airbnb.nightlyMarkup / 100;
                  const airbnbNightlyTotal = Math.round(basePrice * (1 + nightlyMarkupPercent));
                  const airbnbCleaningFee = settings.airbnb.cleaningFee;
                  const airbnbTouristTax = Math.round(settings.airbnb.touristTax * 2 * totals.nights); // 2 voyageurs
                  const airbnbPrice = airbnbNightlyTotal + airbnbCleaningFee + airbnbTouristTax;
                  const directSavings = airbnbPrice - finalPrice;
                  const directSavingsPercent = Math.round((directSavings / airbnbPrice) * 100);

                  const airbnbUrl = `https://www.airbnb.fr/rooms/${settings.airbnb.listingId}?check_in=${selection.checkIn}&check_out=${selection.checkOut}&guests=2`;

                  return (
                    <div className="space-y-3">
                      {/* Dates row */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-text-light">
                          {format(new Date(selection.checkIn!), 'd MMM', { locale: dateLocale })}
                        </span>
                        <span className="text-text-muted">→</span>
                        <span className="text-text-light">
                          {format(new Date(selection.checkOut!), 'd MMM', { locale: dateLocale })}
                        </span>
                        <span className="text-text-muted">·</span>
                        <span className="text-text-light">{totals.nights} {totals.nights > 1 ? dict.nights : dict.night}</span>
                      </div>

                      {/* Price comparison */}
                      <div className="flex items-center justify-between bg-white border border-stone-200 p-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {stayDiscount && (
                              <span className="inline-block text-[10px] px-2 py-0.5 bg-gold/20 text-gold font-medium">
                                -{stayDiscount.percent}% {stayDiscount.label}
                              </span>
                            )}
                            {promoCode.validated && (
                              <span className="inline-block text-[10px] px-2 py-0.5 bg-green-100 text-green-700 font-medium">
                                {promoCode.code} -{promoCode.discount}{promoCode.type === 'percent' ? '%' : '€'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-serif text-gold">{finalPrice}€</span>
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
                          <span className="text-[10px] text-green-600/70">({directSavingsPercent}% {dict.saved})</span>
                        </div>
                      </div>

                      {/* Promo code input */}
                      <div className="bg-white border border-stone-200 p-3">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-text-muted flex-shrink-0" />
                          {promoCode.validated ? (
                            <div className="flex-1 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-700 font-medium">{promoCode.code}</span>
                                <span className="text-xs text-green-600">({dict.promoCode.applied})</span>
                              </div>
                              <button
                                onClick={clearPromoCode}
                                className="p-1 text-text-muted hover:text-text transition-colors"
                                aria-label="Remove promo code"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <input
                                type="text"
                                value={promoInput}
                                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                placeholder={dict.promoCode.placeholder}
                                className="flex-1 text-sm border-0 bg-transparent focus:outline-none focus:ring-0 placeholder:text-text-muted/50"
                                onKeyDown={(e) => e.key === 'Enter' && validatePromoCode()}
                              />
                              <button
                                onClick={validatePromoCode}
                                disabled={promoCode.validating || !promoInput.trim()}
                                className="px-3 py-1.5 text-xs font-medium border border-gold text-gold hover:bg-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {promoCode.validating ? '...' : dict.promoCode.apply}
                              </button>
                            </>
                          )}
                        </div>
                        {promoCode.error && (
                          <p className="mt-2 text-xs text-red-600">{promoCode.error}</p>
                        )}
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
                {dict.reserveWhatsApp}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
