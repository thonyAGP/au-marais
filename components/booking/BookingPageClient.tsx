'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Container, AnimateOnScroll } from '@/components/ui';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Star,
  Home,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Search,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isBefore,
  startOfToday,
  addDays,
  differenceInDays,
  isSameDay,
  isWithinInterval,
} from 'date-fns';
import { fr, enUS, es, de, pt, zhCN } from 'date-fns/locale';
import type { Locale } from '@/lib/i18n/config';

const dateFnsLocales: Record<Locale, typeof fr> = {
  fr,
  en: enUS,
  es,
  de,
  pt,
  zh: zhCN,
};

// Get flag image URL (same as language switcher)
const getCountryFlagUrl = (countryCode: string, size: number = 20) =>
  `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${countryCode.toLowerCase()}.png`;

// Phone country codes - comprehensive list for Paris tourists
const COUNTRY_CODES = [
  // Europe - Main markets
  { code: '+33', country: 'fr', name: 'France' },
  { code: '+44', country: 'gb', name: 'United Kingdom' },
  { code: '+49', country: 'de', name: 'Germany' },
  { code: '+34', country: 'es', name: 'Spain' },
  { code: '+39', country: 'it', name: 'Italy' },
  { code: '+351', country: 'pt', name: 'Portugal' },
  { code: '+32', country: 'be', name: 'Belgium' },
  { code: '+41', country: 'ch', name: 'Switzerland' },
  { code: '+31', country: 'nl', name: 'Netherlands' },
  { code: '+43', country: 'at', name: 'Austria' },
  { code: '+48', country: 'pl', name: 'Poland' },
  { code: '+420', country: 'cz', name: 'Czech Republic' },
  { code: '+45', country: 'dk', name: 'Denmark' },
  { code: '+46', country: 'se', name: 'Sweden' },
  { code: '+47', country: 'no', name: 'Norway' },
  { code: '+358', country: 'fi', name: 'Finland' },
  { code: '+353', country: 'ie', name: 'Ireland' },
  { code: '+30', country: 'gr', name: 'Greece' },
  { code: '+36', country: 'hu', name: 'Hungary' },
  { code: '+40', country: 'ro', name: 'Romania' },
  { code: '+352', country: 'lu', name: 'Luxembourg' },
  // Americas
  { code: '+1', country: 'us', name: 'United States' },
  { code: '+1', country: 'ca', name: 'Canada' },
  { code: '+55', country: 'br', name: 'Brazil' },
  { code: '+52', country: 'mx', name: 'Mexico' },
  { code: '+54', country: 'ar', name: 'Argentina' },
  { code: '+56', country: 'cl', name: 'Chile' },
  { code: '+57', country: 'co', name: 'Colombia' },
  // Asia & Pacific
  { code: '+86', country: 'cn', name: 'China' },
  { code: '+81', country: 'jp', name: 'Japan' },
  { code: '+82', country: 'kr', name: 'South Korea' },
  { code: '+852', country: 'hk', name: 'Hong Kong' },
  { code: '+886', country: 'tw', name: 'Taiwan' },
  { code: '+65', country: 'sg', name: 'Singapore' },
  { code: '+61', country: 'au', name: 'Australia' },
  { code: '+64', country: 'nz', name: 'New Zealand' },
  { code: '+91', country: 'in', name: 'India' },
  { code: '+66', country: 'th', name: 'Thailand' },
  { code: '+84', country: 'vn', name: 'Vietnam' },
  { code: '+60', country: 'my', name: 'Malaysia' },
  { code: '+62', country: 'id', name: 'Indonesia' },
  { code: '+63', country: 'ph', name: 'Philippines' },
  // Middle East & Africa
  { code: '+971', country: 'ae', name: 'UAE' },
  { code: '+966', country: 'sa', name: 'Saudi Arabia' },
  { code: '+972', country: 'il', name: 'Israel' },
  { code: '+90', country: 'tr', name: 'Turkey' },
  { code: '+212', country: 'ma', name: 'Morocco' },
  { code: '+27', country: 'za', name: 'South Africa' },
  { code: '+20', country: 'eg', name: 'Egypt' },
  // Eastern Europe & Russia
  { code: '+7', country: 'ru', name: 'Russia' },
  { code: '+380', country: 'ua', name: 'Ukraine' },
] as const;

