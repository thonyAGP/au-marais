'use client';

import { useState } from 'react';
import { Star, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, AnimateOnScroll } from '@/components/ui';

interface TestimonialFormDict {
  title: string;
  subtitle?: string;
  name: string;
  namePlaceholder: string;
  location: string;
  locationPlaceholder: string;
  rating: string;
  ratingHint: string;
  text: string;
  textPlaceholder: string;
  textHint: string;
  submit: string;
  submitting: string;
  success: string;
  successMessage: string;
  error: string;
  errorGeneric: string;
  required: string;
}

interface TestimonialFormProps {
  dict: TestimonialFormDict;
  locale: string;
}

export const TestimonialForm = ({ dict, locale }: TestimonialFormProps) => {
  const [formData, setFormData] = useState({
    authorName: '',
    authorLocation: '',
    rating: 5,
    text: '',
  });
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingClick = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          language: locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || dict.errorGeneric);
      }

      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : dict.errorGeneric
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitStatus === 'success') {
    return (
      <div className="bg-white border border-stone-200 p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-serif text-text mb-2">{dict.success}</h3>
        <p className="text-text-muted">{dict.successMessage}</p>
      </div>
    );
  }

  const displayRating = hoveredRating !== null ? hoveredRating : formData.rating;

  return (
    <div className="bg-white border border-stone-200 p-8 md:p-12">
      <AnimateOnScroll>
        <h2 className="font-serif text-2xl text-text mb-2">{dict.title}</h2>
        {dict.subtitle && (
          <p className="text-text-muted text-sm mb-8">{dict.subtitle}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name and Location */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="authorName"
                className="block text-text-light text-sm font-medium mb-2"
              >
                {dict.name} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="authorName"
                name="authorName"
                required
                value={formData.authorName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-cream border border-stone-200 text-text placeholder-text-muted focus:outline-none focus:border-gold transition-colors"
                placeholder={dict.namePlaceholder}
              />
            </div>
            <div>
              <label
                htmlFor="authorLocation"
                className="block text-text-light text-sm font-medium mb-2"
              >
                {dict.location}
              </label>
              <input
                type="text"
                id="authorLocation"
                name="authorLocation"
                value={formData.authorLocation}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-cream border border-stone-200 text-text placeholder-text-muted focus:outline-none focus:border-gold transition-colors"
                placeholder={dict.locationPlaceholder}
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-text-light text-sm font-medium mb-2">
              {dict.rating} <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="p-1 focus:outline-none focus:ring-2 focus:ring-gold/50 rounded transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= displayRating
                        ? 'text-gold fill-gold'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-text-muted text-sm">
                {displayRating}/5
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">{dict.ratingHint}</p>
          </div>

          {/* Text */}
          <div>
            <label
              htmlFor="text"
              className="block text-text-light text-sm font-medium mb-2"
            >
              {dict.text} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="text"
              name="text"
              required
              rows={5}
              minLength={10}
              value={formData.text}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-cream border border-stone-200 text-text placeholder-text-muted focus:outline-none focus:border-gold transition-colors resize-none"
              placeholder={dict.textPlaceholder}
            />
            <p className="text-xs text-text-muted mt-1">
              {dict.textHint} ({formData.text.length}/10 min)
            </p>
          </div>

          {/* Error message */}
          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">{dict.error}</p>
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || formData.text.length < 10}
            className="w-full bg-gold hover:bg-gold-dark text-white py-4 text-sm tracking-widest uppercase font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {dict.submitting}
              </>
            ) : (
              dict.submit
            )}
          </Button>
        </form>
      </AnimateOnScroll>
    </div>
  );
};
