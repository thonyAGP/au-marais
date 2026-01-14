import { Container, AnimateOnScroll } from '@/components/ui';
import { TestimonialForm } from '@/components/testimonials';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return {
    title: dict.testimonialForm.pageTitle,
    description: dict.testimonialForm.pageDescription,
  };
}

export default async function TestimonialPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="pt-24 pb-12 bg-cream-dark">
        <Container>
          <AnimateOnScroll className="text-center">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              Au Marais
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-text mb-4">
              {dict.testimonialForm.pageTitle}
            </h1>
            <p className="text-text-muted max-w-2xl mx-auto">
              {dict.testimonialForm.pageDescription}
            </p>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Form */}
      <section className="py-16 bg-cream">
        <Container size="md">
          <TestimonialForm dict={dict.testimonialForm} locale={locale} />
        </Container>
      </section>
    </div>
  );
}
