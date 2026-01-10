'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container, Button, AnimateOnScroll } from '@/components/ui';
import { Phone, Mail, MapPin, MessageCircle, Calendar, ChevronDown } from 'lucide-react';

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
    availability: string;
    airbnb: string;
  };
  form: {
    sectionTitle: string;
    title: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    arrival: string;
    departure: string;
    guests: string;
    guestsPlaceholder: string;
    guestsOptions: {
      '1': string;
      '2': string;
      '3': string;
      '4': string;
    };
    message: string;
    messagePlaceholder: string;
    submit: string;
    submitNote: string;
  };
  faq: {
    sectionTitle: string;
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
}

interface ContactFormProps {
  dict: ContactDict;
  locale: string;
}

export const ContactForm = ({ dict, locale }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    arrival: '',
    departure: '',
    guests: '',
    message: '',
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const lines = [
      `🏠 *Booking Request - Au Marais*`,
      ``,
      `👤 *${dict.form.name}:* ${formData.name}`,
      `📧 *${dict.form.email}:* ${formData.email}`,
      formData.phone ? `📱 *${dict.form.phone}:* ${formData.phone}` : '',
      ``,
      `📅 *${dict.form.arrival}:* ${formData.arrival}`,
      `📅 *${dict.form.departure}:* ${formData.departure}`,
      `👥 *${dict.form.guests}:* ${formData.guests}`,
      formData.message ? `\n💬 *${dict.form.message}:*\n${formData.message}` : '',
    ].filter(Boolean).join('\n');

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(whatsappUrl, '_blank');
  };

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
                  href={`/${locale}/disponibilites`}
                  className="flex items-center gap-3 p-4 bg-white border border-gold/30 hover:border-gold/60 transition-all group"
                >
                  <Calendar className="h-5 w-5 text-gold" />
                  <span className="text-text group-hover:text-gold transition-colors">{dict.links.availability}</span>
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
                <h2 className="font-serif text-2xl text-text mb-8">
                  {dict.form.title}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-text-light text-sm font-medium mb-2">
                        {dict.form.name} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-cream border border-stone-200 text-text placeholder-text-muted focus:outline-none focus:border-gold transition-colors"
                        placeholder={dict.form.namePlaceholder}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-text-light text-sm font-medium mb-2">
                        {dict.form.email} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-cream border border-stone-200 text-text placeholder-text-muted focus:outline-none focus:border-gold transition-colors"
                        placeholder={dict.form.emailPlaceholder}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-text-light text-sm font-medium mb-2">
                      {dict.form.phone}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-cream border border-stone-200 text-text placeholder-text-muted focus:outline-none focus:border-gold transition-colors"
                      placeholder={dict.form.phonePlaceholder}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="arrival" className="block text-text-light text-sm font-medium mb-2">
                        {dict.form.arrival} *
                      </label>
                      <input
                        type="date"
                        id="arrival"
                        name="arrival"
                        required
                        value={formData.arrival}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-cream border border-stone-200 text-text focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="departure" className="block text-text-light text-sm font-medium mb-2">
                        {dict.form.departure} *
                      </label>
                      <input
                        type="date"
                        id="departure"
                        name="departure"
                        required
                        value={formData.departure}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-cream border border-stone-200 text-text focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="guests" className="block text-text-light text-sm font-medium mb-2">
                      {dict.form.guests} *
                    </label>
                    <select
                      id="guests"
                      name="guests"
                      required
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-cream border border-stone-200 text-text focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="" className="bg-cream">{dict.form.guestsPlaceholder}</option>
                      <option value="1" className="bg-cream">{dict.form.guestsOptions['1']}</option>
                      <option value="2" className="bg-cream">{dict.form.guestsOptions['2']}</option>
                      <option value="3" className="bg-cream">{dict.form.guestsOptions['3']}</option>
                      <option value="4" className="bg-cream">{dict.form.guestsOptions['4']}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-text-light text-sm font-medium mb-2">
                      {dict.form.message}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-cream border border-stone-200 text-text placeholder-text-muted focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder={dict.form.messagePlaceholder}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 text-sm tracking-widest uppercase font-medium"
                  >
                    {dict.form.submit}
                    <MessageCircle className="ml-2 h-5 w-5" />
                  </Button>

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