// Default country code based on locale
const DEFAULT_COUNTRY_CODE: Record<Locale, string> = {
  fr: '+33',
  en: '+44',
  es: '+34',
  de: '+49',
  pt: '+351',
  zh: '+86',
};

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

interface BookingDict {
  hero: {
    sectionTitle: string;
    description: string;
  };
  title: string;
  subtitle: string;
  calendar: {
    title: string;
    instruction: string;
  };
  form: {
    title: string;
    subtitle: string;
    firstName: string;
    lastName: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    guests: string;
    guestsOptions: {
      '1': string;
      '2': string;
      '3': string;
      '4': string;
    };
    message: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    submitNote: string;
    success: string;
    successMessage: string;
    error: string;
    selectDatesFirst: string;
  };
  pricing: {
    title: string;
    nights: string;
    nightlyRate: string;
    discount: string;
    cleaningFee: string;
    touristTax: string;
    total: string;
    depositInfo: string;
    savingsVsAirbnb: string;
  };
  benefits: {
    title: string;
    items: string[];
  };
  apartment: {
    sectionTitle: string;
    title: string;
    items: Array<{ label: string; value: string }>;
    viewApartment: string;
  };
  airbnb: {
    preferPlatform: string;
    viewOnAirbnb: string;
    note: string;
  };
}

interface BookingPageClientProps {
  dict: BookingDict;
  calendarDict: CalendarDict;
  locale: Locale;
}

interface RatesData {
  [date: string]: {
    price: number | null;
    available: 0 | 1;
    min_length_of_stay: number | null;
  };
}

interface CalendarDay {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  available: boolean;
  price: number | null;
  minStay: number | null;
}

interface DateRange {
  checkIn: string | null;
  checkOut: string | null;
}

interface PricingResult {
  nightlyRate: number;
  nights: number;
  subtotal: number;
  discount: number;
  discountPercent: number;
  cleaningFee: number;
  touristTax: number;
  total: number;
  depositSuggested: number;
}

