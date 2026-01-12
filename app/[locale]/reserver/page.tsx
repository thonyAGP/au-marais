import { Metadata } from 'next';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Locale } from '@/lib/i18n/config';
import { BookingPageClient } from '@/components/booking/BookingPageClient';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return {
    title: `${dict.booking.title} | Au Marais`,
    description: dict.booking.subtitle,
  };
}

export default async function ReserverPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-cream">
      <BookingPageClient
        dict={dict.booking}
        calendarDict={dict.availability.calendar}
        locale={locale}
      />
    </div>
  );
}
