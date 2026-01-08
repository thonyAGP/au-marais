'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container, Button, AnimateOnScroll } from '@/components/ui';
import { Phone, Mail, MapPin, MessageCircle, Calendar, ChevronDown } from 'lucide-react';

const WHATSAPP_NUMBER = '33631598400';

const faqs = [
  {
    question: 'Quels sont les horaires d\'arrivée et de départ ?',
    answer: 'Check-in à partir de 15h, check-out avant 11h. Des aménagements sont possibles selon les disponibilités.',
  },
  {
    question: 'Y a-t-il un ascenseur ?',
    answer: 'Non, l\'appartement est situé au 2ème étage d\'un immeuble historique du 17ème siècle, sans ascenseur.',
  },
  {
    question: 'Le WiFi est-il inclus ?',
    answer: 'Oui, le WiFi haut débit est inclus et accessible dans tout l\'appartement.',
  },
  {
    question: 'Puis-je annuler ma réservation ?',
    answer: 'Les conditions d\'annulation dépendent de la plateforme de réservation. Contactez-nous pour plus de détails.',
  },
];

export default function ContactPage() {
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
      `🏠 *Demande de réservation - Au Marais*`,
      ``,
      `👤 *Nom :* ${formData.name}`,
      `📧 *Email :* ${formData.email}`,
      formData.phone ? `📱 *Téléphone :* ${formData.phone}` : '',
      ``,
      `📅 *Arrivée :* ${formData.arrival}`,
      `📅 *Départ :* ${formData.departure}`,
      `👥 *Voyageurs :* ${formData.guests}`,
      formData.message ? `\n💬 *Message :*\n${formData.message}` : '',
    ].filter(Boolean).join('\n');

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero */}
      <section className="py-24 bg-dark-lighter">
        <Container>
          <AnimateOnScroll className="text-center">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              Nous contacter
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-white mb-6">
              Contact
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              Une question ? Une demande de réservation ? N&apos;hésitez pas à nous
              contacter, nous vous répondrons dans les plus brefs délais.
            </p>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-dark">
        <Container>
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <AnimateOnScroll className="lg:col-span-1">
              <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-6">
                Coordonnées
              </p>

              <div className="space-y-6">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-dark-card border border-white/5 hover:border-[#25D366]/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1 group-hover:text-[#25D366] transition-colors">WhatsApp</p>
                    <p className="text-white/50">+33 6 31 59 84 00</p>
                  </div>
                </a>

                <a
                  href="tel:+33631598400"
                  className="flex items-start gap-4 p-4 bg-dark-card border border-white/5 hover:border-gold/30 transition-all group"
                >
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1 group-hover:text-gold transition-colors">Téléphone</p>
                    <p className="text-white/50">+33 6 31 59 84 00</p>
                  </div>
                </a>

                <a
                  href="mailto:contact@au-marais.fr"
                  className="flex items-start gap-4 p-4 bg-dark-card border border-white/5 hover:border-gold/30 transition-all group"
                >
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1 group-hover:text-gold transition-colors">Email</p>
                    <p className="text-white/50">contact@au-marais.fr</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 bg-dark-card border border-white/5">
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Adresse</p>
                    <p className="text-white/50">
                      Rue François Miron<br />
                      75004 Paris
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="mt-8 space-y-4">
                <Link
                  href="/disponibilites"
                  className="flex items-center gap-3 p-4 bg-dark-card border border-gold/20 hover:border-gold/40 transition-all group"
                >
                  <Calendar className="h-5 w-5 text-gold" />
                  <span className="text-white group-hover:text-gold transition-colors">Voir les disponibilités</span>
                </Link>

                <a
                  href="https://www.airbnb.fr/rooms/618442543008929958"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-dark-card border border-white/5 hover:border-white/20 transition-all group"
                >
                  <svg className="h-5 w-5 text-[#FF5A5F]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.379c-.718 2.292-2.9 4.782-6.894 6.621-3.994-1.839-6.176-4.329-6.894-6.621-.598-1.91-.139-3.595 1.14-4.542 1.085-.805 2.523-.881 3.754-.281.693.339 1.286.843 1.737 1.477.196.276.372.569.527.878.155-.309.331-.602.527-.878.451-.634 1.044-1.138 1.737-1.477 1.231-.6 2.669-.524 3.754.281 1.279.947 1.738 2.632 1.14 4.542h-.528z"/>
                  </svg>
                  <span className="text-white group-hover:text-[#FF5A5F] transition-colors">Réserver sur Airbnb</span>
                </a>
              </div>
            </AnimateOnScroll>

            {/* Contact Form */}
            <AnimateOnScroll delay={200} className="lg:col-span-2">
              <div className="bg-dark-card border border-white/5 p-8 md:p-12">
                <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
                  Formulaire
                </p>
                <h2 className="font-serif text-2xl text-white mb-8">
                  Demande de réservation
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-white/70 text-sm font-medium mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-dark border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-white/70 text-sm font-medium mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-dark border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-white/70 text-sm font-medium mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-dark border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
                      placeholder="+33 6 XX XX XX XX"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="arrival" className="block text-white/70 text-sm font-medium mb-2">
                        Date d&apos;arrivée *
                      </label>
                      <input
                        type="date"
                        id="arrival"
                        name="arrival"
                        required
                        value={formData.arrival}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-dark border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="departure" className="block text-white/70 text-sm font-medium mb-2">
                        Date de départ *
                      </label>
                      <input
                        type="date"
                        id="departure"
                        name="departure"
                        required
                        value={formData.departure}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-dark border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="guests" className="block text-white/70 text-sm font-medium mb-2">
                      Nombre de voyageurs *
                    </label>
                    <select
                      id="guests"
                      name="guests"
                      required
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-dark border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="" className="bg-dark">Sélectionnez</option>
                      <option value="1" className="bg-dark">1 voyageur</option>
                      <option value="2" className="bg-dark">2 voyageurs</option>
                      <option value="3" className="bg-dark">3 voyageurs</option>
                      <option value="4" className="bg-dark">4 voyageurs</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-white/70 text-sm font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-dark border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder="Des questions ou des demandes particulières ?"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 text-sm tracking-widest uppercase font-medium"
                  >
                    Envoyer via WhatsApp
                    <MessageCircle className="ml-2 h-5 w-5" />
                  </Button>

                  <p className="text-white/30 text-xs text-center">
                    En cliquant, WhatsApp s&apos;ouvrira avec votre message pré-rempli
                  </p>
                </form>
              </div>
            </AnimateOnScroll>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-dark-card">
        <Container size="md">
          <AnimateOnScroll className="text-center mb-12">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              FAQ
            </p>
            <h2 className="font-serif text-4xl text-white">
              Questions fréquentes
            </h2>
          </AnimateOnScroll>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <AnimateOnScroll key={index} delay={index * 50}>
                <div className="bg-dark border border-white/5">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-dark-lighter transition-colors"
                  >
                    <span className="text-white font-medium pr-4">{faq.question}</span>
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
                    <p className="px-6 pb-6 text-white/60 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
