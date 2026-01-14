import { Hero, Features, GalleryPreview, Hosts, Testimonials, LocalTips, VisitorMap } from '@/components/home';
import { Container, AnimateOnScroll, SuperhostBadge } from '@/components/ui';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <>
      <Hero dict={dict.hero} nav={dict.nav} common={dict.common} locale={locale} />

      {/* Stats Bar */}
      <section className="bg-white border-y border-stone-200">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {/* Superhost Badge */}
            <div className="py-6 flex items-center justify-center border-r border-stone-200 col-span-2 md:col-span-1">
              <SuperhostBadge variant="compact" labels={dict.hosts} />
            </div>
            {/* Other stats */}
            {[
              { value: '89', label: dict.stats.reviews },
              { value: 'XVIIe', label: dict.stats.century },
              { value: '200m', label: dict.stats.metro },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`py-8 text-center ${index < 2 ? 'border-r border-stone-200' : ''}`}
              >
                <div className="font-serif text-4xl text-gold mb-1">{stat.value}</div>
                <div className="text-xs tracking-[0.2em] uppercase text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Features dict={dict.features} />
      <GalleryPreview dict={dict.gallery} locale={locale} />
      <Hosts dict={dict.hosts} />
      <Testimonials dict={dict.testimonials} stats={dict.stats} />
      <LocalTips dict={dict.localTips} />
      <VisitorMap />

      {/* CTA Section */}
      <section className="py-32 bg-cream-dark relative overflow-hidden">
        {/* Decorative gold elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-gold/20 rounded-full" />
        </div>

        <AnimateOnScroll className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-6">
            {dict.cta.sectionTitle}
          </p>
          <h2 className="font-serif text-4xl md:text-6xl text-text mb-8">
            {dict.cta.title}
          </h2>
          <p className="text-text-light mb-12 text-lg max-w-2xl mx-auto leading-relaxed">
            {dict.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center px-10 py-5 bg-gold text-white font-medium text-sm tracking-widest uppercase hover:bg-gold-dark transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(201,169,98,0.25)]"
            >
              {dict.cta.bookDirect}
            </a>
            <a
              href="https://www.airbnb.fr/rooms/618442543008929958"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-10 py-5 border border-text/20 text-text font-medium text-sm tracking-widest uppercase hover:border-gold hover:text-gold transition-all duration-300 hover:-translate-y-1"
            >
              {dict.cta.viewAirbnb}
            </a>
          </div>
        </AnimateOnScroll>
      </section>
    </>
  );
}
