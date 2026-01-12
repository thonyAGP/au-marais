'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container, AnimateOnScroll } from '@/components/ui';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Calendar,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const WHATSAPP_NUMBER = '33631598400';

interface ContactDict {
  hero: {
    sectionTitle: string;
    title: string;
    description: string;
  };
  info: {
    sectionTitle: string;
    whatsapp: string;
    phone: string;
    email: string;
    address: string;
  };
  links: {
    booking: string;
    airbnb: string;
  };
  form: {
    sectionTitle: string;
    title: string;
    subtitle: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    subjectOptions: {
      apartment: string;
      neighborhood: string;
      special: string;
      other: string;
    };
    message: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    submitNote: string;
    success: string;
    successMessage: string;
    error: string;
  };
  faq: {
    sectionTitle: string;
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  bookingCta: {
    title: string;
    description: string;
    button: string;
  };
}

interface GeneralInquiryFormProps {
  dict: ContactDict;
  locale: string;
}

export const GeneralInquiryForm = ({ dict, locale }: GeneralInquiryFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          locale,
          type: 'inquiry',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
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
                {dict.hero.title}
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
              {dict.hero.title}
            </h1>
            <p className="text-text-muted max-w-2xl mx-auto text-lg">
              {dict.hero.description}
            </p>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Booking CTA Banner */}
      <section className="bg-gold/10 border-y border-gold/30">
        <Container>
          <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-6 w-6 text-gold" />
              <div>
                <h3 className="font-medium text-text">{dict.bookingCta.title}</h3>
                <p className="text-text-muted text-sm">{dict.bookingCta.description}</p>
              </div>
            </div>
            <Link
              href={`/${locale}/reserver`}
              className="px-6 py-3 bg-gold hover:bg-gold-dark text-white text-sm font-medium tracking-wide uppercase transition-colors"
            >
              {dict.bookingCta.button}
            </Link>
          </div>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-cream">
        <Container>
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <AnimateOnScroll className="lg:col-span-1">
              <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-6">
                {dict.info.sectionTitle}
              </p>

              <div className="space-y-6">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-white border border-stone-200 hover:border-[#25D366]/50 transition-all group"
                >
                  <div className="w-12 h-12 bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-text font-medium mb-1 group-hover:text-[#25D366] transition-colors">{dict.info.whatsapp}</p>
                    <p className="text-text-muted">+33 6 31 59 84 00</p>
                  </div>
                </a>

                <a
                  href="tel:+33631598400"
                  className="flex items-start gap-4 p-4 bg-white border border-stone-200 hover:border-gold/50 transition-all group"
                >
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-text font-medium mb-1 group-hover:text-gold transition-colors">{dict.info.phone}</p>
                    <p className="text-text-muted">+33 6 31 59 84 00</p>
                  </div>
                </a>

                <a
                  href="mailto:contact@au-marais.fr"
                  className="flex items-start gap-4 p-4 bg-white border border-stone-200 hover:border-gold/50 transition-all group"
                >
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-text font-medium mb-1 group-hover:text-gold transition-colors">{dict.info.email}</p>
                    <p className="text-text-muted">contact@au-marais.fr</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 bg-white border border-stone-200">
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-text font-medium mb-1">{dict.info.address}</p>
                    <p className="text-text-muted">
                      Rue François Miron<br />
                      75004 Paris
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="mt-8 space-y-4">
                <Link
                  href={`/${locale}/reserver`}
                  className="flex items-center gap-3 p-4 bg-gold/10 border border-gold/30 hover:border-gold/60 transition-all group"
                >
                  <Calendar className="h-5 w-5 text-gold" />
                  <span className="text-text font-medium group-hover:text-gold transition-colors">{dict.links.booking}</span>
                </Link>

                <a
                  href="https://www.airbnb.fr/rooms/618442543008929958"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-white border border-stone-200 hover:border-stone-300 transition-all group"
                >
                  <svg className="h-5 w-5 text-[#FF5A5F]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.379c-.718 2.292-2.9 4.782-6.894 6.621-3.994-1.839-6.176-4.329-6.894-6.621-.598-1.91-.139-3.595 1.14-4.542 1.085-.805 2.523-.881 3.754-.281.693.339 1.286.843 1.737 1.477.196.276.372.569.527.878.155-.309.331-.602.527-.878.451-.634 1.044-1.138 1.737-1.477 1.231-.6 2.669-.524 3.754.281 1.279.947 1.738 2.632 1.14 4.542h-.528z"/>
                  </svg>
                  <span className="text-text group-hover:text-[#FF5A5F] transition-colors">{dict.links.airbnb}</span>
                </a>
              </div>
            </AnimateOnScroll>

            {/* Contact Form */}
            <AnimateOnScroll delay={200} className="lg:col-span-2">
              <div className="bg-white border border-stone-200 p-8 md:p-12">
                <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
                  {dict.form.sectionTitle}
                </p>
                <h2 className="font-serif text-2xl text-text mb-2">
                  {dict.form.title}
                </h2>
                <p className="text-text-muted text-sm mb-8">{dict.form.subtitle}</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-text-light text-sm font-medium mb-2">
                        {dict.form.name} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={dict.form.namePlaceholder}
                        className="w-full px-4 py-3 bg-cream border border-stone-200 text-text placeholder-text-muted focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-text-light text-sm font-medium mb-2">
                        {dict.form.email} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={dict.form.emailPlaceholder}
                        className="w-full px-4 py-3 bg-cream border border-stone-200 text-text placeholder-text-muted focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-text-light text-sm font-medium mb-2">
                      {dict.form.subject} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-cream border border-stone-200 text-text focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="" disabled>{dict.form.subjectPlaceholder}</option>
                      <option value="apartment">{dict.form.subjectOptions.apartment}</option>
                      <option value="neighborhood">{dict.form.subjectOptions.neighborhood}</option>
                      <option value="special">{dict.form.subjectOptions.special}</option>
                      <option value="other">{dict.form.subjectOptions.other}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-text-light text-sm font-medium mb-2">
                      {dict.form.message} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={dict.form.messagePlaceholder}
                      className="w-full px-4 py-3 bg-cream border border-stone-200 text-text placeholder-text-muted focus:outline-none focus:border-gold transition-colors resize-none"
                    />
                  </div>

                  {submitStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">{dict.form.error}</p>
                        <p className="text-sm text-red-600">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gold hover:bg-gold-dark text-white py-4 text-sm tracking-widest uppercase font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {dict.form.submitting}
                      </>
                    ) : (
                      dict.form.submit
                    )}
                  </button>

                  <p className="text-text-muted text-xs text-center">
                    {dict.form.submitNote}
                  </p>
                </form>
              </div>
            </AnimateOnScroll>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-cream-dark">
        <Container size="md">
          <AnimateOnScroll className="text-center mb-12">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              {dict.faq.sectionTitle}
            </p>
            <h2 className="font-serif text-4xl text-text">
              {dict.faq.title}
            </h2>
          </AnimateOnScroll>

          <div className="space-y-4">
            {dict.faq.items.map((faq, index) => (
              <AnimateOnScroll key={index} delay={index * 50}>
                <div className="bg-white border border-stone-200">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-cream transition-colors"
                  >
                    <span className="text-text font-medium pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-gold flex-shrink-0 transition-transform duration-300 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? 'max-h-40' : 'max-h-0'
                    }`}
                  >
                    <p className="px-6 pb-6 text-text-light text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
};
