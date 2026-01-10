import { getDictionary } from '@/lib/i18n/dictionaries';
import { ContactForm } from '@/components/contact';
import type { Locale } from '@/lib/i18n/config';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="min-h-screen bg-cream">
      <ContactForm dict={dict.contact} locale={locale} />
    </div>
  );
}
