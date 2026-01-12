'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ReservationFormProps {
  dict: {
    title: string;
    subtitle: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    arrival: string;
    departure: string;
    guests: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    successMessage: string;
    error: string;
    priceBreakdown: string;
    nights: string;
    nightlyRate: string;
    discount: string;
    cleaningFee: string;
    touristTax: string;
    total: string;
    depositInfo: string;
    termsAccept: string;
    requiredField: string;
  };
  locale: string;
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

export const ReservationForm = ({ dict, locale }: ReservationFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    arrivalDate: '',
    departureDate: '',
    guests: '2',
    message: '',
  });

  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate pricing when dates or guests change
  const calculatePrice = useCallback(() => {
    if (!formData.arrivalDate || !formData.departureDate) {
      setPricing(null);
      return;
    }

    const arrival = new Date(formData.arrivalDate);
    const departure = new Date(formData.departureDate);

    if (departure <= arrival) {
      setPricing(null);
      return;
    }

    const nights = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
    const guests = parseInt(formData.guests);

    const nightlyRate = 120;
    const cleaningFee = 50;
    const touristTaxPerNight = 2.88;

    // Calculate discount
    let discountPercent = 0;
    if (nights >= 28) discountPercent = 20;
    else if (nights >= 14) discountPercent = 15;
    else if (nights >= 7) discountPercent = 10;

    const subtotal = nightlyRate * nights;
    const discount = Math.round(subtotal * (discountPercent / 100));
    const touristTax = Math.round(touristTaxPerNight * nights * guests * 100) / 100;
    const total = subtotal - discount + cleaningFee + touristTax;
    const depositSuggested = Math.max(Math.round((total * 0.3) / 50) * 50, 100);

    setPricing({
      nightlyRate,
      nights,
      subtotal,
      discount,
      discountPercent,
      cleaningFee,
      touristTax,
      total,
      depositSuggested,
    });
  }, [formData.arrivalDate, formData.departureDate, formData.guests]);

  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          guests: parseInt(formData.guests),
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit reservation');
      }

      setSubmitStatus('success');

      // Trigger WhatsApp notification for admin (opens in new tab)
      if (data._adminNotification?.whatsappUrl) {
        // Open WhatsApp in new tab to send notification
        window.open(data._adminNotification.whatsappUrl, '_blank');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get tomorrow's date for min arrival date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get min departure date (day after arrival)
  const minDeparture = formData.arrivalDate
    ? new Date(new Date(formData.arrivalDate).getTime() + 86400000).toISOString().split('T')[0]
    : minDate;

  if (submitStatus === 'success') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-serif text-text mb-2">{dict.success}</h3>
        <p className="text-text-muted">{dict.successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold to-gold-dark p-6 text-white">
        <h2 className="text-2xl font-serif">{dict.title}</h2>
        <p className="text-white/80 text-sm mt-1">{dict.subtitle}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Personal info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              {dict.firstName} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              {dict.lastName} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              {dict.email} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              {dict.phone} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+33 6 12 34 56 78"
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              {dict.arrival} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="arrivalDate"
              value={formData.arrivalDate}
              onChange={handleChange}
              min={minDate}
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              {dict.departure} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              min={minDeparture}
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              <Users className="inline h-4 w-4 mr-1" />
              {dict.guests} <span className="text-red-500">*</span>
            </label>
            <select
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-gold transition-colors bg-white"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
        </div>

        {/* Pricing breakdown */}
        {pricing && (
          <div className="bg-cream rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-text mb-3">{dict.priceBreakdown}</h3>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">
                {pricing.nights} {dict.nights} × {pricing.nightlyRate}€
              </span>
              <span>{pricing.subtotal}€</span>
            </div>
            {pricing.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{dict.discount} ({pricing.discountPercent}%)</span>
                <span>-{pricing.discount}€</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">{dict.cleaningFee}</span>
              <span>{pricing.cleaningFee}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">{dict.touristTax}</span>
              <span>{pricing.touristTax.toFixed(2)}€</span>
            </div>
            <div className="border-t border-stone-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>{dict.total}</span>
                <span className="text-gold">{pricing.total.toFixed(2)}€</span>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-2">
              {dict.depositInfo.replace('{amount}', pricing.depositSuggested.toString())}
            </p>
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            {dict.message}
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={3}
            placeholder={dict.messagePlaceholder}
            className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-gold transition-colors resize-none"
          />
        </div>

        {/* Error message */}
        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">{dict.error}</p>
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !pricing}
          className="w-full bg-gold text-white py-4 rounded-lg font-medium hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {dict.submitting}
            </>
          ) : (
            dict.submit
          )}
        </button>

        <p className="text-xs text-text-muted text-center">
          {dict.termsAccept}
        </p>
      </div>
    </form>
  );
};