export const BookingPageClient = ({ dict, calendarDict, locale }: BookingPageClientProps) => {
  const dateLocale = useMemo(() => dateFnsLocales[locale] || fr, [locale]);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rates, setRates] = useState<RatesData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<DateRange>({ checkIn: null, checkOut: null });

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    guests: '2',
    message: '',
  });
  const [phoneCountryCode, setPhoneCountryCode] = useState(DEFAULT_COUNTRY_CODE[locale] || '+33');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch rates
  const fetchRates = useCallback(async (month: Date) => {
    setLoading(true);
    setError(null);

    const start = format(startOfMonth(month), 'yyyy-MM-dd');
    const end = format(endOfMonth(addMonths(month, 3)), 'yyyy-MM-dd');

    try {
      const response = await fetch(`/api/availability?start=${start}&end=${end}`);
      if (!response.ok) throw new Error(calendarDict.errors.loading);
      const data = await response.json();

      const apartmentId = Object.keys(data.data || {})[0];
      if (apartmentId && data.data[apartmentId]) {
        setRates(prev => ({ ...prev, ...data.data[apartmentId] }));
      }
    } catch {
      setError(calendarDict.errors.unavailable);
    } finally {
      setLoading(false);
    }
  }, [calendarDict.errors.loading, calendarDict.errors.unavailable]);

  useEffect(() => {
    fetchRates(currentMonth);
  }, [currentMonth, fetchRates]);

  // Calendar navigation
  const goToPreviousMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    if (!isBefore(startOfMonth(prevMonth), startOfMonth(new Date()))) {
      setCurrentMonth(prevMonth);
    }
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Get calendar days
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

  // Handle day click
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

  // Calculate pricing
  const pricing: PricingResult | null = useMemo(() => {
    if (!selection.checkIn || !selection.checkOut) return null;

    const arrival = new Date(selection.checkIn);
    const departure = new Date(selection.checkOut);
    const nights = differenceInDays(departure, arrival);
    const guests = parseInt(formData.guests);

    const nightlyRate = 250;
    const cleaningFee = 50;
    const touristTaxPerNight = 2.88;

    let discountPercent = 0;
    if (nights >= 28) discountPercent = 20;
    else if (nights >= 14) discountPercent = 15;
    else if (nights >= 7) discountPercent = 10;

    const subtotal = nightlyRate * nights;
    const discount = Math.round(subtotal * (discountPercent / 100));
    const touristTax = Math.round(touristTaxPerNight * nights * guests * 100) / 100;
    const total = subtotal - discount + cleaningFee + touristTax;
    const depositSuggested = Math.max(Math.round((total * 0.3) / 50) * 50, 100);

    return {
      nightlyRate,
      nights,
      subtotal,
      discount,
      discountPercent,
      cleaningFee,
      touristTax,
      total,
      depositSuggested,
    };
  }, [selection.checkIn, selection.checkOut, formData.guests]);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selection.checkIn || !selection.checkOut) return;

    setIsSubmitting(true);
    setErrorMessage('');

    // Combine country code with phone number
    const fullPhone = formData.phone.startsWith('+')
      ? formData.phone
      : `${phoneCountryCode}${formData.phone.replace(/^0/, '')}`;

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: fullPhone,
          arrivalDate: selection.checkIn,
          departureDate: selection.checkOut,
          guests: parseInt(formData.guests),
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit reservation');
      }

      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGoPrevious = !isBefore(startOfMonth(subMonths(currentMonth, 1)), startOfMonth(new Date()));
  const nextMonth = addMonths(currentMonth, 1);

  // Render calendar month
  const renderMonth = (month: Date) => {
    const days = getCalendarDays(month);

    return (
      <div className="flex-1 min-w-0">
        <h4 className="text-center font-medium text-text text-sm mb-2 capitalize">
          {format(month, 'MMMM yyyy', { locale: dateLocale })}
        </h4>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {calendarDict.weekdays.map((day, i) => (
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
                type="button"
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

  // Success state
  if (submitStatus === 'success') {
    return (
      <>
        <section className="py-24 bg-cream-dark">
          <Container>
            <AnimateOnScroll className="text-center">
              <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
                {dict.hero.sectionTitle}
              </p>
              <h1 className="font-serif text-5xl md:text-6xl text-text mb-6">
                {dict.title}
              </h1>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="py-20 bg-cream">
          <Container size="sm">
            <div className="bg-white border border-stone-200 p-8 md:p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-serif text-text mb-2">{dict.form.success}</h3>
              <p className="text-text-muted">{dict.form.successMessage}</p>
              <Link
                href={`/${locale}`}
                className="inline-block mt-6 text-gold hover:underline"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="py-24 bg-cream-dark">
        <Container>
          <AnimateOnScroll className="text-center">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              {dict.hero.sectionTitle}
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-text mb-6">
              {dict.title}
            </h1>
            <p className="text-text-muted max-w-2xl mx-auto text-lg">
              {dict.hero.description}
            </p>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Main Booking Section */}
      <section className="py-20 bg-cream">
        <Container>
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Calendar - Left Side */}
            <div className="lg:col-span-3">
              <AnimateOnScroll>
                <div className="bg-white border border-stone-200 overflow-hidden">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
                    <button
                      type="button"
                      onClick={goToPreviousMonth}
                      disabled={!canGoPrevious}
                      className="p-2 hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label={calendarDict.previousMonth}
                    >
                      <ChevronLeft className="h-4 w-4 text-text-light" />
                    </button>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gold" />
                      <span className="text-sm font-medium text-text">{dict.calendar.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-cream transition-colors"
                      aria-label={calendarDict.nextMonth}
                    >
                      <ChevronRight className="h-4 w-4 text-text-light" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
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
                      <span>{calendarDict.selected}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-stone-100 relative">
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-2 h-px bg-text-muted/40 rotate-45" />
                        </span>
                      </span>
                      <span>{calendarDict.unavailable}</span>
                    </div>
                  </div>

                  {/* Selection Summary */}
                  {selection.checkIn && (
                    <div className="border-t border-stone-200 p-4 bg-cream/50">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-text-light">{calendarDict.arrival}:</span>
                        <span className="font-medium text-text">
                          {format(new Date(selection.checkIn), 'd MMM yyyy', { locale: dateLocale })}
                        </span>
                        {selection.checkOut ? (
                          <>
                            <span className="text-text-muted">→</span>
                            <span className="text-text-light">{calendarDict.departure}:</span>
                            <span className="font-medium text-text">
                              {format(new Date(selection.checkOut), 'd MMM yyyy', { locale: dateLocale })}
                            </span>
                          </>
                        ) : (
                          <span className="text-text-muted text-xs">→ {calendarDict.chooseCheckout}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Instruction */}
                <p className="mt-4 text-center text-text-muted text-sm">
                  {dict.calendar.instruction}
                </p>
              </AnimateOnScroll>
            </div>

            {/* Form - Right Side */}
            <div className="lg:col-span-2">
              <AnimateOnScroll delay={200}>
                <div className="bg-white border border-stone-200 p-6 sticky top-28">
                  <h2 className="font-serif text-xl text-text mb-2">{dict.form.title}</h2>
                  <p className="text-text-muted text-sm mb-6">{dict.form.subtitle}</p>

                  {/* Pricing Preview */}
                  {pricing && (
                    <div className="bg-cream p-4 border border-stone-200 mb-6 space-y-2">
                      <h3 className="font-medium text-text text-sm">{dict.pricing.title}</h3>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">
                          {pricing.nights} {dict.pricing.nights} × {pricing.nightlyRate}€
                        </span>
                        <span>{pricing.subtotal}€</span>
                      </div>
                      {pricing.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>{dict.pricing.discount} ({pricing.discountPercent}%)</span>
                          <span>-{pricing.discount}€</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">{dict.pricing.cleaningFee}</span>
                        <span>{pricing.cleaningFee}€</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">{dict.pricing.touristTax}</span>
                        <span>{pricing.touristTax.toFixed(2)}€</span>
                      </div>
                      <div className="border-t border-stone-200 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>{dict.pricing.total}</span>
                          <span className="text-gold text-lg">{pricing.total.toFixed(2)}€</span>
                        </div>
                      </div>
                      <p className="text-xs text-text-muted">
                        {dict.pricing.depositInfo.replace('{amount}', pricing.depositSuggested.toString())}
                      </p>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!pricing && (
                      <div className="bg-gold/10 border border-gold/30 p-4 text-center">
                        <Calendar className="h-6 w-6 text-gold mx-auto mb-2" />
                        <p className="text-sm text-text-light">{dict.form.selectDatesFirst}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-text-light text-xs font-medium mb-1">
                          {dict.form.firstName} *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          disabled={!pricing}
                          className="w-full px-3 py-2 bg-cream border border-stone-200 text-text text-sm focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-text-light text-xs font-medium mb-1">
                          {dict.form.lastName} *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          disabled={!pricing}
                          className="w-full px-3 py-2 bg-cream border border-stone-200 text-text text-sm focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-text-light text-xs font-medium mb-1">
                        {dict.form.email} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!pricing}
                        placeholder={dict.form.emailPlaceholder}
                        className="w-full px-3 py-2 bg-cream border border-stone-200 text-text text-sm focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-text-light text-xs font-medium mb-1">
                          {dict.form.phone} *
                        </label>
                        <div className="flex">
                          {/* Custom country code dropdown with flag images */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => !pricing ? null : setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                              disabled={!pricing}
                              className="flex items-center gap-1.5 w-[100px] h-[42px] px-2 bg-cream border border-stone-200 border-r-0 text-text text-sm focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                              aria-label="Country code"
                              aria-expanded={isCountryDropdownOpen}
                            >
                              <img
                                src={getCountryFlagUrl(COUNTRY_CODES.find(c => c.code === phoneCountryCode)?.country || 'fr', 20)}
                                alt=""
                                className="w-5 h-[15px] object-cover rounded-sm flex-shrink-0"
                              />
                              <span className="text-xs">{phoneCountryCode}</span>
                              <ChevronDown className={`h-3 w-3 ml-auto transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isCountryDropdownOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => {
                                    setIsCountryDropdownOpen(false);
                                    setCountrySearch('');
                                  }}
                                />
                                <div className="absolute left-0 top-full mt-1 bg-white border border-stone-200 shadow-lg z-50 w-[240px] rounded-md overflow-hidden">
                                  {/* Search input */}
                                  <div className="p-2 border-b border-stone-200">
                                    <div className="relative">
                                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
                                      <input
                                        type="text"
                                        value={countrySearch}
                                        onChange={(e) => setCountrySearch(e.target.value)}
                                        placeholder="Rechercher..."
                                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-cream border border-stone-200 rounded focus:outline-none focus:border-gold"
                                        autoFocus
                                      />
                                    </div>
                                  </div>
                                  {/* Country list */}
                                  <div className="max-h-[250px] overflow-y-auto">
                                    {COUNTRY_CODES
                                      .filter(country =>
                                        countrySearch === '' ||
                                        country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                                        country.code.includes(countrySearch) ||
                                        country.country.toLowerCase().includes(countrySearch.toLowerCase())
                                      )
                                      .map((country, index) => (
                                        <button
                                          key={`${country.code}-${country.country}-${index}`}
                                          type="button"
                                          onClick={() => {
                                            setPhoneCountryCode(country.code);
                                            setIsCountryDropdownOpen(false);
                                            setCountrySearch('');
                                          }}
                                          className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-cream transition-colors text-left ${
                                            phoneCountryCode === country.code ? 'bg-cream text-gold' : 'text-text'
                                          }`}
                                        >
                                          <img
                                            src={getCountryFlagUrl(country.country, 20)}
                                            alt=""
                                            className="w-5 h-[15px] object-cover rounded-sm flex-shrink-0"
                                          />
                                          <span className="flex-1 truncate">{country.name}</span>
                                          <span className="text-text-light text-xs">{country.code}</span>
                                        </button>
                                      ))}
                                    {COUNTRY_CODES.filter(country =>
                                      countrySearch === '' ||
                                      country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                                      country.code.includes(countrySearch) ||
                                      country.country.toLowerCase().includes(countrySearch.toLowerCase())
                                    ).length === 0 && (
                                      <div className="px-3 py-4 text-sm text-text-light text-center">
                                        Aucun pays trouvé
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!pricing}
                            placeholder="6 12 34 56 78"
                            className="flex-1 h-[42px] px-3 bg-cream border border-stone-200 text-text text-sm focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="guests" className="block text-text-light text-xs font-medium mb-1">
                          {dict.form.guests} *
                        </label>
                        <select
                          id="guests"
                          name="guests"
                          required
                          value={formData.guests}
                          onChange={handleChange}
                          disabled={!pricing}
                          className="w-full h-[42px] px-3 bg-cream border border-stone-200 text-text text-sm focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                        >
                          <option value="1">{dict.form.guestsOptions['1']}</option>
                          <option value="2">{dict.form.guestsOptions['2']}</option>
                          <option value="3">{dict.form.guestsOptions['3']}</option>
                          <option value="4">{dict.form.guestsOptions['4']}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-text-light text-xs font-medium mb-1">
                        {dict.form.message}
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={2}
                        value={formData.message}
                        onChange={handleChange}
                        disabled={!pricing}
                        placeholder={dict.form.messagePlaceholder}
                        className="w-full px-3 py-2 bg-cream border border-stone-200 text-text text-sm focus:outline-none focus:border-gold transition-colors resize-none disabled:opacity-50"
                      />
                    </div>

                    {/* Error */}
                    {submitStatus === 'error' && (
                      <div className="bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">{errorMessage}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !pricing}
                      className="w-full bg-gold hover:bg-gold-dark text-white py-3 text-sm tracking-widest uppercase font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {dict.form.submitting}
                        </>
                      ) : (
                        dict.form.submit
                      )}
                    </button>

                    <p className="text-text-muted text-[10px] text-center">
                      {dict.form.submitNote}
                    </p>
                  </form>

                  {/* WhatsApp alternative */}
                  <div className="mt-4 pt-4 border-t border-stone-200">
                    <a
                      href="https://wa.me/33631598400"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-stone-300 hover:border-[#25D366]/50 text-text text-xs font-medium tracking-wide uppercase transition-colors w-full"
                    >
                      <MessageCircle className="h-4 w-4 text-[#25D366]" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </Container>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-cream-dark">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                  <Star className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-2xl text-text">{dict.benefits.title}</h3>
              </div>
              <ul className="space-y-4">
                {dict.benefits.items.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-text-light">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: benefit }} />
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
              <div className="grid grid-cols-2 gap-4">
                {dict.apartment.items.map((item, index) => (
                  <div key={index} className="text-center p-4 bg-white border border-stone-200">
                    <p className="text-2xl font-serif text-gold mb-1">{item.value}</p>
                    <p className="text-text-muted text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
              <Link
                href={`/${locale}/appartement`}
                className="mt-6 flex items-center justify-center gap-2 px-6 py-3 border border-gold/30 text-gold hover:bg-gold/10 transition-all text-sm tracking-widest uppercase"
              >
                <Home className="h-4 w-4" />
                {dict.apartment.viewApartment}
              </Link>
            </AnimateOnScroll>
          </div>
        </Container>
      </section>

      {/* Airbnb Alternative */}
      <section className="py-16 bg-cream">
        <Container size="md">
          <AnimateOnScroll className="text-center">
            <div className="bg-white border border-stone-200 p-8">
              <p className="text-text-muted text-sm mb-4">{dict.airbnb.preferPlatform}</p>
              <a
                href={(() => {
                  const baseUrl = 'https://www.airbnb.fr/rooms/618442543008929958';
                  const params = new URLSearchParams();
                  if (selection.checkIn) params.set('check_in', selection.checkIn);
                  if (selection.checkOut) params.set('check_out', selection.checkOut);
                  if (formData.guests) params.set('adults', formData.guests);
                  const queryString = params.toString();
                  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-text hover:text-[#FF5A5F] transition-colors"
              >
                <svg className="h-6 w-6 text-[#FF5A5F]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.379c-.718 2.292-2.9 4.782-6.894 6.621-3.994-1.839-6.176-4.329-6.894-6.621-.598-1.91-.139-3.595 1.14-4.542 1.085-.805 2.523-.881 3.754-.281.693.339 1.286.843 1.737 1.477.196.276.372.569.527.878.155-.309.331-.602.527-.878.451-.634 1.044-1.138 1.737-1.477 1.231-.6 2.669-.524 3.754.281 1.279.947 1.738 2.632 1.14 4.542h-.528z"/>
                </svg>
                <span className="font-serif text-lg">{dict.airbnb.viewOnAirbnb}</span>
              </a>
              <p className="text-text-muted text-xs mt-4">{dict.airbnb.note}</p>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>
    </>
  );
};
