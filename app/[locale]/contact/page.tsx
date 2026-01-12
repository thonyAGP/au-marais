import { getDictionary } from '@/lib/i18n/dictionaries';
import { GeneralInquiryForm } from '@/components/contact';
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
      <GeneralInquiryForm dict={dict.contactGeneral} locale={locale} />
    </div>
  );
}
