'use client';

import { useState } from 'react';
import { Container, Button } from '@/components/ui';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '33631598400';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Build WhatsApp message
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
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="py-24 bg-stone-100">
        <Container>
          <h1 className="font-serif text-5xl text-stone-900 mb-6 text-center">
            Contact
          </h1>
          <p className="text-stone-600 text-center max-w-2xl mx-auto text-lg">
            Une question ? Une demande de réservation ? N&apos;hésitez pas à nous
            contacter, nous vous répondrons dans les plus brefs délais.
          </p>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <Container>
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="font-serif text-2xl text-stone-900 mb-8">
                Nos coordonnées
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-stone-900 font-medium mb-1">WhatsApp</p>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-[#25D366] transition-colors"
                    >
                      +33 6 31 59 84 00
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-stone-900 font-medium mb-1">Téléphone</p>
                    <a
                      href="tel:+33631598400"
                      className="text-stone-600 hover:text-gold transition-colors"
                    >
                      +33 6 31 59 84 00
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-stone-900 font-medium mb-1">Email</p>
                    <a
                      href="mailto:contact@au-marais.fr"
                      className="text-stone-600 hover:text-gold transition-colors"
                    >
                      contact@au-marais.fr
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-stone-900 font-medium mb-1">Adresse</p>
                    <p className="text-stone-600">
                      Rue François Miron
                      <br />
                      75004 Paris
                    </p>
                  </div>
                </div>
              </div>

              {/* Airbnb Link */}
              <div className="mt-12 p-6 bg-white rounded-lg border border-stone-200">
                <p className="text-stone-600 text-sm mb-4">
                  Vous pouvez également réserver directement sur Airbnb :
                </p>
                <a
                  href="https://www.airbnb.fr/rooms/618442543008929958"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-gold hover:text-gold-dark transition-colors font-medium"
                >
                  Voir sur Airbnb →
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 md:p-12 rounded-lg border border-stone-200">
                <h2 className="font-serif text-2xl text-stone-900 mb-8">
                  Demande de réservation
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-stone-700 text-sm font-medium mb-2"
                      >
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-stone-700 text-sm font-medium mb-2"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-stone-700 text-sm font-medium mb-2"
                    >
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                      placeholder="+33 6 XX XX XX XX"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="arrival"
                        className="block text-stone-700 text-sm font-medium mb-2"
                      >
                        Date d&apos;arrivée *
                      </label>
                      <input
                        type="date"
                        id="arrival"
                        name="arrival"
                        required
                        value={formData.arrival}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="departure"
                        className="block text-stone-700 text-sm font-medium mb-2"
                      >
                        Date de départ *
                      </label>
                      <input
                        type="date"
                        id="departure"
                        name="departure"
                        required
                        value={formData.departure}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="guests"
                      className="block text-stone-700 text-sm font-medium mb-2"
                    >
                      Nombre de voyageurs *
                    </label>
                    <select
                      id="guests"
                      name="guests"
                      required
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="1">1 voyageur</option>
                      <option value="2">2 voyageurs</option>
                      <option value="3">3 voyageurs</option>
                      <option value="4">4 voyageurs</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-stone-700 text-sm font-medium mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors resize-none"
                      placeholder="Des questions ou des demandes particulières ?"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#25D366] hover:bg-[#128C7E]"
                  >
                    Envoyer via WhatsApp
                    <MessageCircle className="ml-2 h-5 w-5" />
                  </Button>

                  <p className="text-stone-400 text-xs text-center">
                    En cliquant, WhatsApp s&apos;ouvrira avec votre message pré-rempli
                  </p>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <Container size="md">
          <h2 className="font-serif text-3xl text-stone-900 mb-12 text-center">
            Questions fréquentes
          </h2>

          <div className="space-y-6">
            <div className="bg-cream p-6 rounded-lg">
              <h3 className="text-stone-900 font-medium mb-2">
                Quels sont les horaires d&apos;arrivée et de départ ?
              </h3>
              <p className="text-stone-600 text-sm">
                Check-in à partir de 15h, check-out avant 11h. Des aménagements
                sont possibles selon les disponibilités.
              </p>
            </div>

            <div className="bg-cream p-6 rounded-lg">
              <h3 className="text-stone-900 font-medium mb-2">
                Y a-t-il un ascenseur ?
              </h3>
              <p className="text-stone-600 text-sm">
                Non, l&apos;appartement est situé au 2ème étage d&apos;un immeuble
                historique du 17ème siècle, sans ascenseur.
              </p>
            </div>

            <div className="bg-cream p-6 rounded-lg">
              <h3 className="text-stone-900 font-medium mb-2">
                Le WiFi est-il inclus ?
              </h3>
              <p className="text-stone-600 text-sm">
                Oui, le WiFi haut débit est inclus et accessible dans tout
                l&apos;appartement.
              </p>
            </div>

            <div className="bg-cream p-6 rounded-lg">
              <h3 className="text-stone-900 font-medium mb-2">
                Puis-je annuler ma réservation ?
              </h3>
              <p className="text-stone-600 text-sm">
                Les conditions d&apos;annulation dépendent de la plateforme de
                réservation. Contactez-nous pour plus de détails.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
